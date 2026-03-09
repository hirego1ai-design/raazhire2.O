# 🔍 CANDIDATE PROFILE AUDIT REPORT
## HireGo AI – Complete Section-by-Section Analysis
**Generated:** Feb 17, 2026  
**Scope:** All candidate sections (Overview, Job, Video Resume, Assessment, Growth, Application, Message, Profile, Settings)

---

## EXECUTIVE SUMMARY

| Category | Status |
|----------|--------|
| **Critical Bugs** | 🔴 3 found |
| **Medium Issues** | 🟡 5 found |
| **Low / Cosmetic** | 🟢 3 found |
| **Working Correctly** | ✅ 4 sections |

---

## 1. OVERVIEW / DASHBOARD (`/candidate/dashboard`)

**Frontend:** `src/pages/candidate/Dashboard.tsx`  
**Route:** Maps to `<CandidateDashboard />`  
**Status:** 🟡 PARTIALLY WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.candidate.stats` → `/api/candidate/stats` | ✅ Exists in `portal_routes.js:1235` | 🔴 **BUG** |
| `endpoints.interviews.candidate` → `/api/interviews` | ❌ Wrong URL | 🔴 **BUG** |
| `endpoints.jobs` → `/api/jobs` | ✅ Exists in `portal_routes.js:23` | 🔴 **RLS BUG** |

### Issues Found:

#### 🔴 CRITICAL: Interview Endpoint Mismatch
- **Frontend** calls `endpoints.interviews.candidate` which resolves to `/api/interviews` (line 35 in `api.ts`)
- **Backend** route is registered at `/api/interviews/candidate` (line 1009 in `portal_routes.js`)
- **Impact:** Interviews will never load on Dashboard or CandidateInterviews page
- **Fix Required:** Update `api.ts` line 35: change `candidate: \`${API_BASE_URL}/api/interviews\`` → `candidate: \`${API_BASE_URL}/api/interviews/candidate\``

#### 🔴 CRITICAL: Candidate Stats uses wrong table name
- Backend route `/api/candidate/stats` queries from table `'applications'` (line 1240)
- **Actual table name** in the database is `job_applications` (per `hirego_fresh_install.sql:443`)
- There is NO table called `applications` — it was dropped in the fresh install script (`DROP TABLE IF EXISTS applications CASCADE;` line 63)
- **Impact:** Stats endpoint will silently fail or return 0 for all application-related counts
- **Fix Required:** Change all `.from('applications')` to `.from('job_applications')` in the stats endpoint (lines 1240, 1245, 1257, 1263)

#### 🔴 CRITICAL: `/api/jobs` RLS Permission Denied
- Server log shows: `Error fetching jobs: { code: '42501', message: 'permission denied for table users' }`
- The `/api/jobs` route tries to JOIN `users` table via `employer:users!employer_job_posts_employer_id_fkey(id, name, avatar_url)`
- The `users` table likely has RLS enabled but no policy allowing the service role (or anon) to read it
- **Impact:** Jobs endpoint returns 500 error, recommended jobs won't load
- **Fix Required:** Add RLS policy to `users` table: `CREATE POLICY "Allow read access to users" ON users FOR SELECT USING (true);`

---

## 2. JOBS (`/candidate/jobs`)

