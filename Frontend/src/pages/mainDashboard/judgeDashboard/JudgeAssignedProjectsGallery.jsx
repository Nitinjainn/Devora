"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "../../../components/CommonUI/card";
import { Skeleton } from "../../../components/DashboardUI/skeleton";
import { ProjectCard } from "../../../components/CommonUI/ProjectCard";
import { Rocket, Code2, FileText, Sparkles, Gavel, Users, TrendingUp, Award, Target, CheckCircle } from "lucide-react";

// Enhanced Empty State Component for Judges
const EmptyJudgeProjectsState = ({ selectedType }) => {
  const getEmptyStateContent = () => {
    if (selectedType && selectedType !== "") {
      return {
        title: `No ${selectedType} assignments yet`,
        subtitle: `You haven't been assigned any ${selectedType.toLowerCase()} submissions for this hackathon yet. Check back later or contact the organizer.`,
      };
    }
    return {
      title: "No assigned submissions yet",
      subtitle: "You haven't been assigned any submissions to evaluate yet. Please wait for the organizer to assign projects to you, or check if there are any available hackathons.",
      IconComponent: Gavel,
    };
  };

  const { title, subtitle, IconComponent } = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="text-center max-w-2xl mx-auto">
      
        {/* Enhanced Title */}
        <h3 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
          {title}
        </h3>
        
        {/* Enhanced Subtitle */}
        <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          {subtitle}
        </p>
    
      </div>
    </div>
  );
};

