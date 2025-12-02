# AI-Driven Candidate Evaluation & Hiring Intelligence System Architecture

## 1. System Overview
This document outlines the architecture for a fully automated, AI-driven hiring system designed to evaluate candidates through a multi-layer agent framework. The system utilizes microservices, event-driven architecture, and continuous learning to deliver high-precision candidate ranking and shortlisting.

## 2. Multi-Layer AI Agent Architecture

The core evaluation engine is composed of three distinct specialized agent layers, orchestrated by a Master Agent.

### Layer 1: Screening Agent (The Gatekeeper)
*   **Role:** Rapidly filters candidates based on fundamental criteria.
*   **Inputs:** Resume (PDF/Text), Application Form Data, Video Metadata.
*   **Checks:**
    *   Audio/Video Quality Check (Bitrate, Clarity).
    *   Profile Completeness (Missing fields).
    *   Basic Keyword Matching (e.g., "React", "Node.js").
    *   Language Proficiency (Basic text analysis).
*   **Output:** `Pass/Fail` flag + `Screening Score (0-100)`.

### Layer 2: Technical & Content Agent (The Expert)
*   **Role:** Deep analysis of the candidate's actual skills and knowledge.
*   **Inputs:** Transcribed Video Audio, Code Samples (if any), Resume Details.
*   **Checks:**
    *   **Technical Term Detection:** Frequency and context of technical vocabulary.
    *   **Accuracy Verification:** Cross-referencing spoken answers with a knowledge base.
    *   **Domain Knowledge:** Depth of understanding in specific topics.
*   **Output:** `Technical Score (0-100)` + `Skill Graph`.

### Layer 3: Behavioral & Soft Skills Agent (The Psychologist)
*   **Role:** Evaluates non-technical attributes crucial for culture fit.
*   **Inputs:** Video Visuals (Facial expressions), Audio (Tone, Pitch, Pace), Text (Sentiment).
*   **Checks:**
    *   **Confidence Level:** Voice stability, eye contact (simulated).
    *   **Emotional Tone:** Enthusiasm, calmness, professionalism.
    *   **Communication Style:** Clarity, pacing, filler words.
*   **Output:** `Behavioral Score (0-100)` + `Personality Traits`.

### Master AI Agent (The Decision Maker)
*   **Role:** Aggregates data from all layers to make a final decision.
*   **Logic:**
    *   Weighted Average: `(L1 * 0.2) + (L2 * 0.5) + (L3 * 0.3)` (Weights adjustable by role).
    *   **Ranking:** Compares against other candidates in the pool.
    *   **Report Generation:** Creates a human-readable summary.
*   **Output:** `Final Composite Score`, `Rank`, `Detailed Report`.

## 3. Microservices & Event-Driven Architecture

To ensure scalability, the backend is divided into independent services communicating via events (e.g., Redis/RabbitMQ/Supabase Realtime).

*   **Service 1: Ingestion Service**
    *   Handles Video Uploads (YouTube/S3).
    *   Triggers `EVENT: NEW_CANDIDATE_UPLOAD`.
*   **Service 2: Transcription Service**
    *   Listens for `NEW_CANDIDATE_UPLOAD`.
    *   Converts Audio to Text (Gemini/Whisper).
    *   Triggers `EVENT: TRANSCRIPTION_COMPLETE`.
*   **Service 3: Analysis Service (The Agents)**
    *   Listens for `TRANSCRIPTION_COMPLETE`.
    *   Runs Layer 1, 2, and 3 analysis in parallel.
    *   Triggers `EVENT: ANALYSIS_COMPLETE`.
*   **Service 4: Scoring & Ranking Service**
    *   Listens for `ANALYSIS_COMPLETE`.
    *   Calculates final scores and updates Leaderboard.
*   **Service 5: Notification Service**
    *   Emails candidate/recruiter based on results.

## 4. Continuous Learning Loop
*   **Feedback Mechanism:** Recruiters can "Upvote/Downvote" an AI score.
*   **Model Refinement:**
    *   If Recruiter hires a low-scored candidate -> System adjusts weights for that job type.
    *   If Recruiter rejects a high-scored candidate -> System analyzes "why" (e.g., missed red flag).

## 5. Data Visualization & Dashboards
*   **Job-Specific Analytics:**
    *   Pie Charts: Skill distribution.
    *   Bar Graphs: Score comparison.
*   **Role Categories:**
    *   Tech (Coding focus).
    *   Customer Support (Empathy/Tone focus).
    *   Finance (Accuracy focus).

## 6. Implementation Roadmap
1.  **Phase 1 (Current):** Modular Monolith. All agents run as modules within the Express server.
2.  **Phase 2:** Split Transcription and Analysis into background workers.
3.  **Phase 3:** Full Microservices with dedicated containers and Event Bus.