**Frontend:** `src/pages/candidate/Jobs.tsx`  
**Route:** Maps to `<Jobs />`  
**Status:** 🔴 BROKEN (same RLS issue)

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.jobs` → `/api/jobs` | ✅ Exists in `portal_routes.js:23` | 🔴 RLS Error |

### Issues Found:

#### 🔴 Same RLS issue as Dashboard
- The jobs list cannot load because the `users` table JOIN fails with `permission denied`
- This blocks the entire job browsing experience for candidates

---

## 3. VIDEO RESUME (`/candidate/video-resume`)

**Frontend:** `src/pages/candidate/VideoResume.tsx`  
**Route:** Maps to `<VideoResume />`  
**Status:** 🟡 PARTIALLY WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `supabase.from('candidates')` | Direct Supabase query | ✅ Works |
| `endpoints.videoResume` → `/api/video-resume/upload` | ✅ Exists in `server/index.js:510+` | ✅ Works (fixed in previous session) |

### Issues Found:

#### 🟡 MEDIUM: AI Provider Failures
- From server logs: Gemini model works but GPT-4 returns `model_not_found` and DeepSeek returns `Insufficient Balance`
- The fallback chain works correctly (returns score with `usedFallback: true`) but analysis quality degrades
- **Impact:** Analysis relies solely on Gemini; if Gemini fails, results will be generic fallback scores
- **Recommendation:** Update GPT-4 model name or verify API key tier, top up DeepSeek balance

---

## 4. ASSESSMENTS (`/candidate/assessments`)

**Frontend:** `src/pages/candidate/Assessments.tsx`  
**Route:** Maps to `<Assessments />`  
**Status:** 🟡 PARTIALLY WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `${API_BASE_URL}/api/upskill/assessments` | ✅ Exists in `upskill_routes.js:587` | ✅ Works |
| `${API_BASE_URL}/api/upskill/assessment/${id}` | ✅ Exists in `upskill_routes.js:531` | ✅ Works |

### Database Tables:
| Table | Exists in Schema | Status |
|-------|-----------------|--------|
| `assessment_results` | ✅ In `db_schema_upskill.sql:100` and `db_schema_final.sql:118` | ⚠️ Check deployed |

### Issues Found:

#### 🟡 MEDIUM: `assessment_results` table may not exist
- The `hirego_fresh_install.sql` script DROPS this table (line 64: `DROP TABLE IF EXISTS assessment_results CASCADE;`) but does NOT recreate it
- The table definition is in `db_schema_upskill.sql` and `db_schema_final.sql` but these are separate scripts
- If only the fresh install was run, assessment results cannot be saved
- **Fix Required:** Run `db_schema_upskill.sql` or `db_schema_final.sql` in Supabase SQL Editor to create the `assessment_results` table

---

## 5. GROWTH / GAMIFICATION (`/candidate/gamification`)

**Frontend:** `src/pages/candidate/GamificationDashboard.tsx`  
**Route:** Maps to `<GamificationDashboard />`  
**Status:** ✅ WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.gamification` → `/api/upskill/gamification` | ✅ Exists in `upskill_routes.js:784` | ✅ Works |

### Issues Found:
- None critical. The gamification endpoint returns mock/computed data from upskill tables.

---

## 6. APPLICATIONS (`/candidate/applications`)

**Frontend:** `src/pages/candidate/Applications.tsx`  
**Route:** Maps to `<Applications />`  
**Status:** ✅ WORKING (with caveat)

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.candidate.applications` → `/api/applications/candidate` | ✅ Exists in `portal_routes.js:610` | ✅ Works |
| `${API_BASE_URL}/api/applications/${appId}/withdraw` | ✅ Exists in `portal_routes.js:751` | ✅ Works |

### Database Tables:
| Table | Backend Column | Schema Column | Status |
|-------|---------------|---------------|--------|
| `job_applications` | Used correctly | ✅ Matches schema | ✅ |

### Issues Found:
- The applications endpoint uses `job_applications` table correctly ✅
- Withdraw endpoint works with PATCH method ✅

---

## 7. MESSAGES (`/candidate/messages`)

**Frontend:** `src/pages/Messages.tsx` (shared component)  
**Route:** Maps to `<Messages />`  
**Status:** ✅ WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.profile` → `/api/profile` | ✅ Exists in `portal_routes.js:548` | ✅ Works |
| `endpoints.messages.conversations` → `/api/conversations` | ✅ Exists in `engagement_routes.js:11` | ✅ Works |
| `endpoints.messages.send` → `/api/messages` | ✅ Exists in `engagement_routes.js:159` | ✅ Works |

### Database Tables Required:
| Table | Status |
|-------|--------|
| `conversations` | ⚠️ Must exist in Supabase |
| `messages` | ⚠️ Must exist in Supabase |

### Issues Found:

#### 🟡 MEDIUM: Conversations/Messages tables not in fresh install
- The `hirego_fresh_install.sql` does NOT create `conversations` or `messages` tables
- These tables may exist from a previous migration but are not guaranteed
- **Fix Required:** Verify these tables exist in Supabase. If not, create them via the engagement schema.

---

## 8. PROFILE (`/candidate/profile`)

