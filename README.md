# XIO 2.0 — The Intelligence Layer for Your Ambition

**A personal intelligence ecosystem.** XIO learns how each person works, understands where they're going, and helps them get there — the "private superhero working for you" experience.

This is the complete, launch-ready product: marketing site + fully working app.

---

## 🚀 Launch it (pick one — all free)

| Method | Command / Action |
|---|---|
| **Instant local** | Double-click `index.html` |
| **Local server** | `npx serve .` or `python3 -m http.server 8080` |
| **Netlify** | Drag this folder onto [app.netlify.com/drop](https://app.netlify.com/drop) |
| **Vercel** | `npx vercel` (zero config — it's static) |
| **GitHub Pages** | Push folder → Settings → Pages → root |
| **Cloudflare Pages** | Connect repo, no build command needed |

There is **no build step, no backend, no dependency**. Everything runs client-side and persists in the visitor's browser via `localStorage` — that's the "private by design" story, and it's literally true in this build.

---

## What's inside

**The site — a 4-page cinematic experience** navigated through the **Slipstream**, a signature chromatic light-tunnel transition:

- **Home** (`#/home`) — hero with a living neural orb, The XIO Effect, beta reviews, "two doors" portal cards
- **Intelligence** (`#/intelligence`) — day-5 XIO briefing demo, animated learning-loop wheel (Interact → Anticipate), honesty/confidence/psychology principles, 6-stage evolution timeline, beta reviews
- **Systems** (`#/systems`) — synapse strip showing all 8 capabilities sharing one signal, capability grid with deep-links into the app, beta reviews
- **Pricing** (`#/pricing`) — 4-tier pricing (Core free / Pro $29 / Business $79 / Executive $199) with annual toggle, value reviews, FAQ

Ambient: a **neural-field canvas** (constellation of memory nodes with traveling pulses) runs behind everything, with parallax to the cursor. All animations respect `prefers-reduced-motion`. The **XIO wordmark** is a custom animated SVG (geometric X·I·O with orbiting electron, halo ring, periodic shine sweep, glitch on hover) used consistently across nav, footer, onboarding and the app sidebar.

**The App**
- **Conversational onboarding** — 6-question calibration that builds the initial Intelligence Profile
- **Talk to XIO** — chat with real memory extraction, "Should I remember this?" confirmation chips, and psychology-mode responses (clarity / focus / decision / action / encouragement / simplification / celebration…)
- **Today briefing** — greeting by time of day, priority, momentum streak, "Something I noticed", and the Suggested Next Move with a working **25-minute focus sprint** overlay
- **My Intelligence** — the narrative of what XIO has learned about you, with confidence levels and hedged language
- **Insights** — pattern detection with evidence + "That's right / Not quite" confirmation training
- **Memory** — full user control: view, correct, delete, add manually, export JSON, wipe. Confidence-colored.
- **Goals & Projects** — progress tracking, stall detection (feeds the next-best-action engine)
- **Content Engine** — posts, LinkedIn, emails, ads, video outlines in your adaptive tone
- **Prompt Builder** — live-assembled professional prompts + saved library
- **Prompt Packs** — 6 packs × 8 pro-grade prompts (Clarity, Growth, Content, Decisions, Sales, Performance) with Pro gating that actually works against the plan system
- **Toolkits** — 4 expandable operating frameworks (Clarity System, Momentum OS, Decision Engine, XIO Effect Playbook)
- **Settings** — identity, tone, detail level, plan, learning toggles, export, full reset

**One-click demo:** "Explore a live demo" seeds a realistic Day-5 profile so reviewers instantly see the learned-intelligence experience.

---

## Architecture (how the intelligence works)

```
Message → classify (psychology layer: what help do they need?)
        → extract (memory candidates w/ categories)
        → confirm (user approval → store, or auto if enabled)
        → reinforce (repeats raise confidence)
        → weave (relevant memories shape the reply)
        → learn again
```

`js/engine.js` is deliberately organized as a swappable module:

- **PRODUCTION HOOK** — replace the internals of `XIO_ENGINE.generateReply()` with a call to your model router (OpenAI/Anthropic/local), passing the assembled memory + classification context. One function, rest of the app unchanged.
- Persistence layer: swap `localStorage` get/save for Postgres/Appwrite/Supabase per-user rows.
- The conversation-history, confidence, interest-graph and insight schemas in `engine.js` already match the multi-user production design.

## Production build path (when ready)

1. Wrap this UI in Next.js/React components (markup is already component-shaped).
2. Backend: per-user memory tables (confidence, category, source, confirmed) + event ledger.
3. Model router: cheap model → extraction/classification, strong model → replies, reasoning model → weekly intelligence summaries.
4. Keep the contract: user-visible memory, honest confidence, ask-before-remember, full export/delete.

---

Built from the XIO vision: *stop building, start scaling — experience the XIO Effect.*
