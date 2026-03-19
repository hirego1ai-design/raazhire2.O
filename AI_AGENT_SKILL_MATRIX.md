# HireGo AI Agent Skill Matrix

This document outlines the specialized "Skills" and responsibilities for every autonomous AI agent in the HireGo 2.0 ecosystem.

| Agent Name | Skill / Responsibility | Model Used (Cost Optimized) | Work Context |
| :--- | :--- | :--- | :--- |
| **Master Orchestrator** | Coordinates Layers 1-4, calculates weights, and issues final hiring verdict. | Gemini 1.5 Flash-8b | Triggered after video analysis. |
| **Gemini Video Agent** | **Direct Vision Analysis.** Scans video files for facial cues, body language, and audio without separate transcription. | Gemini 1.5 Flash-8b | Foreground/Background Video scanning. |
| **Layer 1: Screening** | Profile matching, resume parsing, and basic qualification verification. | Gemini 1.5 Flash-8b | Initial candidate evaluation. |
| **Layer 2: Technical** | Technical depth analysis, domain mapping (Java, Python, AI, etc.), and code logic checks. | Gemini 1.5 Flash-8b | Deep transcript review. |
| **Layer 3: Behavioral** | Soft skill detection, emotional intelligence (EQ) scoring, and confidence analysis. | Gemini 1.5 Flash-8b | Psychological profiling from speech. |
| **Layer 4: Fraud Detection** | Cheating detection, tab-switching penalties, virtual camera detection, and AI-voice checking. | Gemini 1.5 Flash-8b | Real-time and post-audit anti-cheat. |
| **Autonomous Queue Agent** | **Traffic Controller.** Manages concurrency, sleeps during idle, and wakes in <2ms to process heavy loads. | Node.js EventEmitter (System) | Global system protector. |
| **Skill Mapping Agent** | Dynamic job matching. Calculates the % match between a JD and a candidate's profile. | GPT-4o-Mini (Fallback) | Job search & "Recommended for You". |
| **Ranking Engine** | Real-time dashboard sorting for employers. Bubbles up the best candidates instantly. | Logic + AI Scores | Employer Dashboard. |
| **Continuous Learning** | Retrains scoring weights based on which candidates employers actually hire/reject. | DeepSeek Chat | Periodic background optimization. |
| **Performance Tracking** | Platform-wide ROI analysis and usage metrics for admins. | Logic + LLM Summary | Admin Analytics. |
| **JD Writing Agent** | Generates professional, SEO-optimized Job Descriptions based on sparse input. | Gemini 1.5 Flash | Employer "Create Job" flow. |
| **Question Generator** | Real-time creation of dynamic interview questions tailored to the candidate's specific resume. | Gemini 1.5 Flash | Pre-assessment setup. |
| **YouTube Learning Agent** | Curates specialized upskilling playlists based on candidate weakness areas. | YouTube API + LLM Router | Upskill Portal / Course recommendations. |

### Technical Strategy:
*   **Cost Efficiency**: 90% of operations are routed to "Flash" or "Flash-8b" tiers to ensure near-zero token cost for the user.
*   **Resiliency**: Every agent is protected by the **LLM Router**, allowing them to switch between Google, OpenAI, and DeepSeek if one provider goes down.
*   **Scale**: The **Autonomous Queue Agent** prevents server crashes by queuing heavy video tasks using `pg-boss`.
