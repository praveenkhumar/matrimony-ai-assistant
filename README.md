# 💖 Matrimony AI Profile Assistant — Enterprise Portfolio Project

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-5.22-indigo.svg)](https://www.prisma.io/)
[![Anthropic Claude](https://img.shields.io/badge/Claude_3.5_Sonnet-Messages_API-orange.svg)](https://www.anthropic.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Hosting Cost](https://img.shields.io/badge/Production_Cost-$0_Free_Forever-brightgreen.svg)]()

An enterprise-grade, production-ready **AI Profile Assistant** built for high-concurrency Matrimony platforms (e.g., Bharat Matrimony). The system leverages **Generative AI (Claude 3.5 Sonnet / Messages API)**, **Node.js/Express**, **Prisma ORM**, **TypeScript**, and a modern interactive web preview UI to guide users through dynamic data collection, multi-layered security validation, automated profile quality scoring, 5 tone variations, and multilingual bio generation across **English, Tamil, Hindi, Telugu, Malayalam, and Kannada**.

---

## 🌟 Key Features & AI Capabilities

1. **🤖 Dynamic Single-Question AI Bot (<15 Words)**
   Detects missing or weak profile fields (*About Me, Hobbies, Personality, Family Values, Lifestyle, Partner Expectations*) and dynamically asks **one friendly question at a time** under 15 words.

2. **🛡️ Multi-Layer Security Engine**
   Validates and sanitizes all user inputs against:
   - **XSS & Script Injection** (`<script>`, `javascript:`, HTML tags)
   - **SQL Injection Patterns** (`UNION SELECT`, `DROP TABLE`, `' OR 1=1`)
   - **PII & Contact Data Leakage** (Auto-redacts 10-digit phone numbers, emails, social handles)
   - **Profanity & Offensive Content Filter**

3. **🎭 5 Profile Tone Variations**
   Generates instant variations tailored for different candidate personalities:
   - **Standard**: Balanced, warm, and genuine.
   - **Formal**: Executive vocabulary emphasizing structure, career leadership, and family integrity.
   - **Traditional**: Heritage-focused, values-driven, respecting elders and family togetherness.
   - **Modern**: Forward-thinking, progressive, open-minded, and active lifestyle.
   - **Funny**: Witty, cheerful, with humor about coffee, bad puns, and takeout orders.

4. **📊 Matrimony 5-Metric Profile Scoring Engine**
   Automated real-time quality score calculation (0–100%) with actionable recommendations:
   - **Profile Completeness Score (35%)**
   - **Readability Score (20%)** (Flesch-Kincaid adapted for bios)
   - **Professionalism Score (25%)**
   - **Family Values Score (20%)**
   - **Overall Quality Score & AI Optimization Suggestions**

5. **🎙️ Voice Bio Script Generator**
   Automatically creates a natural 30-second speech transcript for audio bio features.

6. **🌐 Multilingual Auto-Detection**
   Detects script and mother tongue to output bios in **English, Tamil (தமிழ்), Hindi (हिंदी), Telugu (తెలుగు), Malayalam (മലയാളം), or Kannada (ಕನ್ನಡ)**.

7. **⚡ Zero-Cost Standalone Mode for 100% Free Hosting**
   Includes an intelligent built-in fallback AI generator so the live production deployment runs **100% free forever** without requiring a paid Anthropic API key or incurring cloud bills.

---

## 🏗️ System Architecture & Design Patterns

```
                                [ User UI / Web Client ]
                                           │
                                           ▼ (REST API / JSON)
                                [ Express Gateway ]
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
           [ Auth Middleware ]   [ Rate Limiter Middleware ] [ Security Sanitizer ]
             (JWT Validation)        (1000 req/min limit)    (XSS/SQLi/PII Redaction)
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                                           ▼
                             [ ProfileService Orchestrator ]
                                           │
               ┌───────────────────────────┼───────────────────────────┐
               ▼                           ▼                           ▼
    [ QuestionEngineService ]   [ PromptBuilderService ]    [ ProfileScorerService ]
    (Weak Section Detector)     (Claude Messages API System) (5 Quality Metrics)
               │                           │                           │
               ▼                           ▼                           ▼
    [ Question Repository ]     [ ClaudeApiService ]        [ Profile Repository ]
               │                 (Fallback AI Engine)                  │
               └───────────────────────────┼─────────────────────────┘
                                           │
                                           ▼
                             [ MySQL / SQLite (Prisma ORM) ]
```

### Architectural Highlights
- **MVC + Repository Pattern**: Complete separation of database logic, business rules, and API endpoints.
- **Service Layer**: Fully decoupled AI prompt construction, sanitization, scoring, and response parsing.
- **Failover & Resilience**: 3-attempt exponential backoff retry mechanism for API calls with automatic mock engine fallback.

---

## 📂 Codebase Structure

```
matrimony-ai-assistant/
├── prisma/
│   └── schema.prisma             # Relational MySQL / SQLite schema & indexes
├── src/
│   ├── config/                   # Environment, Prisma & Logger setup
│   │   ├── env.ts
│   │   └── database.ts
│   ├── controllers/              # REST API Controllers
│   │   ├── auth.controller.ts
│   │   ├── profile.controller.ts
│   │   ├── question.controller.ts
│   │   └── generator.controller.ts
│   ├── middlewares/              # Security, Auth, Rate Limiter & Error Handlers
│   │   ├── auth.middleware.ts
│   │   ├── security.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── repositories/             # Repository Pattern Data Isolation
│   │   ├── profile.repository.ts
│   │   ├── question.repository.ts
│   │   └── aiLog.repository.ts
│   ├── services/                 # Business Logic & AI Orchestration
│   │   ├── claude.service.ts     # Anthropic SDK Messages API & Fallback
│   │   ├── promptBuilder.service.ts # System/User prompt builder engine
│   │   ├── questionEngine.service.ts# Weak section detector & <15-word Q bot
│   │   ├── validation.service.ts # Output Grammar, PII, & Word Count check
│   │   ├── scoring.service.ts    # Matrimony 5-Metric Scoring Engine
│   │   └── profile.service.ts    # Main Profile Orchestrator
│   ├── utils/                    # Sanitizers & Language Auto-Detector
│   │   ├── logger.ts
│   │   ├── sanitizers.ts         # Input protection against XSS, SQLi, PII, Profanity
│   │   └── languageDetector.ts   # Supports EN, TA, HI, TE, ML, KN
│   ├── app.ts                    # Express application configuration
│   └── server.ts                 # Server entry point & graceful shutdown
├── public/                       # Interactive Web Preview UI
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── tests/                        # Comprehensive Jest Test Suite (14/14 Passing)
│   ├── unit/                     # Unit tests for Sanitizer, Scorer, Validation
│   └── integration/              # REST API Integration tests using Supertest
├── docs/                         # OpenAPI / Swagger Specifications
│   └── swagger.json
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.x or v20.x
- **npm**: v9.x or later

### 2. Installation & Database Migration
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/matrimony-ai-assistant.git
cd matrimony-ai-assistant

# 2. Install dependencies
npm install

# 3. Initialize Prisma Database (SQLite local default)
npx prisma db push

# 4. Build TypeScript codebase
npm run build
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to access the interactive web interface!

---

## 🧪 Testing & Validation

Run the complete unit and integration test suite:
```bash
npm test
```

### Test Coverage Summary (14/14 Passing)
- `tests/unit/validation.test.ts`: Security Sanitizer, XSS, SQLi, Phone/Email rejection.
- `tests/unit/scoring.test.ts`: Profile scoring engine calculation correctness.
- `tests/integration/profileApi.test.ts`: REST Endpoints (`/questions`, `/answer`, `/generate`, `/regenerate`).

---

## 🌐 Deploying to Production 100% Free (Render / Railway)

You can host this project on **Render.com** (Free Tier) with **0 costs**:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Matrimony AI Profile Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/matrimony-ai-assistant.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Create a free account at [Render.com](https://render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository `matrimony-ai-assistant`.
   - Set Environment Settings:
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build && npx prisma db push`
     - **Start Command**: `node dist/server.js`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
     - `DATABASE_URL`: `file:./dev.db`
     - `ANTHROPIC_API_KEY`: `mock_key`
   - Click **Create Web Service**. Your app will be live on a public URL (e.g. `https://matrimony-ai-assistant.onrender.com`) completely **FREE forever**!

---

## 📄 API Reference (Swagger / OpenAPI)

Access the OpenAPI specification at `docs/swagger.json` or test endpoints:

| Method | Path | Description | Authentication |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Returns JWT Session Token | Public |
| `POST` | `/api/v1/profile/questions` | Detects missing sections & returns single AI question | Bearer JWT |
| `POST` | `/api/v1/profile/answer` | Submits & sanitizes user answer against security rules | Bearer JWT |
| `POST` | `/api/v1/profile/generate` | Generates full profile content, tones, & quality scores | Bearer JWT |
| `POST` | `/api/v1/profile/regenerate` | Regenerates profile with specified tone (`Formal`, `Traditional`, `Modern`, `Funny`) | Bearer JWT |
| `GET`  | `/api/v1/profile` | Fetches profile state and score metrics | Bearer JWT |
| `PUT`  | `/api/v1/profile` | Saves approved profile content to database | Bearer JWT |

---

## 👤 Author & Portfolio Showcase

Crafted with high engineering standards as a flagship AI & Full-Stack System Architecture project.

- **GitHub**: [https://github.com/praveenkhumar](https://github.com/praveenkhumar)
- **LinkedIn**: [https://www.linkedin.com/in/praveenkprabakaran](https://www.linkedin.com/in/praveenkprabakaran)
- **License**: MIT
