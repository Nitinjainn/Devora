"use client";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  Users,
  Trophy,
  MessageSquare,
  User,
  Plus,
  LogOut,
  FileText,
  Settings,
  Eye,
  Search,
  Archive,
  Building,
  UsersRoundIcon,
  NotebookTabs,
  Wrench,
  PencilRulerIcon,
  Fuel,
  CalendarX,
  Gavel,
  ShieldCheck,
  Handshake,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../../components/DashboardUI/sidebar";

import { useAuth } from "../../context/AuthContext";
// Sections
import { ProfileSection } from "./ProfileSection";
import { MySubmissions } from "./partipantDashboard/MySubmissions";
import { CreatedHackathons } from "./organizerDashboard/Created-hackathons";
import { Announcements } from "./organizerDashboard/Announcements";
import { OrganizerTools } from "./organizerDashboard/OrganizerTools";
import { ExploreHackathons } from "./partipantDashboard/ExploreHackathon";
import CreateHackathon from "./organizerDashboard/Create-hackathon";
import { Blogs } from "./partipantDashboard/Blogs";
import { ProjectArchive } from "./partipantDashboard/ProjectArchive";
import MyHackathon from "./partipantDashboard/Myhackathon";
import DashboardJudgePanel from "./judgeDashboard/JudgePanel";
import CertificatesPage from "./organizerDashboard/CertificatePage";
import SponsoredPS from "./SponsoredPS";
import JudgeManagement from "./organizerDashboard/components/JudgeManagement";
import JudgeProjectGallery from "./judgeDashboard/JudgeProjectGallery";
import NotificationBell from '../../components/DashboardUI/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/DashboardUI/avatar';
import useDropdownTimeout from '../../hooks/useDropdownTimeout';
import OrganizerSubmissionView from "./organizerDashboard/OrganizerSubmissionView";
import { getDashboardRouteByRole } from '../../utils/roleBasedRouting';

