import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import UpskillLanding from './pages/upskill/UpskillLanding';
import CourseList from './pages/upskill/CourseList';
import CourseDetail from './pages/upskill/CourseDetail';
import Lesson from './pages/upskill/Lesson';
import Assessment from './pages/upskill/Assessment';
import SkillDashboard from './pages/upskill/SkillDashboard';
import Certificate from './pages/upskill/Certificate';
import JobConnection from './pages/upskill/JobConnection';
import UpskillRegistration from './pages/upskill/UpskillRegistration';
import UpskillLogin from './pages/upskill/UpskillLogin';
import UpskillInsights from './pages/upskill/UpskillInsights';
import SkillAssessment from './pages/upskill/SkillAssessment';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import LoginCard from './components/LoginCard';
import CandidateRegister from './pages/auth/CandidateRegister';
import EmployerRegister from './pages/auth/EmployerRegister';
import DashboardLayout from './layouts/DashboardLayout';
import CreateAccount from './pages/auth/CreateAccount';
import CandidateDashboard from './pages/candidate/Dashboard';
import UniversalDashboard from './pages/UniversalDashboard';
import Profile from './pages/candidate/Profile';
import VideoResume from './pages/candidate/VideoResume';
import Assessments from './pages/candidate/Assessments';
import Jobs from './pages/candidate/Jobs';
import GamificationDashboard from './pages/candidate/GamificationDashboard';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import InterviewPage from './pages/candidate/Interview';
import LiveAssessment from './pages/candidate/LiveAssessment';
import AssessmentResult from './pages/candidate/AssessmentResult';
import Applications from './pages/candidate/Applications';
import Connections from './pages/candidate/Connections';
import Messages from './pages/Messages'; // Shared Messages Component
import CandidateSettings from './pages/candidate/Settings';
import ReferralDashboard from './pages/candidate/ReferralDashboard';
import ReferralAdmin from './pages/admin/ReferralAdmin';
import EmployerLayout from './layouts/EmployerLayout';
import EmployerDashboard from './pages/employer/Dashboard';
import JobPostingForm from './pages/employer/JobPostingForm';
import Candidates from './pages/employer/Candidates';
import CandidateProfileView from './pages/employer/CandidateProfileView';
import Interviews from './pages/employer/Interviews';
import InterviewSchedule from './pages/employer/InterviewSchedule';
import Settings from './pages/employer/Settings';
import MakeAgreement from './pages/employer/MakeAgreement';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import APIConfig from './pages/admin/APIConfig';
import UserManagement from './pages/admin/UserManagement';
import SystemLogs from './pages/admin/SystemLogs';
import EmailConfig from './pages/admin/EmailConfig';
import AIControl from './pages/admin/AIControl';
import ProctoringConfig from './pages/admin/ProctoringConfig';
import PaymentConfig from './pages/admin/PaymentConfig';
import JobPricingControl from './pages/admin/JobPricingControl';
import CreditSystemControl from './pages/admin/CreditSystemControl';
import InterviewManagement from './pages/admin/InterviewManagement';
import VideoStorageConfig from './pages/admin/VideoStorageConfig';
import UpskillCourseManagement from './pages/admin/UpskillCourseManagement';
import UpskillLearnerProgress from './pages/admin/UpskillLearnerProgress';
import CandidateRankings from './pages/employer/CandidateRankings';
import PerformanceAnalytics from './pages/admin/PerformanceAnalytics';
import MyJobs from './pages/employer/MyJobs';
import JobDetail from './pages/employer/JobDetail';

import EducatorLayout from './layouts/EducatorLayout';
import EducatorDashboard from './pages/educator/Dashboard';
import EducatorCourseManagement from './pages/educator/CourseManagement';
import EducatorLiveStream from './pages/educator/LiveStream';
import EducatorComments from './pages/educator/Comments';
import EducatorSettings from './pages/educator/Settings';
import EducatorLogin from './pages/educator/Login';

import GeneralPage from './pages/GeneralPage';
import PricingPage from './pages/Pricing';
import EnterprisePage from './pages/Enterprise';
import CompanyPage from './pages/Company';
import AboutPage from './pages/About';
import Footer from './components/Footer';
import CareersPage from './pages/Careers';
import BlogPage from './pages/Blog';
import TermsPage from './pages/Terms';
import PrivacyPage from './pages/Privacy';

import ContactPage from './pages/Contact';
import PageEditor from './pages/admin/PageEditor';
import AdminLogin from './pages/admin/AdminLogin';
import AuthCallback from './pages/AuthCallback';

function App() {
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <Router>
      <AppContent showLogin={showLogin} setShowLogin={setShowLogin} />
    </Router>
  );
}

