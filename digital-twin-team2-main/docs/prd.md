# Product Requirements Document (PRD)

## 1. Purpose
This PRD defines the objectives and requirements for the "Digital Twin" project. The system is a Personal AI Agent designed to represent a candidate in professional job interviews. It uses **Model Context Protocol (MCP)** and **Voice-AI technology** to conduct real-time, interactive interviews with recruiters based on the user's verified professional data.

## 2. Problem Statement
Recruiters and hiring managers often rely on static resumes and portfolios (PDFs/Websites), which fail to capture a candidate's depth or context. They cannot ask specific follow-up questions to a static document. This project addresses this by creating an interactive AI Digital Twin that mirrors the candidate's professional persona, allowing recruiters to "interview" the candidate 24/7 via **voice and chat interfaces**.

## 3. Goals & Objectives

**Primary Goals**
* Build a publicly accessible AI agent that accurately answers interview questions.
* **Implement real-time Voice-AI capabilities** to allow users to speak directly to the Digital Twin.
* Demonstrate "AI-assisted development" by generating technical designs from this PRD.

**Success Metrics**
* The Agent accurately answers "Tell me about yourself" using the provided resume data.
* **Voice interaction latency is low enough for a natural conversation flow.**
* System successfully retrieves candidate data via MCP tools.

## 4. Scope

**In Scope (Phase 1 - MVP)**
* **Target Persona:** Configuration of the system using professional profile (Resume, Portfolio) to validate persona accuracy.
* **Core Architecture:** Next.js App Router, Vercel AI SDK, and **Voice-AI Integration**.
* **MCP Server:** Implementation of Model Context Protocol for data retrieval from the database.
* **Deployment:** Public deployment on Vercel.

## 5. Roles & Responsibilities
* **Product Owner:** [Selected Team Member] (Provides resume data & verifies accuracy).
* **Development Team:** Team 2 Members (Implement the **Voice-AI system**, MCP server, and UI).
* **Target Audience:** Recruiters, Hiring Managers, and Course Reviewers.

## 6. Functional Requirements

| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Voice Interaction** | System must support real-time voice-to-voice communication, allowing users to talk to the AI. | **High** |
| **FR-02** | **MCP Integration** | The AI must use Model Context Protocol tools to access the resume data source. | **High** |
| **FR-03** | **Persona Consistency** | The AI must adopt the professional persona of the MVP subject (e.g., the Product Owner), reflecting their actual background and skills. | **High** |
| **FR-04** | **Chat Interface** | A responsive UI where users can input natural language questions (text or voice) and receive responses. | **High** |
| **FR-05** | **Fallback Mechanism** | If the AI cannot find the answer in the provided data, it should strictly state it doesn't know, rather than hallucinating. | Medium |

## 7. Non-Functional Requirements
* **Tech Stack:** Next.js (TypeScript), Vercel AI SDK, **OpenAI Realtime API (or similar Voice Provider)**.
* **Accuracy:** Zero tolerance for hallucinations regarding professional dates, roles, or skills.
* **Security:** API Keys (OpenAI/Anthropic) must be managed via Environment Variables, never committed to GitHub.

## 8. Dependencies
* **Voice Provider (e.g., OpenAI Realtime API, Vapi, or Twilio)**.
* OpenAI / Anthropic API (for LLM reasoning).
* Vercel (for hosting).

## 9. Risks & Mitigation
* **Risk:** AI hallucinations (inventing fake experience).
    * **Mitigation:** Strict system prompt engineering and grounding via MCP.
* **Risk:** Voice latency (lag).
    * **Mitigation:** Use optimized Voice-AI providers and edge functions.

## 10. Acceptance Criteria
* The repository includes a `design.md` generated from this PRD.
* The application is deployed on Vercel.
* **Users can have a voice conversation with the Digital Twin.**
* The bot can answer specific questions about the Product Owner's projects based on the data.

## 11. Change Log
| Date | Change | Author |
| :--- | :--- | :--- |
| 18 Jan 2026 | Initial PRD created | Team 2 |
| 25 Jan 2026 | Updated to match Week 2 requirements | Team 2 |
| **29 Jan 2026** | **Removed RAG/Upstash and pivoted to Voice-AI focus** | **Team 2** |
