# Mock Data Usage Guide

## Overview
This file contains comprehensive mock data for testing and development of the HireGoAI platform.

## Data Structure

### 1. **Mock Candidates** (5 Profiles)
- **Priya Sharma** - Full Stack Developer (3 years exp)
- **Rahul Verma** - Senior Data Scientist (5 years exp, M.Tech)
- **Ananya Desai** - Senior UI/UX Designer (4 years exp)
- **Arjun Patel** - DevOps Engineer (2 years exp)
- **Sneha Reddy** - Digital Marketing Manager (4 years exp, MBA)

### 2. **Mock Employers** (3 Companies)
- **TechCorp Solutions** - IT Company (500-1000 employees)
- **InnovateAI Labs** - AI Company (100-500 employees)
- **Creative Design Studio** - Design Agency (50-100 employees)

### 3. **Mock Job Posts** (5 Positions)
- Senior Full Stack Developer - TechCorp (Approved, 12 applicants)
- Machine Learning Engineer - InnovateAI (Approved, 8 applicants)
- UI/UX Designer - Creative Design (Approved, 15 applicants)
- DevOps Engineer - TechCorp (Pending, 0 applicants)
- Digital Marketing Manager - InnovateAI (Approved, 10 applicants)

### 4. **Mock Applications** (10 Applications)
Various application statuses: applied, screened, shortlisted, interview_scheduled, hired

## Usage Examples

### Import Mock Data
```typescript
import { 
  mockCandidates, 
  mockEmployers, 
  mockJobPosts, 
  mockApplications,
  getCandidateById,
  getCandidatesForJob,
  getJobsForEmployer
} from '@/data/mockData';
```

### Get All Candidates
```typescript
const candidates = mockCandidates;
// Returns array of 5 candidates
```

### Get Candidates for Specific Job
```typescript
const jobCandidates = getCandidatesForJob('job_001');
// Returns candidates who applied for "Senior Full Stack Developer"
```

### Get Jobs for Employer
```typescript
const employerJobs = getJobsForEmployer('emp_001');
// Returns all jobs posted by TechCorp Solutions
```

### Get Approved Jobs Only
```typescript
import { getApprovedJobs } from '@/data/mockData';
const approvedJobs = getApprovedJobs();
// Returns only approved job posts
```

## Data Fields

### Candidate Profile Includes:
- ✅ Personal information (name, email, phone, DOB, addresses)
- ✅ Education (10th, 12th, Graduation, Post-Graduation)
- ✅ Work experience history
- ✅ Skills with proficiency scores
- ✅ Video resume URLs
- ✅ Profile photos (generated via UI Avatars)
- ✅ Gamification data (points, rank, badges)

### Job Post Includes:
- ✅ Complete job details (title, company, location)
- ✅ Salary range and currency
- ✅ Required skills and education
- ✅ Job type and remote preferences
- ✅ Approval status
- ✅ Applicant count
- ✅ Selected plan (free, pay-per-hire, etc.)

### Application Includes:
- ✅ Candidate and job linking
- ✅ Application status tracking
- ✅ AI matching score
- ✅ Application date

## Testing Scenarios

### Scenario 1: Employer Views Candidates for Job
```typescript
const candidates = getCandidatesForJob('job_001');
// Shows 4 candidates who applied for Senior Full Stack Developer
```

### Scenario 2: Candidate Dashboard
```typescript
const candidate = getCandidateById('cand_001');
const applications = getApplicationsForCandidate('cand_001');
// Shows Priya Sharma's profile and her 2 job applications
```

### Scenario 3: Employer Dashboard
```typescript
const employer = getEmployerById('emp_001');
const jobs = getJobsForEmployer('emp_001');
// Shows TechCorp's profile and their 2 job postings
```

## Notes
- All video resume URLs currently point to placeholder
- Profile photos use UI Avatars API for generation
- Data is realistic and follows Indian job market standards
- Includes diverse educational backgrounds and experience levels
- Status progression: applied → screened → shortlisted → interview_scheduled → hired
