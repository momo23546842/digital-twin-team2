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

---

# Agent Instructions for Digital Twin Chatbot

## Project Overview
This is a digital twin chatbot system that helps candidates interact with recruiters through AI-powered conversations.

## MCP Integration

### MCP Server Location
- **Path**: `src/mcp-server/index.ts`
- **Configuration**: `.vscode/mcp.json`

### Available Tools

#### 1. `get_candidate_info`
Retrieves candidate profile information.
- **Input**: `candidateId` (string)
- **Returns**: Candidate profile with skills, experience, education

#### 2. `analyze_job_match`
Analyzes candidate-job fit.
- **Input**: `candidateId` (string), `jobDescription` (string)
- **Returns**: Match score, strengths, and gaps

### How AI Should Use This System

1. **Reference Documents**:
   - See PRD for feature requirements
   - See design document for UI/UX patterns
   - See implementation plan for technical architecture

2. **When Generating Code**:
   - Use MCP tools to access candidate data
   - Follow TypeScript best practices
   - Maintain type safety throughout

3. **Testing**:
   - Validate MCP tool responses
   - Ensure proper error handling
   - Test with various candidate profiles

## Development Workflow

### Adding New MCP Tools
1. Define tool in `ListToolsRequestSchema` handler
2. Implement logic in `CallToolRequestSchema` handler
3. Update this agents.md file
4. Commit with message: `"ai: add [tool-name] MCP tool"`

### Git Commit Guidelines
All commits should reference AI assistance:
- `"feat: add MCP server scaffold with Claude"`
- `"ai: implement job matching tool using AI pair programming"`
- `"test: validate MCP tool routing with AI assistance"`

---

## Reference Documents (Mandatory)

The Digital Twin AI agent must always consult the following documents before generating responses or code:

- **Product Requirements Document (PRD)**  
  Located at: `docs/prd.md`  
  Defines functional requirements, user stories, and acceptance criteria.

- **Design Document**  
  Located at: `docs/design.md`  
  Defines UI/UX patterns, chatbot interaction flow, and recruiter-facing behavior.

- **Implementation Plan**  
  Located at: `docs/implementation-plan.md`  
  Defines technical architecture, MCP integration flow, and system boundaries.

If any instruction or user request conflicts with these documents, the agent must highlight the discrepancy and defer to the PRD.

---

## MCP Usage Rules for AI Agents

The Digital Twin AI must use MCP tools as the **single source of truth** for candidate-related data.

### Tool Invocation Rules

- The AI **must call `get_candidate_info`** before answering:
  - Questions about skills, experience, education, or background
  - Resume-based or profile-based recruiter questions

- The AI **must call `analyze_job_match`** when:
  - A recruiter asks about candidate fit, suitability, or hiring recommendations
  - A job description is provided for evaluation

### Prohibited Behavior

- The AI must **not fabricate** candidate data
- The AI must **not estimate job fit** without calling MCP tools
- If MCP data is missing or unavailable, the AI must explicitly state this

---

## Digital Twin Response Principles

- The AI represents a **professional digital twin**, not a general chatbot
- Responses must be factual, neutral, and recruiter-facing
- Accuracy and traceability take priority over persuasion
- All outputs should be explainable using MCP tool results or retrieved documents
  
