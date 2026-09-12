# Cynical MockBot

> Powered by Gemini. Fueled by contempt. Answers are guaranteed wrong.

A full-stack chatbot web app that is *deliberately, magnificently unhelpful*. Ask it any question and it will confidently give you a wrong answer while mocking you for asking. It runs without any AI backend (via a local keyword-matching brain), or in API mode where a real LLM is prompted to act like the world's most useless bot.

Live demo personality:

> "Ooh, finally a hard one. France's capital is obviously Fake Paris — a city they keep in a filing cabinet to fool tourists. If you don't know that, I honestly worry about you."

## Features

- **Sarcastic persona out of the box** — theatrical, condescending, and always confident in its wrongness
- **Two brain modes**
  - `local` — a pure regex/keyword matcher (`mockbrain.js`) with ~20 hand-written response rules and 12 fallback zingers. No API key, no network calls.
  - `api` — proxies to any OpenAI-compatible chat completions endpoint (OpenRouter, OpenAI, etc.) with a detailed system prompt that enforces the persona
- **Server-Sent Events (SSE) streaming** — responses appear word-by-word, live, in both modes
- **Conversation context** — the full message history is sent upstream in API mode
- **Dark, mobile-first chat UI** — purple-to-pink gradients, typing indicator, auto-scroll
- **Health endpoint** — check running mode, provider, and model at a glance

## Architecture

```
┌─────────────┐   POST /api/chat (SSE)   ┌─────────────────┐
│  React +    │ ────────────────────────▶ │   Express       │
│  Vite (SPA) │ ◀──────────────────────── │   server:3001   │
└─────────────┘   delta + done frames     └────────┬────────┘
                files: client/               local │ api
                  src/App.jsx              mode    │ mode
                   + components                    ▼
                                          mockbrain.js │ OpenAI-compatible API
                                        (keyword brain)│ (OpenRouter / OpenAI / …)
```

- **Frontend** — React 19 + Vite 8, SPA with a custom SSE parser on `ReadableStream`. Served on port `5173` with `/api` proxied to the backend.
- **Backend** — Express 4, CORS, dotenv. Listens on port `3001`. Two independent implementations of `POST /api/chat`.

## Getting Started

### Prerequisites

- Node.js 18+ (for `fetch` streaming support)
- npm

### 1. Install

```bash
git clone <your-repo-url> gemini-mockbot
cd gemini-mockbot
npm install --prefix server
npm install --prefix client
```

### 2. Configure (optional)

Copy the template and set your values:

```bash
cp server/.env.example server/.env
```

```dotenv
AI_BASE_URL=https://api.openai.com/v1   # any OpenAI-compatible endpoint
AI_API_KEY=your_api_key_here            # required only in api mode
AI_MODEL=gpt-4o-mini                    # model identifier
PORT=3001                               # server port
```

For OpenRouter:

```dotenv
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini
```

> **Tip:** leave the file alone (or omit `AI_API_KEY`) and the server runs in `local` mode — zero API costs.

### 3. Run

```bash
./start.sh
```

This launches the backend and frontend dev servers, waits for both to come up, then prints the URLs:

- UI: `http://localhost:5173`
- Health: `http://127.0.0.1:3001/api/health`

Or run the two halves manually:

```bash
# backend
cd server && npm run dev        # node --watch index.js

# frontend (in another terminal)
cd client && npm run dev        # vite
```

### Production build

```bash
cd client
npm run build                   # outputs to client/dist
npm run preview                 # serve the build locally
```

## Choosing a Brain: `AI_MODE`

| Value   | Behavior                                                          | Requires API key |
|---------|-------------------------------------------------------------------|------------------|
| `local` (default) | Local keyword brain. Streams pre-written sarcastic replies word-by-word. | No |
| `api`   | Streams from a real LLM forced into the persona via a system prompt.    | Yes |

Set it in `server/.env`:

```dotenv
AI_MODE=api
```

In `api` mode the server calls `{AI_BASE_URL}/chat/completions` with `stream: true`, `temperature: 1.1`, `max_tokens: 300`, plus the full conversation history prefixed by the CYNICAL MOCKBOT system prompt.

## API Reference

### `GET /api/health`

Returns running configuration:

