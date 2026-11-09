import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import { z } from "zod"
import UAParser from "ua-parser-js"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { Readable } from "node:stream"

const app = express()
const port = Number(process.env.PORT ?? 4000)
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173"
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "surprise-media"
app.use(helmet())
app.use(cors({ origin: clientUrl, credentials: true }))
app.use(express.json({ limit: "20kb" }))
app.use(cookieParser())
const unlockLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false })
const normalize = value => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()
const allowedNames = () => (process.env.ALLOWED_NAMES ?? "").split(",").map(normalize).filter(Boolean)
const isProduction = process.env.NODE_ENV === "production"
const tokenOptions = { httpOnly: true, sameSite: isProduction ? "none" : "lax", secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000 }

const auth = (req, res, next) => {
  try {
    const token = req.cookies.surprise_token
    if (!token) return res.status(401).json({ message: "Please unlock the surprise first." })
    req.viewer = jwt.verify(token, process.env.JWT_SECRET ?? "development-secret")
    next()
  } catch { res.status(401).json({ message: "Your surprise session has expired." }) }
}

app.post("/api/auth/unlock", unlockLimiter, async (req, res) => {
  const parsed = z.object({ name: z.string().min(1).max(80), displayMode: z.string().max(30).optional() }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "Please enter a name." })
  const { name, displayMode = "browser" } = parsed.data
  const ua = new UAParser(req.headers["user-agent"])
  const device = [ua.getDevice().vendor, ua.getBrowser().name, ua.getOS().name].filter(Boolean).join(" / ") || "Unknown device"
  const matchedName = allowedNames().find(value => value === normalize(name))
  const matched = Boolean(matchedName)
  await writeSupabase("unlock_logs", {
    name_entered: name,
    matched,
    ip: req.ip,
    user_agent: req.headers["user-agent"] ?? null,
    device,
    display_mode: displayMode,
  }, "Unlock log failed")
  if (!matched) return res.status(401).json({ message: "Hmm, that key didn't quite fit. Try once more ✨" })
  const token = jwt.sign({ name: matchedName }, process.env.JWT_SECRET ?? "development-secret", { expiresIn: "7d" })
  res.cookie("surprise_token", token, tokenOptions).json({ ok: true })
  void sendUnlockEmail({ name, matchedName, device, displayMode }).catch(error => {
    console.error("Unlock email dispatch failed", error)
  })
})

app.get("/api/auth/me", auth, (req, res) => res.json({ name: req.viewer.name }))
app.get("/api/media/list", auth, async (_req, res) => {
  if (!supabase) return res.status(503).json({ message: "Private media is not configured." })
  const bucket = supabase.storage.from(storageBucket)
  const listPhotos = async (prefix = "", depth = 0) => {
    const { data, error } = await bucket.list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" }
    })
    if (error) throw error
    const result = []
    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null && depth < 3) result.push(...await listPhotos(path, depth + 1))
      else if (/\.(avif|gif|jpe?g|png|webp)$/i.test(item.name)) {
        result.push({
          path,
          alt: "A personal memory",
          caption: item.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
        })
      }
    }
    return result
  }
  let photos
  try {
    photos = await listPhotos()
  } catch (error) {
    console.error(`Private media listing failed for bucket "${storageBucket}":`, error.message)
    return res.status(502).json({ message: "The memory shelf is taking a tiny nap." })
  }
  res.setHeader("Cache-Control", "no-store")
  return res.json({ photos })
})
app.get(/^\/api\/media\/(.+)$/, auth, async (req, res) => {
  if (!supabase) return res.status(503).json({ message: "Private media is not configured." })
  const path = req.params[0]
  if (!path || path.includes("..")) return res.status(400).json({ message: "Invalid media path." })
  const { data, error } = await supabase.storage.from(storageBucket).createSignedUrl(path, 60 * 10)
  if (error || !data?.signedUrl) {
    console.error(`Private media URL failed for bucket "${storageBucket}" and path "${path}":`, error?.message ?? "No signed URL returned")
    return res.status(404).json({ message: "That little memory could not be found." })
  }
  const mediaResponse = await fetch(data.signedUrl)
  if (!mediaResponse.ok || !mediaResponse.body) {
    console.error(`Private media download failed for "${path}": HTTP ${mediaResponse.status}`)
    return res.status(404).json({ message: "That little memory could not be downloaded." })
  }
  res.setHeader("Content-Type", mediaResponse.headers.get("content-type") ?? "application/octet-stream")
  res.setHeader("Cache-Control", "private, max-age=300")
  const contentLength = mediaResponse.headers.get("content-length")
  if (contentLength) res.setHeader("Content-Length", contentLength)
  Readable.fromWeb(mediaResponse.body).pipe(res)
})
app.post("/api/messages", auth, async (req, res) => {
  const parsed = z.object({ message: z.string().min(1).max(2000) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "Please write a tiny note first." })
  const saved = await writeSupabase("messages", {
    name: req.viewer.name,
    message: parsed.data.message,
  }, "Message save failed")
  if (!saved) return res.status(500).json({ message: "The postbox is taking a little break." })
  res.status(201).json({ ok: true })
  void sendMessageEmail({ name: req.viewer.name, message: parsed.data.message }).catch(error => {
    console.error("Message email dispatch failed", error)
  })
})
app.get("/api/health", (_req, res) => res.json({ ok: true }))