function AppContent({ showLogin, setShowLogin }: { showLogin: boolean; setShowLogin: (v: boolean) => void }) {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/employer') ||
    location.pathname.startsWith('/candidate') ||
    location.pathname.startsWith('/educator') ||
    location.pathname.startsWith('/register/upskill') ||
    location.pathname.startsWith('/upskill/login') ||
    location.pathname.startsWith('/auth/callback');

  return (
    <div className="min-h-screen bg-white text-gray-900 font-outfit">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/skill-development" element={<Navigate to="/upskill" replace />} />

        {/* Upskill Portal Routes */}
        <Route path="/upskill" element={<UpskillLanding />} />
        <Route path="/upskill/courses" element={<CourseList />} />
        <Route path="/upskill/course/:id" element={<CourseDetail />} />
        <Route path="/upskill/course/:courseId/lesson/:lessonId" element={<Lesson />} />
        <Route path="/upskill/assessment/:id" element={<Assessment />} />
        <Route path="/upskill/dashboard" element={<SkillDashboard />} />
        <Route path="/upskill/certificate/:id" element={<Certificate />} />
        <Route path="/upskill/jobs" element={<JobConnection />} />
        <Route path="/upskill/insights" element={<UpskillInsights />} />
        <Route path="/upskill/assessment" element={<SkillAssessment />} />

        {/* Public Pages */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/jobs" element={<Jobs />} />

        <Route path="/post-job-public" element={<GeneralPage title="Post a Job" subtitle="Start your hiring journey with HireGo AI." />} />
        <Route path="/ai-features" element={<GeneralPage title="AI Features" subtitle="Explore our cutting-edge autonomous agents." />} />
        <Route path="/find-jobs" element={<GeneralPage title="Find Jobs" subtitle="Discover your next career opportunity." />} />
        <Route path="/certifications" element={<GeneralPage title="Certifications" subtitle="Validate your skills with our AI assessments." />} />
        <Route path="/career-resources" element={<GeneralPage title="Career Resources" subtitle="Guides, tips, and tools for your career growth." />} />

        <Route path="/landing-old" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/educator-login" element={<EducatorLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register/candidate" element={<CandidateRegister />} />
        <Route path="/register/employer" element={<EmployerRegister />} />
        <Route path="/register/upskill" element={<UpskillRegistration />} />
        <Route path="/upskill/login" element={<UpskillLogin />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Candidate Routes */}
        <Route path="/candidate" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UniversalDashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="connections" element={<Connections />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<CandidateSettings />} />

          {/* Internal/Legacy Routes */}
          <Route path="overview" element={<CandidateDashboard />} />
          <Route path="video-resume" element={<VideoResume />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="gamification" element={<GamificationDashboard />} />
          <Route path="interviews" element={<CandidateInterviews />} />
          <Route path="interview/:id" element={<InterviewPage />} />
          <Route path="live-assessment/:jobId" element={<LiveAssessment />} />
          <Route path="assessment-result/:jobId" element={<AssessmentResult />} />
          <Route path="referrals" element={<ReferralDashboard />} />
        </Route>

        {/* Employer Routes */}
        <Route path="/employer" element={<EmployerLayout />}>
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="overview" element={<UniversalDashboard />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="job/:jobId" element={<JobDetail />} />
          <Route path="post-job" element={<JobPostingForm />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="messages" element={<Messages />} />
          <Route path="candidate/:id" element={<CandidateProfileView />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interview-schedule/:id" element={<InterviewSchedule />} />
          <Route path="settings" element={<Settings />} />
          <Route path="make-agreement" element={<MakeAgreement />} />
          <Route path="rankings/:jobId" element={<CandidateRankings />} />
          <Route path="referrals" element={<ReferralDashboard />} />
        </Route>

        {/* Educator Routes */}
        <Route path="/educator" element={<EducatorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EducatorDashboard />} />
          <Route path="courses" element={<EducatorCourseManagement />} />
          <Route path="live" element={<EducatorLiveStream />} />
          <Route path="comments" element={<EducatorComments />} />
          <Route path="settings" element={<EducatorSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="api-config" element={<APIConfig />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="email-config" element={<EmailConfig />} />
          <Route path="ai-control" element={<AIControl />} />
          <Route path="proctoring" element={<ProctoringConfig />} />
          <Route path="payment-config" element={<PaymentConfig />} />
          <Route path="job-pricing" element={<JobPricingControl />} />
          <Route path="credit-system" element={<CreditSystemControl />} />
          <Route path="interviews" element={<InterviewManagement />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="video-storage" element={<VideoStorageConfig />} />

          <Route path="analytics" element={<PerformanceAnalytics />} />
          <Route path="pages" element={<PageEditor />} />
          <Route path="upskill-courses" element={<UpskillCourseManagement />} />
          <Route path="upskill-learners" element={<UpskillLearnerProgress />} />
          <Route path="referrals" element={<ReferralAdmin />} />
        </Route>

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      {showLogin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLogin(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <LoginCard onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
