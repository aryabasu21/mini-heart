# Just For You ✨

A cute, low-pressure surprise site built with React, Vite, TypeScript, Express, Supabase and an installable-app-friendly layout.

## Run locally

1. Copy `server/.env.example` to `server/.env` and set `ALLOWED_NAMES`, `JWT_SECRET`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.
2. Install from the repository root with `npm install`.
3. Start the server with `npm run dev --workspace server`.
4. Start the client with `npm run dev --workspace client`.

Run the SQL in `supabase/schema.sql` in the Supabase SQL editor before using the unlock and message endpoints. If the server reports `Could not find the table 'public.unlock_logs'`, the SQL has not been run in this project yet. The service-role key is server-only; the client may use only the publishable key.

## Media and music configuration

- Copy `client/.env.example` to `client/.env`.
- Create a **private** Supabase Storage bucket matching `VITE_SUPABASE_STORAGE_BUCKET`. The Express server protects gallery/video paths with the JWT cookie and returns short-lived signed URLs; do not make this bucket public.
- Put gallery filenames in `client/src/content/config.ts` under `gallery`.
- To upload pictures: Supabase Dashboard -> Storage -> create `surprise-media` -> Upload files. The current config expects `her-image-01.jpg` and `her-image-02.jpg` in the bucket root.
- To upload videos: use the same private bucket and upload `.mp4` files. The current config expects `moment-01.mp4`; videos render muted, autoplaying, looping, and inline.
- Update `client/src/content/config.ts` if you use folders such as `gallery/her-image-01.jpg` or `videos/moment-01.mp4`.
- Focus mode contains pre-added local/royalty-free tracks with title, artist, duration, thumbnail, and `audioSrc`. Replace those files and metadata in `client/src/content/config.ts`.
- Replace `audio/bg-music.wav`, `audio/focus-rain.wav`, and `audio/focus-lofi.wav` with your own royalty-free files when ready.


## Personalize before sharing

1. Replace `displayName` in `client/src/content/config.ts`.
2. Add her real compliments.
3. Replace the three gallery placeholders with your Supabase Storage media paths.
4. Replace the included gentle placeholder at `client/public/audio/bg-music.wav` with your own royalty-free track (or update the playlist source).
5. Update the exam-season notes in the content config.
6. Add your own captions.
7. Expand the wish messages.
8. Configure `ALLOWED_NAMES` server-side.
9. Add Resend credentials and verify the sender domain.
10. Set a production `CLIENT_URL`, `JWT_SECRET`, Supabase project credentials, `SUPABASE_STORAGE_BUCKET`, and `MY_NAME` (the name used in email greetings/sign-offs).
11. In Resend, verify the domain used by `MAIL_FROM`. A personal address such as Outlook/Gmail may be rejected; use a verified domain address, for example `Just For You <hello@your-verified-domain.com>`. The server logs the Resend message ID for both unlock and postbox emails.

## Free hosting recommendation

Use **Vercel for the client and Render for the Express server**, with Supabase for database and private storage. Vercel is a smooth free host for the Vite frontend; Render can run the existing Node server without a rewrite. Set `VITE_API_URL` on Vercel to the Render API URL, `CLIENT_URL` on Render to the Vercel URL, and put the server-only Supabase service-role key only in Render environment variables.

Cloudflare Pages is good for the client, but it does not run this Express server. Choose Cloudflare Pages only after moving the API to Supabase Edge Functions or another serverless runtime.

## Assumptions

- “Sunshine” is a warm placeholder and is not intended to be the final name.
- The initial pass keeps the experience lightweight and dependency-safe while establishing all major content sections and API contracts.
- Protected media, full game persistence, and production PWA caching can be layered onto the existing authenticated API without changing the visual structure.