async function sendUnlockEmail({ name, matchedName, device, displayMode }) {
  if (!emailConfigured("unlock")) return
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const date = formatDate()
    const safeName = escapeHtml(name)
    const recipient = escapeHtml(process.env.MY_NAME || "you")
    const subject = `✨ ${name} just opened your surprise`
    const text = `${name} just opened your little surprise for ${recipient} on ${date}. Device: ${device}. Display: ${displayMode}.`
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject,
      text,
      html: cuteEmail({
        title: "A little door just opened",
        intro: `<strong>${safeName}</strong> just stepped into the surprise you made, ${recipient} 🌸`,
        details: [["Name entered", safeName], ["Matched name", escapeHtml(matchedName)], ["When", date], ["Device", escapeHtml(device)], ["Opened in", escapeHtml(displayMode)]],
        footer: "Someone just found their tiny corner of sunshine ✨",
      }),
    })
    if (error) throw new Error(error.message ?? "Resend rejected the unlock email")
    console.log("Unlock email accepted by Resend", data?.id ?? "without an id")
  } catch (error) { console.error("Unlock email failed", error) }
}

async function sendMessageEmail({ name, message }) {
  if (!emailConfigured("message")) return
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const safeName = escapeHtml(name)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>")
    const { data, error } = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: `💌 ${name} sent you a little note`,
      text: `${name} sent you a message:\n\n${message}`,
      html: cuteEmail({
        title: "A tiny note landed",
        intro: `<strong>${safeName}</strong> left something in the little postbox 💌`,
        details: [["Message", safeMessage]],
        footer: `Delivered softly to ${escapeHtml(process.env.MY_NAME || "you")} 🌷`,
      }),
    })
    if (error) throw new Error(error.message ?? "Resend rejected the message email")
    console.log("Message email accepted by Resend", data?.id ?? "without an id")
  } catch (error) { console.error("Message email failed", error) }
}

function emailConfigured(kind) {
  const missing = ["RESEND_API_KEY", "MAIL_TO", "MAIL_FROM"].filter(name => !process.env[name])
  if (missing.length) {
    console.warn(`${kind} email skipped; missing environment variables: ${missing.join(", ")}`)
    return false
  }
  return true
}

function formatDate() {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: process.env.TZ ?? "Asia/Kolkata",
  }).format(new Date()) + " IST"
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character])
}

function cuteEmail({ title, intro, details, footer }) {
  const rows = details.map(([label, value]) => `<tr><td style="padding:10px 0;color:#9b6b87;font-size:12px;vertical-align:top">${label}</td><td style="padding:10px 0;color:#352044;font-size:14px;line-height:1.5">${value}</td></tr>`).join("")
  return `
    <div style="margin:0;background:#f4dce9;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#352044">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:auto;background:#fff9fc;border-radius:24px;overflow:hidden;box-shadow:0 12px 30px #9b638033">
        <tr><td style="background:linear-gradient(135deg,#d86f9e,#9b75c7);padding:30px;text-align:center;color:#fff">
          <div style="font-size:28px">✦ 🌸 ✦</div>
          <h1 style="margin:12px 0 0;font-size:25px;line-height:1.2">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px 30px">
          <p style="font-size:16px;line-height:1.6;margin:0 0 18px">${intro}</p>
          <table role="presentation" style="width:100%;border-top:1px solid #f0cadd">${rows}</table>
          <p style="margin:24px 0 0;padding:16px;background:#f8e6f0;border-radius:14px;text-align:center;color:#8e4d76;font-size:13px">${footer}</p>
        </td></tr>
      </table>
    </div>`
}

if (!supabase) console.warn("Supabase is not configured; database writes will be unavailable.")
if (!process.env.RESEND_API_KEY || !process.env.MAIL_TO || !process.env.MAIL_FROM) {
  console.warn("Resend is not fully configured; unlock and message emails will be skipped.")
}
app.listen(port, () => console.log(`Just For You server listening on ${port}`))

async function writeSupabase(table, values, label) {
  if (!supabase) return false
  const { error } = await supabase.from(table).insert(values)
  if (error) {
    if (error.code === "PGRST205") {
      console.error(`${label}: Supabase table "${table}" is missing. Run supabase/schema.sql in the Supabase SQL Editor, then restart the server.`)
    } else {
      console.error(label, error.message)
    }
    return false
  }
  return true
}
