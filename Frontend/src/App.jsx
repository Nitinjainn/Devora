import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/Home/LandingPage";
import NotFound from "./pages/Notfound";
import LoginPage from "./pages/Auth/LoginPage";
import RegistrationPage from "./pages/Auth/RegistrationPage";
import DashboardPage from "./pages/mainDashboard/Page";
import OAuthSuccess from "./pages/OAuthSuccess";
import Loader from "./pages/Loader";
import About from "./pages/Home/About";
import HackathonDetailsPage from "./pages/AdminDashboard/components/HackathonDetailsPage";
import { ExploreHackathons } from "./pages/mainDashboard/partipantDashboard/ExploreHackathon";
import AdminPanel from "./pages/AdminDashboard/AdminPanel";
import { ProfileSection } from "./pages/mainDashboard/ProfileSection";
import { Blogs } from "./pages/mainDashboard/partipantDashboard/Blogs";
import InviteAccept from "./pages/InviteAccept";
import InviteRole from "./pages/InviteRole";
import { HackathonDetails } from "./pages/AdminDashboard/components/HackathonDetails";
import JudgePanel from "./pages/mainDashboard/judgeDashboard/JudgePanel";
import { ProjectArchive } from "./pages/mainDashboard/partipantDashboard/ProjectArchive";
import CreatedHackathons from "./pages/mainDashboard/organizerDashboard/Created-hackathons";
import EditHackathonPage from "./pages/mainDashboard/organizerDashboard/components/EditHackathonPage";
import JudgeProjectGallery from "./pages/mainDashboard/judgeDashboard/JudgeProjectGallery";
import AdminHackathonSubmissionsPage from "./pages/AdminDashboard/components/AdminHackathonSubmissionsPage";
import AdminSubmissionDetailsPage from "./pages/AdminDashboard/components/AdminSubmissionDetailsPage";
import {PublicProfileView} from "./pages/mainDashboard/PublicProfileView";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import TeamsParticipantsPage from "./pages/mainDashboard/partipantDashboard/components/TeamsParticipantsPage";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Landing and auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/loader" element={<Loader />} />

        {/* Admin - all admin pages with sidebar */}
        <Route path="/admin/*" element={<AdminPanel />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <RoleBasedRedirect />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/:section"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/hackathon/:id"
          element={
            <PrivateRoute>
              <HackathonDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/blogs/:id"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/blogs/write"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/my-hackathons"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/my-hackathons/:projectId"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/my-submissions/:projectId"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/project-archive"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/project-archive/:id"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Created Hackathons */}
        <Route path="/dashboard/created-hackathons/:hackathonId/teams/:teamId" element={<PrivateRoute><TeamsParticipantsPage /></PrivateRoute>} />
        <Route path="/dashboard/created-hackathons/:hackathonId/teams" element={<PrivateRoute><TeamsParticipantsPage /></PrivateRoute>} />
        <Route path="/dashboard/created-hackathons/:hackathonId" element={<PrivateRoute><DashboardPage/></PrivateRoute>} />
        <Route path="/dashboard/:section" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

        {/* Edit Hackathon Full Page */}
        <Route path="/dashboard/edit-hackathon/:id" element={<PrivateRoute><EditHackathonPage /></PrivateRoute>} />


        {/* Profile */}
        <Route path="/dashboard/profile" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/dashboard/profile/:id" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/dashboard/profile/edit" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route
          path="/dashboard/profile/account-settings"
          element={<PrivateRoute><DashboardPage /></PrivateRoute>}
        />
        <Route
          path="/dashboard/profile/privacy-security"
          element={<PrivateRoute><DashboardPage /></PrivateRoute>}
        />
        <Route
          path="/dashboard/profile/help-support"
          element={<PrivateRoute><DashboardPage /></PrivateRoute>}
        />
        <Route path="/profile/:userId" element={<PublicProfileViewWrapper />} />
        <Route path="/invite/:inviteId" element={<InviteAccept />} />
        <Route path="/invite/role" element={<InviteRole />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
        <Route path="/judge" element={<PrivateRoute><JudgePanel /></PrivateRoute>} />
        
        {/* Move JudgeProjectGallery under dashboard */}
        <Route path="/dashboard/judge/hackathon/:hackathonId/gallery" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route
          path="/dashboard/organizer/submission/:submissionId"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function PublicProfileViewWrapper() {
  const { userId } = useParams();
  return <PublicProfileView userId={userId} />;
}

export default App;
