<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# Cynical MockBot 🎯


## Basic Details
### Team Name: Code Crush


### Team Members
- Team Lead: Niya Fathima (Head)
- Member 2: Neeraja

### Project Description
Cynical MockBot is the world's most unhelpful chatbot. Ask it anything — a trivia question, a favour, even a polite "hello" — and it will confidently reply with a wrong answer while roasting you for asking. It streams its terrible answers word-by-word in real time, so even being wrong feels dramatic.

### The Problem (that doesn't exist)
People keep asking questions and stupidly expecting useful, correct answers. The internet is full of chatbots that actually help, and frankly, that's the real problem. We needed a bot that reliably, creatively, and mockingly answers everything wrong.

### The Solution (that nobody asked for)
A patronizing AI chat companion that runs on a local keyword "brain" (zero API costs, guaranteed wrong answers) or on a real LLM forced into condescension via a carefully crafted system prompt. Every wrong answer is a masterpiece delivered at typing speed.

## Technical Details
### Technologies/Components Used
For Software:
- JavaScript (ES Modules)
- Node.js + Express 4 (backend)
- React 19 + Vite 8 (frontend)
- Server-Sent Events (SSE) — streaming responses word-by-word
- Libraries: react, react-dom, cors, dotenv
- Tools: npm, Vite, OxLint, Git

For Hardware:
- No hardware required — runs on any machine with Node.js 18+

### Implementation
For Software:
# Installation
```bash
git clone <your-repo-url>
cd gemini-mockbot
npm install --prefix server
npm install --prefix client
cp server/.env.example server/.env   # optional, for API mode
```

# Run
```bash
./start.sh
```
- UI: `http://localhost:5173`
- Backend health: `http://127.0.0.1:3001/api/health`

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Main chat view — the bot's opening sarcastic greeting*

![Screenshot2](Add screenshot 2 here with proper name)
*A user question being answered wrong, streamed word-by-word*

![Screenshot3](Add screenshot 3 here with proper name)
*Dark mobile view of the chat with the typing indicator*

# Diagrams
![Workflow](Add your workflow/architecture diagram here)
*React client → Express server → local keyword brain or LLM API, streaming back via SSE*

For Hardware:

No hardware build for this project (software only).

### Project Demo
# Video
[Add your demo video link here]
*Explain what the video demonstrates*

# Additional Demos
[Add any extra demo materials/links]

## Team Contributions
- Niya Fathima (Head): [add your contributions]
- Neeraja: [add your contributions]

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)