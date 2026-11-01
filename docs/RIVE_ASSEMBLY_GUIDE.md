# Rive assembly guide (beginner)

Goal: turn the SVG layers into `milo.riv` with five animations and the `MiloController` state machine. Menu names can shift a little between editor versions; the ideas stay the same. Save often.

## 0. Setup
1. Go to **rive.app**, sign in (free), and create a new file.
2. Create an **Artboard** of **400 × 400** (the SVGs are all 400 × 400, so layers line up on their own).

## 1. Import the artwork
1. Open `rive-assets/svg-layers/`.
2. Drag the SVG files onto the artboard **in number order** (01 first, 20 last). Each lands exactly in place; later numbers sit in front.
   `00-milo-full-reference.svg` is only a picture to compare against. Don't import it.
3. In the left **Hierarchy** panel, rename each imported item to its name without the number (`tail`, `body`, `ear-left`, `eyes-happy`...).
4. If a layer imports as several shapes, select them and group them (**Ctrl+G**) and name the group.

## 2. Group into a rig
Select layers in the Hierarchy and press **Ctrl+G**. Build this structure (front-to-back order stays the same):

```
rig
├─ tail
├─ bodyGroup   (body, chest, paws)
└─ headGroup   (ear-left, ear-right, head, muzzle, cheeks, nose,
                brow-left, brow-right, eyes [eye-whites, pupils],
                eyes-happy, mouth-smile, mouth-open, mouth-hmm)
listen-waves
thought-bubble
```

## 3. Set pivot points (so things rotate from the right place)
Rotation happens around each object's **origin**. Select the object and drag its origin dot (or edit Origin X/Y in the Inspector):

| Object | Put the origin at |
|---|---|
| headGroup | bottom center (the neck) |
| ear-left / ear-right | the base of the ear, where it meets the head |
| tail | the base, where it meets the body |
| bodyGroup, rig | bottom center |
| eyes | center of the eyes (for blink scaling) |
| mouth-open | top of the mouth (so it opens downward) |

## 4. Make the five animations
Switch the bottom toggle from **Design** to **Animate**. In the **Animations** list click **+** and create these, named **exactly**:
`Idle`, `Listening`, `Speaking`, `Thinking`, `Celebrating`.

Tips: set **Loop** on (Idle, Listening, Speaking, Thinking). Set Celebrating to Loop too. The state machine returns it to Idle. Keep a "rest pose" at time 0 and the last frame the same so loops are seamless. Move or rotate an object while a time is selected and Rive adds the keyframe. Use **ease in-out** on everything.

Hide things by setting **Opacity** to 0 on frame 0. Every animation should set the opacity of the optional layers explicitly, so nothing is left on from the last animation.

| Animation | Length | What to key |
|---|---|---|
| **Idle** | 4 s | bodyGroup scale 100% → 102.5% → 100% (breathing). headGroup rotation −1° ↔ +1.5° and 3 px up/down. Blink: eyes scale Y 100% → 8% → 100% over 0.15 s at about 2.6 s. Ear twitch: ear-right rotate 0° → 9° → −4° → 0° around 3.3 s. Tail rotation −3° ↔ 6°. Opacity 0 on eyes-happy, mouth-open, mouth-hmm, listen-waves, thought-bubble. |
| **Listening** | 3 s | headGroup rotation −8° (tilt) with a small sway. Ears rotate outward (−8° left, +8° right) and scale Y 106%. Brows up 7 px. listen-waves opacity pulsing 35% ↔ 100%. Others hidden. |
| **Thinking** | 3.4 s | headGroup rotation +7°. Pupils offset up-right (+10, −9). brow-right up 11 px and −8° rotation. mouth-smile opacity 0, mouth-hmm 100%. thought-bubble 100% with a 6 px bob. |
| **Speaking** | 1 s | mouth-smile opacity 0, mouth-open 100%. mouth-open scale Y cycle: 20% → 90% → 45% → 100% → 20%. Tiny head bob (3 px) and ±1.5° rotation. |
| **Celebrating** | 0.6 s | rig moves up 34 px and back (squash & stretch: scale 104%/94% at the bottom, 97%/104% at the top). eyes opacity 0, eyes-happy 100%. mouth-smile 0, mouth-open 100%. Ears wiggle ±10°. Tail wags ±15°. |

**Confetti:** draw about 12 small rectangles and circles in the Celebrating animation. Key each one flying outward and downward with a fade-out. (The preview mode already shows confetti. In Rive you build your own.)

Checkpoint: press **Play** on each animation. Each should look right and loop cleanly.

## 5. Build the state machine
1. In the Animations panel click **+** → **State Machine**. Name it exactly **`MiloController`**.
2. Add **Inputs** (names are case-sensitive):
   - `listening` → **Boolean**
   - `speaking` → **Boolean**
   - `thinking` → **Boolean**
   - `celebrate` → **Trigger**
3. Drag all five animations onto the state machine canvas to make states.
4. Connect **Entry → Idle**.
5. Make transitions by dragging from one state to another, then set conditions in the Inspector:

| From → To | Condition |
|---|---|
| Idle → Listening | `listening` is true |
| Idle → Speaking | `speaking` is true |
| Idle → Thinking | `thinking` is true |
| Listening → Idle | `listening` is false |
| Speaking → Idle | `speaking` is false |
| Thinking → Idle | `thinking` is false |
| Any State → Celebrating | `celebrate` |
| Celebrating → Idle | turn on **Exit Time** (100%) |

6. Set each transition's **Duration** (mix) to about 250 ms, and 120 ms for the ones going back to Idle.

Checkpoint: in the state machine's preview, click the inputs. Toggling `speaking` should move Idle → Speaking and back when switched off. Fire `celebrate` and it plays once and returns to Idle.

## 6. Export and plug in
1. Use **Export** (top right) → **For runtime** (a `.riv` file).
2. Rename the download to exactly **`milo.riv`**.
3. Put it in `milo-demo/public/milo.riv`.
4. Run `npm run dev` and refresh. The badge should say **Rive runtime · MiloController**.

## Troubleshooting
- **Still "Preview mode":** wrong filename or folder, or the file isn't a runtime export.
- **Rive shows but buttons do nothing:** the state machine or input names don't match exactly. The inputs panel names what's missing.
- **Parts rotate from the wrong spot:** fix the origin (step 3).
- **Something stays visible in the wrong state:** key its Opacity in every animation.
- **Jerky loops:** make the first and last keyframes identical.
