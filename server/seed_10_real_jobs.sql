-- ========================================================
-- SEED 10 REAL REALISTIC JOBS FOR TESTING HIREGO PLATFORM
-- ========================================================

-- Ensure demo employer user exists in users table
INSERT INTO users (id, email, name, role, avatar_url, created_at)
VALUES (
  'demo-employer-001',
  'employer@hirego.com',
  'HireGo Global Talent',
  'employer',
  'https://images.unsplash.com/photo-15499231-f129b911e442?w=100&q=80',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Clear any old mock jobs if desired (optional)
-- DELETE FROM employer_job_posts WHERE employer_id = 'demo-employer-001';

-- Insert 10 Real Jobs into employer_job_posts
INSERT INTO employer_job_posts (
  employer_id, title, description, requirements, responsibilities, skills, 
  location, country, work_mode, employment_type, experience_min, experience_max, 
  salary_min, salary_max, salary_currency, status, is_featured, is_urgent, job_type
) VALUES 

-- 1. Senior Full Stack Engineer
(
  'demo-employer-001',
  'Senior Full Stack Engineer (React & Node.js)',
  'We are seeking a seasoned Senior Full Stack Engineer to lead the design and implementation of high-throughput web applications for our enterprise platform. You will collaborate with cross-functional teams to build scalable backend APIs and responsive frontend interfaces.',
  '- 5+ years of software development experience\n- Advanced proficiency in React, Node.js, and TypeScript\n- Hands-on experience with PostgreSQL, Redis, and Prisma/TypeORM\n- Familiarity with AWS services (EC2, S3, CloudFront, Lambda)\n- Experience writing automated unit and integration tests',
  '- Design, build, and maintain efficient, reusable, and reliable code\n- Architect robust RESTful & GraphQL APIs\n- Optimize frontend application performance for maximum speed and scalability\n- Mentor junior developers and participate in design and code reviews',
  '["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "GraphQL"]'::jsonb,
  'Bangalore, Karnataka', 'IN', 'Hybrid', 'Full-time', 5, 8,
  1800000, 2800000, 'INR', 'active', true, true, 'premium'
),

-- 2. Lead AI / ML Research Engineer
(
  'demo-employer-001',
  'Lead AI / ML Research Engineer',
  'Join our cutting-edge AI labs to research, design, and deploy advanced machine learning models and LLM-powered workflows. You will lead the development of our automated intelligence pipelines and recommendation engines.',
  '- Master’s or Ph.D. in Computer Science, AI, or related quantitative field\n- 4+ years of industry experience deploying PyTorch or TensorFlow models to production\n- Expertise in Large Language Models (LLMs), RAG architectures, and fine-tuning\n- Strong experience with Vector Databases (Pinecone, Qdrant, Milvus)\n- Proficiency in Python, C++, and CUDA optimization',
  '- Train and evaluate custom deep learning models for NLP and computer vision\n- Build high-availability inference microservices using FastAPI and Triton\n- Implement Retrieval-Augmented Generation (RAG) pipelines for contextual AI',
  '["Python", "PyTorch", "LLMs", "LangChain", "Vector DBs", "FastAPI"]'::jsonb,
  'Remote', 'IN', 'Remote', 'Full-time', 4, 10,
  2500000, 4000000, 'INR', 'active', true, false, 'urgent'
),

-- 3. DevOps & Cloud Security Architect
(
  'demo-employer-001',
  'DevOps & Cloud Security Architect',
  'Looking for a DevOps Architect to manage our cloud infrastructure, CI/CD pipelines, and zero-trust security compliance across multi-region AWS environments.',
  '- 6+ years of experience in DevOps/SRE roles\n- Deep knowledge of Kubernetes (EKS/GKE), Docker, and Helm\n- Expert level Infrastructure as Code (Terraform, CloudFormation)\n- Strong background in IAM, KMS, SOC2 compliance, and network security',
  '- Maintain multi-tenant Kubernetes infrastructure with high uptime SLAs\n- Automate deployment pipelines using GitHub Actions and ArgoCD\n- Implement centralized logging, metrics (Prometheus/Grafana), and tracing',
  '["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Security"]'::jsonb,
  'Mumbai, Maharashtra', 'IN', 'On-site', 'Full-time', 6, 12,
  2200000, 3200000, 'INR', 'active', false, true, 'premium'
),

-- 4. Senior Product Manager - Enterprise SaaS
(
  'demo-employer-001',
  'Senior Product Manager - Enterprise SaaS',
  'We are looking for a visionary Senior Product Manager to drive product strategy, user discovery, and feature roadmap for our fast-growing B2B enterprise SaaS product line.',
  '- 4+ years of Product Management experience in B2B SaaS\n- Proven track record of launching features from 0 to 1 with measurable adoption\n- Strong analytical mindset using Mixpanel, Amplitude, or Google Analytics\n- Exceptional stakeholder management and agile sprint execution',
  '- Define product vision, OKRs, and detailed user stories\n- Conduct customer interviews and usability testing to validate roadmap priorities\n- Partner closely with engineering, design, and GTM teams to launch on time',
  '["Product Strategy", "Agile", "User Research", "Mixpanel", "Roadmapping"]'::jsonb,
  'Hyderabad, Telangana', 'IN', 'Hybrid', 'Full-time', 4, 9,
  2000000, 3000000, 'INR', 'active', true, false, 'featured'
),

-- 5. Principal Backend Go Developer
(
  'demo-employer-001',
  'Principal Backend Go Developer',
  'Seeking a Principal Go Engineer to architect low-latency, event-driven microservices capable of handling millions of real-time transactions daily.',
  '- 6+ years of backend development experience, with at least 3 years in Go (Golang)\n- Solid knowledge of concurrency, gRPC, Protobuf, and event streaming (Apache Kafka)\n- Experience with relational databases and high-performance caching (Redis, Memcached)\n- Experience in distributed systems architecture and domain-driven design',
  '- Build ultra-fast Go microservices for order matching and financial clearing\n- Optimize memory usage, CPU benchmarks, and database query throughput\n- Establish architectural blueprints and design patterns across the backend team',
  '["Golang", "gRPC", "Microservices", "Kafka", "Redis", "PostgreSQL"]'::jsonb,
  'Remote', 'IN', 'Remote', 'Full-time', 6, 11,
  2400000, 3600000, 'INR', 'active', false, false, 'basic'
),

-- 6. Senior Mobile Engineer (React Native)
(
  'demo-employer-001',
  'Senior Mobile Engineer (React Native)',
  'We are looking for a Senior Mobile Developer to craft buttery-smooth cross-platform mobile app experiences for our 2M+ active mobile customer base.',
  '- 4+ years of experience building production mobile apps using React Native\n- Strong knowledge of native iOS (Swift) or Android (Kotlin) bridge integrations\n- Experience with state management (Zustand, Redux Toolkit, React Query)\n- Familiarity with app publishing on Apple App Store & Google Play Store',
  '- Implement pixel-perfect mobile UIs with micro-animations\n- Optimize app startup time, bundle size, and offline caching\n- Integrate biometrics, push notifications, and deep linking',
  '["React Native", "TypeScript", "iOS", "Android", "Redux", "Zustand"]'::jsonb,
  'Pune, Maharashtra', 'IN', 'Hybrid', 'Full-time', 4, 8,
  1600000, 2400000, 'INR', 'active', false, true, 'urgent'
),

-- 7. Lead UI/UX & Design Systems Specialist
(
  'demo-employer-001',
  'Lead UI/UX & Design Systems Specialist',
  'Lead our UI/UX design vision and build scalable, accessible design systems that power our web, tablet, and mobile applications.',
  '- 5+ years of UI/UX design experience for SaaS/consumer applications\n- Expert proficiency in Figma, design systems, auto-layout, and tokens\n- Strong understanding of WCAG accessibility standards and interactive prototyping\n- Portfolio showcasing end-to-end product design lifecycle',
  '- Maintain and expand our multi-platform component design library\n- Create high-fidelity wireframes, interactive user flows, and click-through prototypes\n- Conduct qualitative user testing and convert insight into refined interfaces',
  '["Figma", "Design Systems", "User Testing", "Prototyping", "UX Research"]'::jsonb,
  'Gurgaon, Haryana', 'IN', 'Hybrid', 'Full-time', 5, 9,
  1500000, 2200000, 'INR', 'active', false, false, 'basic'
),

-- 8. Senior Data Engineer & Data Warehouse Architect
(
  'demo-employer-001',
  'Senior Data Engineer & Data Warehouse Architect',
  'Join as Senior Data Engineer to design, build, and optimize enterprise data warehouses and streaming data infrastructure.',
  '- 4+ years experience in Data Engineering and Data Warehousing\n- Mastery of Python, SQL, and PySpark/Snowflake/BigQuery\n- Hands-on experience with orchestrators (Apache Airflow, Dagster, dbt)\n- Experience with data modeling (Star Schema, Data Vault 2.0)',
  '- Build automated ETL/ELT pipelines ingesting structured & unstructured data\n- Ensure data quality, lineage, data governance, and data cataloging\n- Optimize warehouse compute costs and query performance',
  '["PySpark", "Snowflake", "dbt", "Airflow", "BigQuery", "SQL"]'::jsonb,
  'Remote', 'IN', 'Remote', 'Full-time', 4, 8,
  2000000, 3000000, 'INR', 'active', true, false, 'featured'
),

-- 9. Cybersecurity & Penetration Testing Lead
(
  'demo-employer-001',
  'Cybersecurity & Penetration Testing Lead',
  'Responsible for conducting ethical hacking, vulnerability assessments, and threat mitigation across web applications, cloud APIs, and internal networks.',
  '- 5+ years of experience in Offensive Security / Penetration Testing\n- Valid certifications: OSCP, CEH, CISSP, or GWAPT\n- In-depth knowledge of OWASP Top 10, API vulnerabilities, and exploit frameworks\n- Experience with Burp Suite, Metasploit, Wireshark, and Python scripting',
  '- Execute scheduled penetration tests on web apps, mobile apps, and cloud networks\n- Conduct threat modeling and security architectural reviews prior to major releases\n- Provide remediations and guidance to backend software engineers',
  '["Penetration Testing", "OWASP", "Ethical Hacking", "Burp Suite", "Python"]'::jsonb,
  'Noida, Uttar Pradesh', 'IN', 'On-site', 'Full-time', 5, 10,
  1800000, 2600000, 'INR', 'active', false, true, 'urgent'
),

-- 10. Staff Frontend Engineer (Next.js & Performance)
(
  'demo-employer-001',
  'Staff Frontend Engineer (Next.js & Performance)',
  'Drive frontend architecture, Web Vitals performance benchmarks, and modern component engineering across all web platforms.',
  '- 7+ years of frontend development with deep mastery of Next.js, React, and TypeScript\n- Expert understanding of browser rendering, Web Vitals, SSR/SSG/ISR, and hydration\n- Experience with Tailwind CSS, Webpack/Vite bundlers, and micro-frontends\n- Track record of mentoring engineering teams and driving engineering standards',
  '- Establish frontend guidelines, build tooling, and automated CI quality checks\n- Profile and eliminate performance bottlenecks, memory leaks, and layout shifts\n- Collaborate with backend team on API contracts and server-side rendering strategies',
  '["Next.js", "React", "TypeScript", "Tailwind CSS", "Web Vitals", "Vite"]'::jsonb,
  'Remote', 'IN', 'Remote', 'Full-time', 7, 12,
  2200000, 3400000, 'INR', 'active', true, true, 'premium'
);

-- Synchronize with jobs table if present
INSERT INTO jobs (
  employer_id, title, description, requirements, skills, location, work_mode, type, salary_min, salary_max, status, job_type
)
SELECT 
  employer_id, title, description, requirements, 
  ARRAY(SELECT jsonb_array_elements_text(skills)), 
  location, work_mode, employment_type, 
  salary_min::text, salary_max::text, status, job_type
FROM employer_job_posts
ON CONFLICT DO NOTHING;
