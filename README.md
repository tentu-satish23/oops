# ☕ OOP'S ORACLE

> **Master Java. Master Logic. Build Your Future.**

**OOP'S ORACLE** is a production-quality Java learning, technical interview preparation, coding practice, and competitive programming platform inspired by LeetCode, with original branding, a cinematic opening experience, and an extensive repository of 520+ curated problems.

---

## 🌟 Key Features

### 1. 🎬 Cinematic 3D Coffee Intro (First Impression)
- High-budget cinematic title reveal before login/signup.
- **Scene 1 (Studio Reveal):** Dark black/navy obsidian studio setting with dramatic lighting, 3D kettle and ceramic coffee cup.
- **Scene 2 (Coffee Pouring):** Kettle slowly tilts and pours rich roasted black coffee into the ceramic cup with realistic fluid movement.
- **Scene 3 (Hot Java Steam):** Volumetric steam rises from the hot coffee surface.
- **Scene 4 (Brand Vapor Reveal):** Steam particles seamlessly coalesce and illuminate the exact brand name **OOP'S ORACLE** and the tagline *"Master Java. Master Logic. Build Your Future."*
- **Scene 5 (Smooth Transition):** Smoke expands and smoothly reveals the developer login/signup interface.
- **Procedural Acoustic Engine:** Web Audio API liquid pouring acoustics (frequency rises as cup fills), volumetric steam hiss, and golden reveal chord.
- **Controls:** Skip Intro, Mute/Unmute, and Replay anytime from settings.

### 2. 🔐 Authentication & Security
- Split-screen developer-focused authentication.
- Full validation, password strength meter, password visibility toggle.
- **Instant Demo Access:** 1-Click quick login as Java Master for rapid evaluation.
- Supabase Auth integration with local database persistence fallback.

### 3. 📊 Developer Dashboard
- Daily coding challenge banner with 1-click workspace launch.
- Real-time statistics: Total solved, Easy / Medium / Hard breakdown, Acceptance rate %, and coding streak counter.
- **GitHub-Style Activity Heatmap:** 365-day interactive grid with color intensity.
- Recently solved problems, active course progress, and upcoming contests.

### 4. 📚 Problem Library (520+ Problems)
- Filter by difficulty (Easy/Medium/Hard), topic (Arrays, Strings, Linked Lists, Trees, Graphs, DP, OOP, etc.), and company tags.
- Search by title or keyword.
- Each problem includes: description, input/output format, constraints, starter code, hints, and editorial.
- Progress tracking per problem.

### 5. ⚙️ Coding Workspace
- Monaco Editor with Java syntax highlighting and IntelliSense.
- Custom test cases + hidden test cases.
- Real-time execution via local Java 17 sandbox or optional Judge0.
- Submit & get detailed feedback (passed/failed, time, memory).
- AI-style hints and solution discussion.

### 6. 🎓 Courses
- Structured learning paths with lessons, quizzes, and coding exercises.
- Progress tracking and certificates.
- Affordable pricing via Razorpay (simulation mode available).

### 7. 🏆 Contests
- Timed competitive programming contests.
- Leaderboards and rankings.

### 8. 👤 Profile & Certificates
- Public profile with stats, heatmap, and achievements.
- Downloadable certificates for completed courses.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Java 17+ (for local code execution)
- (Optional) Supabase project + Razorpay account

### Installation

```bash
# Clone the repo
git clone https://github.com/tentu-satish23/oops.git
cd oops

# Install root (if needed)
npm install

# Install client dependencies
cd client && pnpm install && cd ..
# or if client files are at root: pnpm install

# Install server dependencies
cd server && pnpm install && cd ..

# Copy environment template
cp .env.example server/.env
# Edit server/.env with your keys

# Run server
npm run server
# In another terminal, run client
npm run client
# or from client dir: pnpm dev
```

### Environment
See `.env.example` for all required variables. The platform works in simulation mode if Razorpay/Supabase/Judge0 keys are left blank.

### Database
Run `supabase-schema.sql` in your Supabase SQL editor to create the required tables.

---

## 📁 Project Structure

```
oops/
├── client/          # React + Vite + TypeScript frontend
├── server/          # Express.js backend + Java runner
├── supabase-schema.sql
├── .env.example
├── package.json     # Root scripts
└── README.md
```

> **Note:** If the frontend files currently live at the repository root (instead of under `client/`), the existing structure still works for the client. You can move the client files into a `client/` folder for the full monorepo layout, or adjust the root `package.json` scripts accordingly.

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP, Three.js, Monaco Editor, Recharts
- **Backend:** Node.js, Express, in-memory store + optional Supabase
- **Payments:** Razorpay (with simulation fallback)
- **Code Execution:** Local Java 17 sandbox + optional Judge0
- **Auth:** Supabase Auth (with local fallback)

---

## 🎯 Tagline

**Master Java. Master Logic. Build Your Future.**

---

Made with ☕ and ❤️ for Java developers.
