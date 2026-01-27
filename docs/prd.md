# Product Requirements Document (PRD)

---

## 1. Purpose

This PRD defines the objectives and requirements for the "Digital Twin" project. The system is a Personal AI Agent designed to represent a candidate in professional job interviews. It uses Retrieval-Augmented Generation (RAG) and Model Context Protocol (MCP) to answer recruiter questions with factual accuracy based on the user's verified professional data.

---

## 2. Problem Statement

Recruiters and hiring managers often rely on static resumes and portfolios (PDFs/Websites), which fail to capture a candidate's depth or context. They cannot ask specific follow-up questions to a static document. This project addresses this by creating an interactive AI Digital Twin that mirrors the candidate's professional persona, allowing recruiters to "interview" the candidate 24/7 via a chat interface.

---

## 3. Goals & Objectives

### Primary Goals

* Create a digital twin that reflects the real or simulated system state
* Enable modular, agent-based interaction with the system
* Provide a clear foundation for analytics and future extensions

### Success Metrics

* System ingests and processes data successfully
* Agents can operate independently and collaboratively
* Documentation is clear enough for new contributors to onboard

---

## 4. Scope

### In Scope

* Core digital twin architecture
* Agent-based logic (as defined in `agents.md`)
* Data ingestion and processing
* Documentation and repository structure

### Out of Scope (Phase 1)

* Production-grade deployment
* Full-scale IoT hardware integration
* Advanced security and authentication

---

## 5. Roles & Responsibilities
* **Product Owner:** [Selected Team Member] (Provides resume data & verifies accuracy).
* **Development Team:** Team 2 Members (Implement the RAG system, MCP server, and UI).
* **Target Audience:** Recruiters, Hiring Managers, and Course Reviewers.

## 6. Functional Requirements
| ID | Requirement | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | **RAG Pipeline** | System must vectorise user queries and retrieve relevant context from **Upstash Vector**. | **High** |
| **FR-02** | **MCP Integration** | The AI must use **Model Context Protocol** tools to access the resume data source. | **High** |
| **FR-03** | **Persona Consistency** | The AI must adopt the professional persona of the MVP subject (e.g., the Product Owner), reflecting their actual background and skills. | **High** |
| **FR-04** | **Chat Interface** | A responsive UI where users can input natural language questions and receive streamed text responses. | **High** |
| **FR-05** | **Fallback Mechanism** | If the AI cannot find the answer in the provided data, it should strictly state it doesn't know, rather than hallucinating. | **Medium** |

## 7. Non-Functional Requirements
* **Tech Stack:** Next.js (TypeScript), Vercel AI SDK, Upstash Vector.
* **Accuracy:** Zero tolerance for hallucinations regarding professional dates, roles, or skills.
* **Security:** API Keys (OpenAI/Anthropic, Upstash) must be managed via Environment Variables, never committed to GitHub.

## 8. Dependencies
* **Upstash Vector Database** (for embeddings).
* **OpenAI / Anthropic API** (for LLM reasoning).
* **Vercel** (for hosting).

## 9. Risks & Mitigation
* **Risk:** AI hallucinations (inventing fake experience).
    * *Mitigation:* Strict RAG implementation and system prompt engineering.
* **Risk:** Data privacy.
    * *Mitigation:* Only use professional/public data for the MVP.

## 10. Acceptance Criteria
* [ ] The repository includes a `design.md` generated from this PRD.
* [ ] The application is deployed on Vercel.
* [ ] The bot can answer specific questions about the Product Owner's projects based on the vector data.
* [ ] Upstash Vector storage is populated with embedded data.

## 11. Change Log
| Date | Change | Author |
| :--- | :--- | :--- |
| 18 Jan 2026 | Initial PRD created | Team 2 |
| 25 Jan 2026 | Updated to match Week 2 RAG & Persona requirements | Team 2 |