**Frontend:** `src/pages/candidate/Profile.tsx`  
**Route:** Maps to `<Profile />`  
**Status:** 🟡 PARTIALLY WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.profile` → `/api/profile` | ✅ Exists in `portal_routes.js:548` AND `portal_routes.js:1297` | ⚠️ DUPLICATE |

### Issues Found:

#### 🟡 MEDIUM: Duplicate `/api/profile` GET route
- There are TWO `app.get('/api/profile', ...)` handlers registered:
  1. **Line 548:** Rich version – fetches from `users`, `candidates`, `candidate_experience`, `candidate_skills`, merges data
  2. **Line 1297:** Simpler version – fetches from `users`, `user_profiles`, and role-specific tables
- Express will use the FIRST registered handler (line 548), the second is dead code
- The first handler references tables `candidate_experience` and `candidate_skills` which do NOT exist in `hirego_fresh_install.sql`
- **Impact:** Profile fetch may fail silently or return incomplete data when these tables don't exist
- **Fix Required:** 
  1. Remove the duplicate route at line 1297
  2. Add `candidate_experience` and `candidate_skills` tables to the database, OR update the profile route to use `user_profiles` table instead

#### 🟡 MEDIUM: Missing database tables
| Table | Referenced In | Exists in Schema | Status |
|-------|--------------|-----------------|--------|
| `candidate_experience` | `portal_routes.js:568` | ❌ NOT in `hirego_fresh_install.sql` | 🔴 Missing |
| `candidate_skills` | `portal_routes.js:572` | ❌ NOT in `hirego_fresh_install.sql` | 🔴 Missing |

---

## 9. SETTINGS (`/candidate/settings`)

**Frontend:** `src/pages/candidate/Settings.tsx`  
**Route:** Maps to `<CandidateSettings />`  
**Status:** ✅ WORKING (Static UI)

### API Calls Made:
- **None.** This is a purely static UI component showing settings sections
- No backend calls, no database interaction

### Issues Found:

#### 🟢 LOW: Settings is not functional
- The settings page only displays section cards (Account, Notifications, Privacy, Preferences, Billing) but clicking them does nothing
- No settings are actually saved or loaded from the database
- **Impact:** Users see a settings page but cannot change anything
- **Recommendation:** Future enhancement to connect to `/api/profile` for account settings

---

## 10. CONNECTIONS (`/candidate/connections`)

**Frontend:** `src/pages/candidate/Connections.tsx`  
**Route:** Maps to `<Connections />`  
**Status:** ✅ WORKING

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.connections` → `/api/connections` | ✅ Exists in `engagement_routes.js:239` | ✅ Works |

---

## 11. INTERVIEWS (`/candidate/interviews`)

**Frontend:** `src/pages/candidate/CandidateInterviews.tsx`  
**Route:** Maps to `<CandidateInterviews />`  
**Status:** 🔴 BROKEN

### API Calls Made:
| Endpoint | Backend Route | Status |
|----------|--------------|--------|
| `endpoints.interviews.candidate` → `/api/interviews` | Backend is at `/api/interviews/candidate` | 🔴 **MISMATCH** |

### Issues Found:
- Same critical endpoint mismatch as Dashboard (see Section 1)

---

## DATABASE SCHEMA SUMMARY

### Tables referenced by candidate routes but MISSING from `hirego_fresh_install.sql`:

| Table | Referenced By | Impact |
|-------|--------------|--------|
| `applications` (wrong name) | `/api/candidate/stats` | 🔴 Stats always return 0 |
| `candidate_experience` | `/api/profile` (GET handler #1) | 🟡 Profile returns empty experience |
| `candidate_skills` | `/api/profile` (GET handler #1) | 🟡 Profile returns empty skills |
| `assessment_results` | `/api/candidate/stats`, video upload | 🟡 No assessment tracking |
| `conversations` | `/api/conversations` | ⚠️ Might exist from separate migration |
| `messages` | `/api/messages` | ⚠️ Might exist from separate migration |

### RLS Policy Issues:
| Table | Issue |
|-------|-------|
| `users` | Missing SELECT policy — causes `/api/jobs` JOIN to fail with `permission denied` |

---

## 🔧 PRIORITY FIX LIST

### Priority 1: Critical Fixes (Must fix first)

1. **Fix Interview endpoint mismatch in `api.ts`**
   ```typescript
   // Change from:
   interviews: {
       candidate: `${API_BASE_URL}/api/interviews`,
       employer: `${API_BASE_URL}/api/interviews`,
   }
   // Change to:
   interviews: {
       candidate: `${API_BASE_URL}/api/interviews/candidate`,
       employer: `${API_BASE_URL}/api/interviews/employer`,
   }
   ```

2. **Fix table name in `/api/candidate/stats`** — Change `'applications'` → `'job_applications'`

3. **Add RLS policy to `users` table** — Run in Supabase SQL Editor:
   ```sql
   CREATE POLICY "Allow read access to users" ON users FOR SELECT USING (true);
   ```

### Priority 2: Medium Fixes

4. **Create missing tables** — Run `db_schema_upskill.sql` for `assessment_results`
5. **Create `candidate_experience` and `candidate_skills` tables** OR update profile route
6. **Remove duplicate `/api/profile` GET handler** at line 1297
7. **Verify `conversations` and `messages` tables exist** in Supabase

### Priority 3: Low Priority / Enhancements

8. **Make Settings page functional** — Connect to backend endpoints
9. **Update GPT-4 model name** or verify API key tier for better AI fallback
10. **Top up DeepSeek balance** for full AI provider coverage

---

*End of Audit Report*
