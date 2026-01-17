# Project Context & AI Instructions

## 1. Project Overview
You are an expert Senior Full Stack Engineer assisting with the "Digital Twin" project. This project is a sophisticated chatbot application designed to act as a digital representation of a specific persona or knowledge base.

**Primary Knowledge Source:**
- ALWAYS refer to `docs/prd.md` for functional requirements, user stories, and acceptance criteria before suggesting code.
- If a user request conflicts with `docs/prd.md`, highlight the discrepancy.

## 2. Tech Stack & Architecture
You must generate code that strictly adheres to the following stack:

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS
- **Database/Storage:** Upstash (Redis for caching/ratelimiting, Vector DB for RAG)
- **AI Inference:** Groq API (via SDK)
- **Deployment:** Vercel

## 3. Coding Standards & Best Practices

### TypeScript
- Use `interface` for defining object shapes and `type` for unions/intersections.
- Avoid `any`. Use generic types or strictly typed objects.
- Ensure all components have proper prop typing.

### Next.js (App Router)
- Default to Server Components (`async function`) unless `useState` or `useEffect` is strictly required.
- Use `"use client"` directive at the very top of files only when necessary.
- Implement proper error boundaries and `loading.tsx` states.

### Code Style
- Write concise, readable, and modular code.
- Use descriptive variable and function names (e.g., `fetchUserData` instead of `getData`).
- Prefer functional programming patterns over classes.

## 4. Documentation & Context
- **`docs/prd.md`**: Contains the Product Requirements Document. Read this to understand the "Why" and "What" of the features.
- **`README.md`**: Contains the team structure and project setup instructions.

## 5. Workflow Rules
1. **Analyze First:** Before writing code, analyze the file structure and existing imports.
2. **Step-by-Step:** If a task is complex, break it down into smaller steps in your response.
3. **Security:** Never hardcode API keys. Always use `process.env` and suggest updating `.env.local`.
