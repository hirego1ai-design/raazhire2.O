# UPSKILL PORTAL IMPLEMENTATION PLAN

## Design System ✅ COMPLETE
- Premium color palette (Electric Indigo, AI Cyan, Soft Emerald)
- Large radius system (32px-56px cards, pill buttons)
- 3-layer shadow system
- Elegant gradient utilities
- Soft, calm animations

## Pages to Create

### PAGE 1 - Upskill Landing Page ⏳ IN PROGRESS
**Route**: `/upskill` or  update `/skill-development`
**File**: `src/pages/upskill/UpskillLanding.tsx`

Sections:
- ✅ Hero Section (headline, subtext, CTAs, gradient waves)
- ✅ Skill Category Cards (8 large rounded cards)
- ✅ How Upskill Works (horizontal flow)
- ✅ AI-Powered Features (floating cards)
- ✅ Final CTA

### PAGE 2 - Course List Page 📝 PENDING
**Route**: `/upskill/courses`
**File**: `src/pages/upskill/CourseList.tsx`

Features:
- Large rounded course tiles
- Calm spacing, smooth hover
- Soft shadows

### PAGE 3 - Course Detail Page 📝 PENDING
**Route**: `/upskill/course/:id`
**File**: `src/pages/upskill/CourseDetail.tsx`

Components:
- Large curved video player
- Course description card
- Module list (rounded cards)
- Progress indicator
- CTA buttons

### PAGE 4 - Lesson Page 📝 PENDING
**Route**: `/upskill/course/:courseId/lesson/:lessonId`
**File**: `src/pages/upskill/Lesson.tsx`

Layout:
- Big rounded video container
- Notes card (rounded)
- Quiz card (rounded)
- Progress tracker

### PAGE 5 - AI Skill Assessment Page 📝 PENDING
**Route**: `/upskill/assessment/:assessmentId`
**File**: `src/pages/upskill/Assessment.tsx`

Design:
- Large rounded webcam box
- Calm instruction panel
- Pill "Start Assessment" button
- Minimal proctoring indicators

### PAGE 6 - Skill Score Dashboard 📝 PENDING
**Route**: `/upskill/dashboard`
**File**: `src/pages/upskill/SkillDashboard.tsx`

Display:
- Skill Score (circular meters)
- Confidence, Communication, Hiring Readiness
- Strengths & Improvements
- Recommended Jobs

### PAGE 7 - Certificate Page 📝 PENDING
**Route**: `/upskill/certificate/:id`
**File**: `src/pages/upskill/Certificate.tsx`

Components:
- Certificate preview (rounded frame)
- Soft golden highlight
- Download button (pill)
- Skill badges (rounded chips)

### PAGE 8 - Job Portal Connection 📝 PENDING
**Route**: `/upskill/jobs`
**File**: `src/pages/upskill/JobConnection.tsx`

Features:
- Recommended Jobs Based on Skills
- Extra rounded job cards
- Match % display
- "Apply Now" pill button
- Visual skill→job connection

## Routing Updates Needed
- Add `/upskill/*` routes to `App.tsx`
- Create index route for each page
- Ensure navigation from Navbar

## Shared Components to Create
- `PremiumButton.tsx` - Fully pill-shaped with glow
- `SkillCard.tsx` - Large rounded card with 3D icon
- `VideoPlayer.tsx` - Rounded video container
- `ProgressIndicator.tsx` - Smooth, elegant tracker
- `JobCard.tsx` - Rounded with match %

## Key Design Rules (STRICT)
- ✅ NO medium radius - 32px+ or pill (999px)
- ✅ Soft, wide shadows (not harsh)
- ✅ Calm gradients (Electric Indigo, AI Cyan, Soft Emerald)
- ✅ Everything feels lifted physically
- ✅ Apple-level softness
- ✅ Breathing space everywhere

## Next Actions
1. Create PAGE 1 Landing Page first ✅ 
2. Test and verify design feel
3. Create remaining pages systematically
4. Connect routing
5. Final design audit