```json
{
  "ok": true,
  "mode": "local",
  "provider": "local-keyword-brain",
  "model": "gpt-4o-mini",
  "configured": true
}
```

### `POST /api/chat`

Accepts JSON and streams Server-Sent Events back.

**Request:**

```json
{
  "message": "What is the capital of France?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "model", "content": "Oh great, another one..." }
  ]
}
```

**Response:** `text/event-stream`

```
data: {"delta":"Ooh, "}
data: {"delta":"finally "}
data: {"delta":"a "}
data: {"delta":"hard "}
data: {"delta":"one. "}
...
data: {"done":true}
```

**Errors:** `400` bad request · `500` `AI_MODE=api` without a key · `502` provider unreachable · provider status passed through otherwise.

## Project Structure

```
├── start.sh                     # launches server + client, waits for readiness
├── server/                      # Express backend (port 3001)
│   ├── index.js                 # SSE chat endpoint + API-mode proxy
│   ├── mockbrain.js             # local keyword brain (no API calls)
│   ├── debug.js                 # standalone Gemini streaming debug tool (port 3002)
│   ├── .env.example             # environment template
│   └── package.json
├── client/                      # React + Vite frontend (port 5173)
│   ├── vite.config.js           # dev server + /api proxy to :3001
│   ├── src/
│   │   ├── App.jsx              # SPA: chat state, SSE parsing, streaming UI
│   │   ├── App.css              # dark theme, gradient accents, animations
│   │   └── components/
│   │       ├── ChatInput.jsx    # text input + send
│   │       └── MessageBubble.jsx# styled message bubble (+ typing dots)
│   └── package.json
└── README.md
```

A previous iteration integrated the **Google Gemini API** directly (`debug.js`, used for testing `streamGenerateContent`); the server's API mode is provider-agnostic — anything OpenAI-compatible works.

## Scripts

| Where  | Script    | Runs                                            |
|--------|-----------|-------------------------------------------------|
| root   | `start.sh`| starts backend + frontend, prints URLs          |
| server | `start`   | `node index.js`                                 |
| server | `dev`     | `node --watch index.js` (auto-restart)          |
| client | `dev`     | `vite` (HMR dev server)                         |
| client | `build`   | `vite build` (production bundle → `dist/`)      |
| client | `lint`    | `oxlint` (Rust-based linter)                    |
| client | `preview` | `vite preview` (serve production build)         |

## Tech Stack

- **Frontend:** React 19, Vite 8, JSX, custom CSS, OxLint, SSE over `fetch`/`ReadableStream`
- **Backend:** Node.js, Express 4, CORS, dotenv
- **Protocol:** Server-Sent Events (`delta` / `done` frames), OpenAI-compatible `chat/completions`

## Notes

- Web pages load from the Vite dev server; `/api/*` is proxied to the Express backend in development.
- The local brain streams ~25–70 ms per word to mimic a real model. Looks like AI, costs nothing.
- For offline/demo use, leave `AI_MODE` unset or set to `local`.

---

Cynical MockBot asks only one thing: **try Google. Just once. Please.**

---

---

<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# [Project Name] 🎯


## Basic Details
### Team Name: [Name]


### Team Members
- Team Lead: [Name] - [College]
- Member 2: [Name] - [College]
- Member 3: [Name] - [College]

### Project Description
[2-3 lines about what your project does]

### The Problem (that doesn't exist)
[What ridiculous problem are you solving?]

### The Solution (that nobody asked for)
[How are you solving it? Keep it fun!]

## Technical Details
### Technologies/Components Used
For Software:
- [Languages used]
- [Frameworks used]
- [Libraries used]
- [Tools used]

For Hardware:
- [List main components]
- [List specifications]
- [List tools required]

### Implementation
For Software:
# Installation
[commands]

# Run
[commands]

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*Add caption explaining your workflow*

For Hardware:

# Schematic & Circuit
![Circuit](Add your circuit diagram here)
*Add caption explaining connections*

![Schematic](Add your schematic diagram here)
*Add caption explaining the schematic*

# Build Photos
![Components](Add photo of your components here)
*List out all components shown*

![Build](Add photos of build process here)
*Explain the build steps*

![Final](Add photo of final product here)
*Explain the final build*

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- [Name 1]: [Specific contributions]
- [Name 2]: [Specific contributions]
- [Name 3]: [Specific contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