export default function HackZenDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Extract the active section from the current URL path
  const getActiveSectionFromPath = () => {
    const path = location.pathname;
    if (path.match(/^\/dashboard\/organizer\/submission\//)) return "organizer-submission";
    // Generalize: any judge route
    if (path.startsWith("/dashboard/judge")) return "judge-panel";
    const match = path.match(/^\/dashboard\/([^/]+)/);
    return match ? match[1] : "profile";
  };

  const [currentView, setCurrentView] = useState(getActiveSectionFromPath());
  const [hasApprovedSponsoredPS, setHasApprovedSponsoredPS] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { handleMouseEnter: profileEnter, handleMouseLeave: profileLeave } = useDropdownTimeout(setShowProfileDropdown);
  const { user: authUser, logout } = useAuth();
  const handleSignOut = () => {
    logout();
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    async function checkSponsoredPS() {
      if (!user?.email) return;
      try {
        const res = await fetch(`/api/sponsor-proposals/user/${user.email}`);
        const data = await res.json();
        setHasApprovedSponsoredPS(Array.isArray(data) && data.length > 0);
      } catch {
        setHasApprovedSponsoredPS(false);
      }
    }
    checkSponsoredPS();
  }, [user?.email]);

  // Debug: Log user role for troubleshooting
  console.log("Dashboard - Current user:", authUser);
  console.log("Dashboard - User role:", authUser?.role);
  console.log("Dashboard - User profileCompleted:", authUser?.profileCompleted);
  console.log("Dashboard - User authProvider:", authUser?.authProvider);

  // Function to handle section changes with nested URLs
  const changeView = (viewKey) => {
    setCurrentView(viewKey);
    navigate(`/dashboard/${viewKey}`);
  };

  // Function to navigate to home page
  const navigateToHome = () => {
    navigate("/");
  };

  // Set default route on component mount
  useEffect(() => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/"
    ) {
      const dashboardRoute = getDashboardRouteByRole(authUser);
      console.log("🔍 Dashboard - Redirecting to route:", dashboardRoute, "for user role:", authUser?.role);
      navigate(dashboardRoute, { replace: true });
    }
    // Update currentView when URL changes
    setCurrentView(getActiveSectionFromPath());
  }, [location.pathname, navigate, params.section, authUser?.role]);

  const participantMenuItems = [
    {
      title: "Profile",
      icon: User,
      key: "profile",
      onClick: () => changeView("profile"),
    },
    {
      title: "My Hackathons",
      icon: Trophy,
      key: "my-hackathons",
      onClick: () => changeView("my-hackathons"),
    },
    {
      title: "My Submissions",
      icon: FileText,
      key: "my-submissions",
      onClick: () => changeView("my-submissions"),
    },
    {
      title: "Explore Hackathons",
      icon: Search,
      key: "explore-hackathons",
      onClick: () => changeView("explore-hackathons"),
    },
    {
      title: "Blogs",
      icon: NotebookTabs,
      key: "blogs",
      onClick: () => changeView("blogs"),
    },
    {
      title: "Project Archive",
      icon: Archive,
      key: "project-archive",
      onClick: () => changeView("project-archive"),
    },
  ];

  const organizerMenuItems = [
    {
      title: "Organizer Tools",
      icon: Settings,
      key: "organizer-tools",
      onClick: () => changeView("organizer-tools"),
    },
    {
      title: "Hackathons",
      icon: CalendarX,
      key: "created-hackathons", // ✅ keep this
      onClick: () => changeView("created-hackathons"),
    },

    {
      title: "Create Hackathons",
      icon: PencilRulerIcon,
      key: "create-hackathon", // ✅ FIX this key!
      onClick: () => changeView("create-hackathon"),
    },
  
    {
      title: "Announcements",
      icon: MessageSquare,
      key: "announcements",
      onClick: () => changeView("announcements"),
    },
    {
      title: "Certificate Page",
      icon: ShieldCheck,
      key: "certificate-page",
      onClick: () => changeView("certificate-page"),
    },
  ];

  const judgeMenuItems = [
    {
      title: "Judge Panel",
      icon: Gavel,
      key: "judge-panel",
      onClick: () => changeView("judge-panel"),
    },
    {
      title: "My Judgments",
      icon: FileText,
      key: "my-judgments",
      onClick: () => changeView("my-judgments"),
    },
  ];

  // Function to render content based on current view
  const isJudgeGalleryRoute = location.pathname.match(/^\/dashboard\/judge\/hackathon\/[^/]+\/gallery/);
  const renderContent = () => {
    // Special case: judge project gallery route
    if (isJudgeGalleryRoute) {
      return <JudgeProjectGallery />;
    }
    switch (currentView) {
      case "profile":
        return (
          <ProfileSection
            viewUserId={params.id}
            userName="John Doe"
            userEmail="john@example.com"
            userAvatar="/placeholder.svg?height=96&width=96"
            onBack={() => changeView("profile")}
          />
        );
      case "my-hackathons":
        return <MyHackathon onBack={() => changeView("profile")} />;
      case "my-submissions":
        return <MySubmissions onBack={() => changeView("profile")} />;
      case "chat-rooms":
        return <ChatRooms onBack={() => changeView("profile")} />;
      case "explore-hackathons":
        return <ExploreHackathons onBack={() => changeView("profile")} />;
      case "organization-hub":
        return <OrganizationHub onBack={() => changeView("profile")} />;
      // case "sponsored-ps":
      //   return <SponsoredPS onBack={() => changeView("profile")} />;
      case "created-hackathons":
        return (
          <CreatedHackathons
            onBack={() => changeView("profile")}
            onCreateNew={() => changeView("create-hackathon")}
          />
        );
      case "participant-overview":
        return <ParticipantOverview onBack={() => changeView("profile")} />;
      case "review-submissions":
        return <ReviewSubmissions onBack={() => changeView("profile")} />;
      case "announcements":
        return <Announcements onBack={() => changeView("profile")} />;
      case "organizer-tools":
        return <OrganizerTools onBack={() => changeView("profile")} />;
      case "judge-management":
        return (
          <JudgeManagement
            hackathonId={params.hackathonId}
            onBack={() => changeView("profile")}
          />
        );
      case "create-hackathon":
        return <CreateHackathon onBack={() => changeView("profile")} />;
      case "blogs":
        return <Blogs onBack={() => changeView("profile")} />;
      case "project-archive":
        return <ProjectArchive onBack={() => changeView("profile")} />;
      case "judge-panel":
        return <DashboardJudgePanel onBack={() => changeView("profile")} />;
      case "my-judgments":
        return <div className="p-6">My Judgments Section - Coming Soon</div>;

      case "certificate-page":
        return <CertificatesPage onBack={() => changeView("profile")} />;
      case "organizer-submission":
        return <OrganizerSubmissionView />;
      default:
        return (
          <ProfileSection
            viewUserId={params.id}
            userName="John Doe"
            userEmail="john@example.com"
            userAvatar="/placeholder.svg?height=96&width=96"
            onBack={() => changeView("profile")}
          />
        );
    }
  };

  useEffect(() => {
    // Refresh user info to ensure we have the latest role
    // refreshUser(); // This line is removed as per the edit hint
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (authUser && !authUser.profileCompleted) {
      navigate("/complete-profile");
    }
  }, [authUser, navigate]);

  return (
    <>
      <SidebarProvider>
        <Sidebar className="border-r bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
          <SidebarHeader className="p-4">
            <div
              className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={navigateToHome}
            >
              <img
                src="https://res.cloudinary.com/dg2q2tzbv/image/upload/v1751960561/logo_bg_yvh9hq.png"
                alt="HackZen Logo"
                className="w-10 h-10 object-contain border rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">HackZen</h1>
                <p className="text-sm text-gray-500">Hackathon Platform</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="scrollbar-hide">
            {/* Participant Menu - Only show on participant dashboard sections */}
            {[
              "profile",
              "my-hackathons",
              "my-submissions",
              "explore-hackathons",
              "blogs",
              "project-archive",
              "sponsored-ps"
            ].includes(currentView) && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {participantMenuItems.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={item.onClick}
                            className={cn(
                              "flex items-center gap-3 w-full text-left rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                              currentView === item.key
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "w-4 h-4",
                                currentView === item.key
                                  ? "text-indigo-700"
                                  : "text-gray-500"
                              )}
                            />
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Organizer Menu - Only show to organizers, NOT to judges, and only on organizer dashboard sections */}
            {authUser?.role === "organizer" && authUser?.role !== "judge" && [
              "organizer-tools",
              "created-hackathons",
              "create-hackathon",
              "announcements",
              "certificate-page",
              "judge-management"
            ].includes(currentView) && (
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-2 text-purple-600">
                  <Wrench className="w-4 h-4" />
                  Organizer Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {organizerMenuItems.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={item.onClick}
                            className={cn(
                              "flex items-center gap-3 w-full text-left rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                              currentView === item.key
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "w-4 h-4",
                                currentView === item.key
                                  ? "text-indigo-700"
                                  : "text-gray-500"
                              )}
                            />
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Judge Menu - Show to judges and only on judge dashboard sections */}
            {authUser?.role === "judge" && ([
              "judge-panel",
              "my-judgments"
            ].includes(currentView) || isJudgeGalleryRoute) && (
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-2 text-orange-600">
                  <Gavel className="w-4 h-4" />
                  Judge Menu
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {judgeMenuItems.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton asChild>
                          <button
                            onClick={item.onClick}
                            className={cn(
                              "flex items-center gap-3 w-full text-left rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                              currentView === item.key
                                ? "bg-orange-100 text-orange-700"
                                : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "w-4 h-4",
                                currentView === item.key
                                  ? "text-orange-700"
                                  : "text-gray-500"
                              )}
                            />
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4"></SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Dashboard</span>
                <span>/</span>
                <span className="capitalize">{currentView.replace("-", " ")}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 pr-4"> {/* increased gap and added right padding */}
              <NotificationBell />
              {/* Profile Icon with Dropdown */}
              {authUser && (
                <div
                  className="relative"
                  onMouseEnter={profileEnter}
                  onMouseLeave={profileLeave}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-[#1b0c3f] text-white flex items-center justify-center font-semibold text-sm uppercase overflow-hidden cursor-pointer mr-1" // added small right margin
                    onClick={() => setShowProfileDropdown((v) => !v)}
                    title={authUser.name || authUser.email}
                  >
                    {authUser.profilePic ? (
                      <Avatar>
                        <AvatarImage src={authUser.profilePic} alt="Profile" />
                        <AvatarFallback>{authUser.name?.charAt(0) || authUser.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span>{authUser.name?.charAt(0) || authUser.email?.charAt(0)}</span>
                    )}
                  </div>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl shadow-lg z-50 text-sm overflow-hidden">
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 hover:bg-gray-100 text-gray-900 border-b border-gray-200"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Profile
                      </Link>
                      {/* Context-specific dashboard link */}
                      {authUser?.role === 'organizer' && (
                        <Link
                          to="/dashboard/organizer-tools"
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-900 border-b border-gray-200"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Organizer Tools
                        </Link>
                      )}
                      {authUser?.role === 'judge' && (
                        <Link
                          to="/dashboard/judge-panel"
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-900 border-b border-gray-200"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Judge Panel
                        </Link>
                      )}

                       {authUser?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-900 border-b border-gray-200"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/dashboard/profile/privacy-security"
                        className="block px-4 py-2 hover:bg-gray-100 text-gray-900 border-b border-gray-200"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Settings
                      </Link>
                     <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 border-b border-gray-200"
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                          navigate('/');
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto scrollbar-hide">
            {renderContent()}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
