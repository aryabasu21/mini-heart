// EDIT ME: replace placeholder copy, storage paths, and focus metadata before sharing.
export type FocusTrack = { id: string; title: string; artist: string; duration: string; thumbnail: string; audioSrc: string; minutes: number }

const apiUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")
export const getGalleryImageUrl = (path: string, fallbackIndex: number) =>
  path.startsWith("http") ? path : `${apiUrl}/api/media/${path.split("/").map(encodeURIComponent).join("/")}`
export const getProtectedMediaUrl = (path: string) =>
  `${apiUrl}/api/media/${path.split("/").map(encodeURIComponent).join("/")}`

export const content = {
  displayName: "Sunshine",
  heroSubtext: "Made this little corner just for you. No pressure, just good vibes.",
  examNote: "I know your exams are going on, so this isn't a reply-to-me site, just a little break for you.",
  examNoteTwo: "I miss talking to you and can't wait to meet whenever you're free, no rush. Focus on your exams, you've got this.",
  compliments: [
    ["01", "Effortlessly thoughtful", "You notice the tiny things, and somehow make them feel important."],
    ["02", "Quietly brilliant", "Your brain is doing big things, even on the days it feels like it is buffering."],
    ["03", "A lovely presence", "Talking to you makes an ordinary day feel a little more golden."]
  ],
  gallery: [
    { path: "her-image-01.jpg", alt: "A personal memory", caption: "a little joy, caught in the wild" },
    { path: "her-image-02.jpg", alt: "A personal memory", caption: "proof that soft days exist" }
  ],
  videos: [
    { path: "moment-01.mp4", title: "a tiny moving memory", caption: "muted, because the moment can speak for itself" }
  ],
  wishMessages: ["You are doing better than you think ✨", "Tiny steps still count.", "Drink some water, genius 🌸", "Your future self is cheering."],
  playlist: [{ title: "A soft little tune", src: "/audio/bg-song.mp3" }],
  focusTracks: [
    { id: "rainy-window", title: "Rainy Window", artist: "Your focus playlist", duration: "25:00", thumbnail: "/focus-rain.svg", audioSrc: "/audio/focus-rain.wav", minutes: 25 },
    { id: "lofi-clouds", title: "Lofi Clouds", artist: "Your focus playlist", duration: "25:00", thumbnail: "/focus-cloud.svg", audioSrc: "/audio/focus-lofi.wav", minutes: 25 }
  ] satisfies FocusTrack[]
} as const
