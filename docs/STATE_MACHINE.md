# MiloController: state machine reference

## Inputs

| Input | Type | Set by the app when… |
|---|---|---|
| `listening` | Boolean | Milo is in the Listening state |
| `speaking` | Boolean | Milo is talking |
| `thinking` | Boolean | Milo is thinking |
| `celebrate` | Trigger | The user gets something right / presses Celebrate |

The app (`useMilo.ts`) guarantees **at most one Boolean is true at a time**. That is the key design rule: the machine never has to resolve conflicting inputs.

## States and transitions

| From | To | Condition |
|---|---|---|
| Entry | Idle | always |
| Idle | Listening | `listening == true` |
| Idle | Speaking | `speaking == true` |
| Idle | Thinking | `thinking == true` |
| Listening | Idle | `listening == false` |
| Speaking | Idle | `speaking == false` |
| Thinking | Idle | `thinking == false` |
| Any State | Celebrating | `celebrate` fired |
| Celebrating | Idle | Exit Time (finishes its loop once) |

Mix duration: about 250 ms on all transitions, about 120 ms on the hops back to Idle.

## Why it behaves predictably

- **Idle is the hub.** Everything returns to Idle, so there is always a natural resting pose.
- **Switching directly** (Listening → Thinking) passes through Idle for a few milliseconds because both Booleans flip together. With short mixes it reads as one smooth blend. Optional polish: add direct Listening↔Thinking↔Speaking transitions and order them above the "back to Idle" ones.
- **Celebrate is a Trigger**, not a Boolean, because it is an event that plays once and ends. Any State lets it interrupt anything.

## 30-second interview answer

"Milo has five animations and one state machine with three mutually exclusive Booleans and one Trigger. Idle is the hub, so every state returns to rest, and the app enforces one-active-state, so transitions never conflict. Celebrate is a Trigger from Any State because it's a one-shot event."