export default function JudgeAssignedProjectsGallery({ hackathonId, onProjectClick, selectedType, searchQuery }) {
  const [assignedSubmissions, setAssignedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [judgeScores, setJudgeScores] = useState([]);
  
  // Filter states
  const [roundFilter, setRoundFilter] = useState('all');
  const [evaluationFilter, setEvaluationFilter] = useState('all');
  const [problemStatementFilter, setProblemStatementFilter] = useState('all');
  const [availableRounds, setAvailableRounds] = useState([]);
  const [availableProblemStatements, setAvailableProblemStatements] = useState([]);
  
  console.log('🔍 Frontend - JudgeAssignedProjectsGallery props:', {
    hackathonId,
    selectedType
  });
  const navigate = useNavigate();

  // Get dynamic heading based on filter
  const getPageHeading = () => {
    if (selectedType && selectedType !== "") {
      return `Assigned ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Submissions`;
    }
    return "My Assigned Submissions";
  };

  // Helper function to get evaluation status
  const getEvaluationStatus = (submission) => {
    if (!submission) return 'not-evaluated';
    
    // First, check if the backend already provided evaluation status
    if (submission.evaluationStatus) {
      console.log('🔍 Using backend evaluation status:', {
        submissionId: submission._id,
        submissionTitle: submission.projectTitle || submission.title,
        evaluationStatus: submission.evaluationStatus
      });
      // Map 'pending' to 'not-evaluated' and 'evaluated' to 'evaluated'
      return submission.evaluationStatus === 'evaluated' ? 'evaluated' : 'not-evaluated';
    }
    
    // Fallback: Check if submission has been evaluated by looking at various score indicators
    let isEvaluated = false;
    
    // Check if submission has scores array with content
    if (submission.scores && Array.isArray(submission.scores) && submission.scores.length > 0) {
      isEvaluated = true;
    }
    
    // Check if submission has evaluations array with content
    if (submission.evaluations && Array.isArray(submission.evaluations) && submission.evaluations.length > 0) {
      isEvaluated = true;
    }
    
    // Check if submission has any score data
    if (submission.score || submission.totalScore || submission.averageScore) {
      isEvaluated = true;
    }
    
    // Check if submission has judge scores (from judgeScores array)
    if (judgeScores && judgeScores.length > 0) {
      const hasJudgeScore = judgeScores.some(score => 
        score.submissionId === submission._id || score.submissionId === submission.id
      );
      if (hasJudgeScore) {
        isEvaluated = true;
      }
    }
    
    // Check if submission has any scoring-related fields
    if (submission.isEvaluated || submission.evaluated || submission.scored) {
      isEvaluated = true;
    }
    
    // Debug logging for evaluation status
    console.log('🔍 Evaluation Status Debug:', {
      submissionId: submission._id,
      submissionTitle: submission.projectTitle || submission.title,
      isEvaluated,
      evaluationStatus: submission.evaluationStatus,
      scores: submission.scores,
      evaluations: submission.evaluations,
      score: submission.score,
      totalScore: submission.totalScore,
      averageScore: submission.averageScore,
      evaluated: submission.evaluated,
      scored: submission.scored,
      judgeScoresLength: judgeScores?.length || 0
    });
    
    return isEvaluated ? 'evaluated' : 'not-evaluated';
  };

  // Filter submissions based on filters
  const filteredSubmissions = assignedSubmissions.filter(submission => {
    // Round filter
    if (roundFilter !== 'all' && submission.roundIndex !== undefined) {
      if (submission.roundIndex.toString() !== roundFilter) {
        return false;
      }
    }
    
    // Evaluation filter
    if (evaluationFilter !== 'all') {
      const evaluationStatus = getEvaluationStatus(submission);
      if (evaluationStatus !== evaluationFilter) {
        return false;
      }
    }
    
    // Problem Statement filter
    if (problemStatementFilter !== 'all' && submission.problemStatement) {
      const submissionPS = submission.problemStatement;
      const filterPS = problemStatementFilter;
      
      // Check if problem statement matches (by ID or by text)
      const psMatches = submissionPS._id === filterPS || 
                       submissionPS.id === filterPS || 
                       submissionPS === filterPS ||
                       (typeof submissionPS === 'string' && submissionPS.includes(filterPS));
      
      if (!psMatches) {
        return false;
      }
    }
    
    return true;
  });

  // Extract available rounds and problem statements from submissions
  useEffect(() => {
    const rounds = [...new Set(assignedSubmissions.map(sub => sub.roundIndex).filter(r => r !== undefined))];
    setAvailableRounds(rounds.sort((a, b) => a - b));
    
    // Extract available problem statements
    const problemStatements = [...new Set(assignedSubmissions.map(sub => sub.problemStatement).filter(ps => ps))];
    setAvailableProblemStatements(problemStatements);
  }, [assignedSubmissions]);

  // Your existing useEffect for fetching submissions (keeping unchanged)
  useEffect(() => {
    const fetchAssignedSubmissions = async () => {
      setLoading(true);
      console.log('🔍 Frontend - Fetching assigned submissions for hackathonId:', hackathonId);
      try {
        const token = localStorage.getItem("token");
        
        const response = await axios.get(`/api/judge-management/my-assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data;
        const submissions = data.submissions || [];
        
        console.log('🔍 Frontend - API Response:', {
          totalSubmissions: submissions.length,
          hackathonId,
          submissions: submissions.map(s => ({
            id: s._id,
            title: s.projectTitle || s.title,
            hackathonId: s.hackathonId?._id || s.hackathonId
          }))
        });
        
        const hackathonSubmissions = submissions.filter(sub => {
          const submissionHackathonId = sub.hackathonId?._id || sub.hackathonId;
          const submissionHackathonIdStr = submissionHackathonId?.toString();
          const expectedHackathonIdStr = hackathonId?.toString();
          
          console.log('🔍 Frontend - Filtering submission:', {
            submissionId: sub._id,
            submissionHackathonId,
            submissionHackathonIdStr,
            expectedHackathonIdStr,
            matches: submissionHackathonId === hackathonId || submissionHackathonIdStr === expectedHackathonIdStr
          });
          
          if (!hackathonId) {
            return true;
          }
          
          const matches = submissionHackathonId === hackathonId || submissionHackathonIdStr === expectedHackathonIdStr;
          return matches;
        });
        
        console.log('🔍 Frontend - Filtered submissions:', hackathonSubmissions.length);

        const projects = await Promise.all(hackathonSubmissions.map(async (submission) => {
          const submittedBy = submission.submittedBy ? {
            _id: submission.submittedBy._id || submission.submittedBy,
            name: submission.submittedBy.name || submission.submittedBy.email || "Unknown",
            email: submission.submittedBy.email || "",
            profileImage: submission.submittedBy.profileImage || "",
            role: submission.submittedBy.role || "Contributor"
          } : {
            _id: "unknown",
            name: "Unknown",
            email: "",
            profileImage: "",
            role: "Contributor"
          };

          if (submission.pptFile) {
            return {
              ...submission,
              type: "ppt",
              title: submission.title || submission.originalName || "PPT Submission",
              name: submission.teamName || (submission.team && submission.team.name) || "-",
              status: submission.status || "Submitted",
              submittedBy: submittedBy,
              submittedAt: submission.submittedAt,
              pptFile: submission.pptFile,
              logo: { url: "/assets/ppt.png" },
              likes: submission.likes || 0,
              views: submission.views || 0,
              __submission: submission,
            };
          } else {
            const projectId = submission.projectId?._id || submission.projectId;
            
            if (projectId) {
              try {
                const projectResponse = await axios.get(`/api/projects/${projectId}`);
                const fullProjectData = projectResponse.data;
                
                return {
                  ...fullProjectData,
                  type: "project",
                  submittedBy: submittedBy,
                  submittedAt: submission.submittedAt,
                  __submission: submission,
                };
              } catch (projectErr) {
                console.error(`Failed to fetch project ${projectId}:`, projectErr);
                const projectData = submission.projectId || submission.project || submission;
                const projectLogo = projectData?.logo || 
                                   projectData?.images?.[0] || 
                                   submission.logo || 
                                   { url: "/assets/default-banner.png" };
                
                return {
                  ...submission,
                  type: "project",
                  title: projectData?.projectTitle || projectData?.title || submission.projectTitle || submission.title || "Project Submission",
                  name: submission.teamName || (submission.team && submission.team.name) || "-",
                  status: submission.status || "Submitted",
                  submittedBy: submittedBy,
                  submittedAt: submission.submittedAt,
                  logo: projectLogo,
                  likes: submission.likes || 0,
                  views: submission.views || 0,
                  __submission: submission,
                };
              }
            } else {
              const projectData = submission.project || submission;
              const projectLogo = projectData?.logo || 
                                 projectData?.images?.[0] || 
                                 submission.logo || 
                                 { url: "/assets/default-banner.png" };
              
              return {
                ...submission,
                type: "project",
                title: projectData?.projectTitle || projectData?.title || submission.projectTitle || submission.title || "Project Submission",
                name: submission.teamName || (submission.team && submission.team.name) || "-",
                status: submission.status || "Submitted",
                submittedBy: submittedBy,
                submittedAt: submission.submittedAt,
                logo: projectLogo,
                likes: submission.likes || 0,
                views: submission.views || 0,
                __submission: submission,
              };
            }
          }
        }));

        setAssignedSubmissions(projects);
      } catch (err) {
        console.error("Error fetching assigned submissions", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        
        if (err.response?.status === 500) {
          console.error("Server error - check backend logs");
        }
        
        setAssignedSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (hackathonId) fetchAssignedSubmissions();
  }, [hackathonId]);

  // Your existing useEffect for user and scores (keeping unchanged)
  useEffect(() => {
    const fetchUserAndScores = async () => {
      const token = localStorage.getItem("token");
      try {
        const userRes = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = userRes.data;
        setUser(currentUser);

        if (currentUser.role === "judge") {
          // For now, skip the failing API call and rely on backend evaluation status
          setJudgeScores([]);
          console.log('🔍 Skipping judge scores fetch due to API error');
        }
      } catch (err) {
        console.error("Failed to fetch user or judge scores", err);
      }
    };

    fetchUserAndScores();
  }, []);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Enhanced Loading Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        
        {/* Enhanced Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Filter by selected type and search query
  const filteredProjects = assignedSubmissions.filter(project => {
    // Type filter
    const typeMatch = !selectedType || selectedType === "" 
      ? true 
      : project.type 
        ? project.type.toLowerCase() === selectedType.toLowerCase()
        : selectedType.toLowerCase() === "project";
    
    // Search filter
    const searchMatch = !searchQuery || searchQuery === ""
      ? true
      : project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return typeMatch && searchMatch;
  });

  // Enhanced empty state when no projects
  if (filteredSubmissions.length === 0) {
    return (
      <div className="space-y-8">
        {/* Enhanced Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex flex-col space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">{getPageHeading()}</h2>
                          <p className="text-gray-600">
              {selectedType && selectedType !== ""
                ? `${filteredSubmissions.length} ${selectedType} submissions assigned to you`
                : `${filteredSubmissions.length} submissions assigned to you`}
            </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Awaiting Assignments</span>
          </div>
        </div>
        
        {/* Enhanced Empty State */}
        <div className="">
            <EmptyJudgeProjectsState selectedType={selectedType} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">{getPageHeading()}</h2>
            <p className="text-gray-600">
              {selectedType && selectedType !== ""
                ? `${filteredSubmissions.length} ${selectedType} submissions assigned to you`
                : `${filteredSubmissions.length} submissions assigned to you`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Ready to Judge</span>
          </div>
          <div className="text-sm text-gray-500">
            {searchQuery && `Filtered by "${searchQuery}"`}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        {/* Round Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Round:</label>
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Rounds</option>
            {availableRounds.map(round => (
              <option key={round} value={round.toString()}>
                Round {round + 1}
              </option>
            ))}
          </select>
        </div>
        
        {/* Problem Statement Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Problem Statement:</label>
          <select
            value={problemStatementFilter}
            onChange={(e) => setProblemStatementFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Problem Statements</option>
            {availableProblemStatements.map((ps, index) => (
              <option key={index} value={ps}>
                {typeof ps === 'string' ? ps.substring(0, 50) + '...' : ps.statement ? ps.statement.substring(0, 50) + '...' : `PS ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Evaluation Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Evaluation:</label>
          <select
            value={evaluationFilter}
            onChange={(e) => setEvaluationFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="evaluated">Evaluated</option>
            <option value="not-evaluated">Not Evaluated</option>
          </select>
        </div>
        
        {/* Clear Filters Button */}
        {(roundFilter !== 'all' || evaluationFilter !== 'all' || problemStatementFilter !== 'all') && (
          <button
            onClick={() => {
              setRoundFilter('all');
              setEvaluationFilter('all');
              setProblemStatementFilter('all');
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>





      {/* Enhanced Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSubmissions.map((project, index) => (
          <div key={project._id || index} className="">
            <ProjectCard
              project={project}
              submission={project.__submission}
              onClick={() => onProjectClick({ project, submission: project.__submission })}
              user={user}
              judgeScores={judgeScores}
              isJudgeView={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
