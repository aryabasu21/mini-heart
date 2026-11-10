// EDIT ME: replace placeholder copy, storage paths, and focus metadata before sharing.
export type FocusTrack = { id: string; title: string; artist: string; duration: string; thumbnail: string; audioSrc: string; minutes: number }
export type CareTheme = {
  id: string
  sectionLabel: string
  title: string
  titleEmphasis: string
  titleEmoji: string
  intro: string
  note: string
  noteSign: string
  stamp: string[]
  runningLabel: string
  idleLabel: string
  startLabel: string
  pauseLabel: string
  reminders: string[]
  modalLabel: string
  modalTitle: string
  finalNote: string
  letterTitle: string
  letterBody: string
}

const defaultCareTheme: CareTheme = {
  id: "default",
  sectionLabel: "01 / a little care",
  title: "For your lovely",
  titleEmphasis: "day",
  titleEmoji: "🌸",
  intro: "A tiny pause from the ordinary, made just to put a little smile on your face.",
  note: "No occasion needed. I just wanted you to have a soft little corner to visit whenever you feel like it.",
  noteSign: "— your tiny cheer squad",
  stamp: ["YOU", "ARE", "LOVELY"],
  runningLabel: "bunny is keeping you company",
  idleLabel: "tiny pause",
  startLabel: "start a little pause",
  pauseLabel: "pause for now",
  reminders: ["💧 have some water?", "🌿 take a soft breath", "🍪 snack science says yes"],
  modalLabel: "little pause setup",
  modalTitle: "Make a tiny",
  finalNote: "Hope this little corner made your day a bit softer. No pressure, just good vibes.",
  letterTitle: "Open when you need a smile",
  letterBody: "You are allowed to have a soft day. Here is a tiny reminder that someone is quietly cheering for you.",
}

export const careThemes: Record<string, CareTheme> = {
  default: defaultCareTheme,
  exam: {
    ...defaultCareTheme,
    id: "exam",
    sectionLabel: "01 / care package",
    title: "For your exam-season",
    titleEmphasis: "brain",
    intro: "I know your exams are going on, so this isn't a reply-to-me site, just a little break for you.",
    note: "I miss talking to you and can't wait to meet whenever you're free, no rush. Focus on your exams, you've got this.",
    stamp: ["YOU", "GOT", "THIS"],
    runningLabel: "bunny is focusing",
    idleLabel: "focus bunny",
    startLabel: "start focus mode",
    pauseLabel: "pause focus",
    reminders: ["💧 water break?", "🧘 stretch those shoulders", "🍪 snack science says yes"],
    modalLabel: "focus setup",
    modalTitle: "Make a tiny study",
    finalNote: "Good luck with your exams. You've got this — one page, one breath, one tiny victory at a time.",
    letterTitle: "Open when exams feel heavy",
    letterBody: "One page at a time. Drink water, unclench your shoulders, and remember that a difficult chapter is not the whole story.",
  },
  birthday: {
    ...defaultCareTheme,
    id: "birthday",
    sectionLabel: "01 / birthday sparkle",
    title: "For your very",
    titleEmphasis: "special day",
    titleEmoji: "🎂",
    intro: "A tiny birthday corner with extra sparkle, just because today deserves it.",
    note: "I hope this year brings you kind people, funny moments, delicious cake, and lots of reasons to smile.",
    stamp: ["HAPPY", "BIRTH", "DAY"],
    reminders: ["🎂 cake break?", "🎈 make a wish", "✨ collect a happy moment"],
    modalLabel: "birthday pause",
    modalTitle: "Take a tiny",
    finalNote: "Happy birthday. I hope the next chapter is wonderfully, unmistakably yours.",
    letterTitle: "Open when you want a birthday wish",
    letterBody: "May today feel warm, silly, sparkly, and full of the kind of moments you want to keep.",
  },
  missing_you: {
    ...defaultCareTheme,
    id: "missing_you",
    sectionLabel: "01 / a little hello",
    title: "For when I am",
    titleEmphasis: "missing you",
    titleEmoji: "☁️",
    intro: "Not a demand for a reply — just a soft little hello waiting here whenever you feel like visiting.",
    note: "I miss talking to you and hope life is being gentle. No rush, no pressure, just a little reminder that you crossed my mind.",
    stamp: ["THINK", "OF", "YOU"],
    reminders: ["☕ take a cosy break", "🌙 look at the sky", "💌 send a tiny hello"],
    modalLabel: "cosy pause",
    modalTitle: "Make a tiny",
    finalNote: "Until we talk again, I hope there are plenty of small lovely things in your day.",
    letterTitle: "Open when you miss a familiar voice",
    letterBody: "Some people make ordinary conversations feel special. This is a tiny reminder that I remember the good bits.",
  },
  celebration: {
    ...defaultCareTheme,
    id: "celebration",
    sectionLabel: "01 / tiny celebration",
    title: "A little cheer for",
    titleEmphasis: "you",
    titleEmoji: "🎉",
    intro: "Whatever the win is, it deserves at least one tiny sparkle and a very enthusiastic bunny.",
    note: "You did a thing! Big thing, small thing, weirdly difficult thing — it still counts, and I hope you feel proud.",
    stamp: ["YOU", "DID", "IT"],
    reminders: ["🥳 victory dance?", "🍓 treat yourself", "✨ take the compliment"],
    modalLabel: "celebration pause",
    modalTitle: "Take a tiny",
    finalNote: "I hope you pause long enough to realise that you did something worth celebrating.",
    letterTitle: "Open when you need a little applause",
    letterBody: "Here it is: a tiny round of applause, a confetti toss, and a reminder that progress is still progress.",
  },
}

const apiUrl = (import.meta.env.PROD ? "" : import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, "")
export const getGalleryImageUrl = (path: string, fallbackIndex: number) =>
  path.startsWith("http") ? path : `${apiUrl}/api/media/${path.split("/").map(encodeURIComponent).join("/")}`
export const getProtectedMediaUrl = (path: string) =>
  `${apiUrl}/api/media/${path.split("/").map(encodeURIComponent).join("/")}`

export const content = {
  displayName: "Sunshine",
  heroSubtext: "Made this little corner just for you. No pressure, just good vibes.",
  careTheme: defaultCareTheme,
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
    { id: "rainy-window", title: "Rainy Window", artist: "Your focus playlist", duration: "25:00", thumbnail: "/focus-rain.svg", audioSrc: "/audio/focus-rain.opus", minutes: 25 },
    { id: "lofi-clouds", title: "Lofi Clouds", artist: "Your focus playlist", duration: "25:00", thumbnail: "/focus-cloud.svg", audioSrc: "/audio/focus-lofi.opus", minutes: 25 }
  ] satisfies FocusTrack[]
} as const
