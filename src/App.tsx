import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import LoginCard from './components/LoginCard';
import CandidateRegister from './pages/auth/CandidateRegister';
import EmployerRegister from './pages/auth/EmployerRegister';
import DashboardLayout from './layouts/DashboardLayout';
import CreateAccount from './pages/auth/CreateAccount';
import CandidateDashboard from './pages/candidate/Dashboard';
import Profile from './pages/candidate/Profile';
import VideoResume from './pages/candidate/VideoResume';
import Assessments from './pages/candidate/Assessments';
import Jobs from './pages/candidate/Jobs';
import GamificationDashboard from './pages/candidate/GamificationDashboard';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import InterviewPage from './pages/candidate/Interview';
import LiveAssessment from './pages/candidate/LiveAssessment';
import AssessmentResult from './pages/candidate/AssessmentResult';
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
import CandidateRankings from './pages/employer/CandidateRankings';
import PerformanceAnalytics from './pages/admin/PerformanceAnalytics';
import MyJobs from './pages/employer/MyJobs';
import JobDetail from './pages/employer/JobDetail';

function App() {
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-space-dark text-white font-outfit">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/register/candidate" element={<CandidateRegister />} />
          <Route path="/register/employer" element={<EmployerRegister />} />
          <Route path="/create-account" element={<CreateAccount />} />
          {/* Candidate Routes */}
          <Route path="/candidate" element={<DashboardLayout />}>
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="video-resume" element={<VideoResume />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="gamification" element={<GamificationDashboard />} />
            <Route path="interviews" element={<CandidateInterviews />} />
            <Route path="interview/:id" element={<InterviewPage />} />
            <Route path="live-assessment/:jobId" element={<LiveAssessment />} />
            <Route path="assessment-result/:jobId" element={<AssessmentResult />} />
          </Route>

          {/* Employer Routes */}
          <Route path="/employer" element={<EmployerLayout />}>
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="jobs" element={<MyJobs />} />
            <Route path="job/:jobId" element={<JobDetail />} />
            <Route path="post-job" element={<JobPostingForm />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidate/:id" element={<CandidateProfileView />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="interview-schedule/:id" element={<InterviewSchedule />} />
            <Route path="settings" element={<Settings />} />
            <Route path="make-agreement" element={<MakeAgreement />} />
            <Route path="rankings/:jobId" element={<CandidateRankings />} />
          </Route>

          {/* Admin Routes */}
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
          </Route>
        </Routes>
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
    </Router>
  );
}

export default App;
