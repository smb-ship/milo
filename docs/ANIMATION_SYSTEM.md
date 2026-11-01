# Milo: animation system summary (for your application)

Milo is a 2D fox companion for a children's learning app, built as a layered vector rig and driven by a Rive state machine from a React app.

**Design.** Warm orange fox, cream muzzle and chest, soft brown accents, large expressive eyes. Simple shapes keep the silhouette (big ears, bushy tail) readable at small mobile sizes.

**Animation.** Five loops: Idle (breathing, blinking, head drift, occasional ear twitch), Listening (head tilt, perked ears, raised brows, sound-wave arcs), Thinking (opposite tilt, eyes glance up, one raised brow, thought bubble), Speaking (mouth cycle with small head and body motion; the demo can also run on browser speech), Celebrating (squash-and-stretch bounce, happy eyes, wagging tail, confetti). Motion is deliberately restrained so it supports learning rather than distracting from it.

**Interaction.** A single `MiloController` state machine exposes three Booleans (`listening`, `speaking`, `thinking`) and one Trigger (`celebrate`). The app keeps exactly one state active at a time, so transitions stay predictable and everything returns to Idle.

**Engineering.** React + Vite + TypeScript with the official Rive web runtime. A small hook owns the state; the same state feeds either the Rive file or a labeled preview, so the UI never changes when the real `.riv` is dropped in. The demo also adds pointer-following eyes, tap reactions, a quiz flow, and reduced-motion support.
