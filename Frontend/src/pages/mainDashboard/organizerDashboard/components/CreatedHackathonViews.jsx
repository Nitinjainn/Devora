import React from "react";
import { ProjectCard } from '../../../../components/CommonUI/ProjectCard';
import ProjectDetail from '../../../../components/CommonUI/ProjectDetail';
import { Button } from "../../../../components/CommonUI/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/CommonUI/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/CommonUI/select";
import { 
  ArrowLeft, 
  Users, 
  Users2,
  Folder, 
  FileCheck, 
  AlertCircle,
  Trophy,
  CheckCircle2,
  Clock,
  Filter,
  Download
} from "lucide-react";

export default function CreatedHackathonViews({
  showSubmissionsView,
  showParticipantsView,
  showTeamsView,
  submissions,
  participants,
  teams,
  selectedSubmissionId,
  setSelectedSubmissionId,
  selectedTeamId,
  setSelectedTeamId,
  selectedType = 'All',
  setSelectedType = () => {},
  setShowSubmissionsView = () => {},
  setShowParticipantsView = () => {},
  setShowTeamsView = () => {},
  user,
  hackathon, // Add hackathon prop to access problem statements
  selectedProblemStatement = 'All', // Add filter state
  setSelectedProblemStatement = () => {},
  selectedTeamProblemStatement = 'All', // Add teams filter state
  setSelectedTeamProblemStatement = () => {},
}) {
  // Helper function to extract problem statement text
  const getProblemStatementText = (ps) => {
    if (typeof ps === 'string') return ps;
    if (typeof ps === 'object' && ps.statement) return ps.statement;
    return String(ps);
  };

  // Helper function to check if a participant submitted to a problem statement
  const hasSubmittedToProblemStatement = (participant, problemStatement) => {
    if (!participant.submittedProblemStatements) return false;
    return participant.submittedProblemStatements.some(ps => 
      getProblemStatementText(ps) === getProblemStatementText(problemStatement)
    );
  };

  // Helper function to check if a team submitted to a problem statement
  const hasTeamSubmittedToProblemStatement = (team, problemStatement) => {
    if (!team.submittedProblemStatements) return false;
    return team.submittedProblemStatements.some(ps => 
      getProblemStatementText(ps) === getProblemStatementText(problemStatement)
    );
  };

  // Filtering logic for submissions
  const filteredSubmissions = selectedType === 'All'
    ? submissions
    : selectedType === 'Project'
      ? submissions.filter(s => s.type?.toLowerCase() === 'project' || (!s.pptFile && !s.type))
      : selectedType === 'PPT'
        ? submissions.filter(s => s.type?.toLowerCase() === 'ppt' || s.pptFile)
        : submissions;

  // Filtering logic for participants by problem statement
  const filteredParticipants = selectedProblemStatement === 'All'
    ? participants
    : participants.filter(p => hasSubmittedToProblemStatement(p, selectedProblemStatement));

  // Filtering logic for teams by problem statement
  const filteredTeams = selectedTeamProblemStatement === 'All'
    ? teams
    : teams.filter(t => hasTeamSubmittedToProblemStatement(t, selectedTeamProblemStatement));

  // Get all problem statements from hackathon (including those with no submissions)
  const allProblemStatements = hackathon?.problemStatements || [];

  // Process and deduplicate problem statements
  const uniqueProblemStatements = [...new Set(
    allProblemStatements
      .map(ps => getProblemStatementText(ps))
      .filter(ps => ps && ps.trim()) // Remove empty strings
  )];

  // Submissions View
  if (showSubmissionsView) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Enhanced Header */}
          <div className="sticky top-0 z-20 backdrop-blur-sm bg-white/80 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100"
                  onClick={() => setShowSubmissionsView(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
              </div>
              
              {/* Enhanced Filter */}
              {!selectedSubmissionId && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">View:</span>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40 bg-white">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Submissions</SelectItem>
                      <SelectItem value="Project">Projects Only</SelectItem>
                      <SelectItem value="PPT">Presentations Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="space-y-6">
            {selectedSubmissionId ? (
              (() => {
                const sub = submissions.find(s => s._id === selectedSubmissionId);
                return (
                  <Card className="overflow-hidden">
                    <CardContent className="p-6 pt-6">
                      <Button
                        variant="ghost"
                        className="mb-6 flex items-center gap-2"
                        onClick={() => setSelectedSubmissionId(null)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Submissions
                      </Button>
                      {sub && <ProjectDetail project={sub} />}
                    </CardContent>
                  </Card>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.map((submission) => (
                      <ProjectCard
                    key={submission._id}
                    project={submission}
                    onClick={() => setSelectedSubmissionId(submission._id)}
                      />
                    ))}
                  </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Participants View
  if (showParticipantsView) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Enhanced Header */}
          <div className="sticky top-0 z-20 backdrop-blur-sm bg-white/80 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100"
                  onClick={() => setShowParticipantsView(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div>
                <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
                  {selectedProblemStatement !== 'All' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Filtered by: "{selectedProblemStatement.length > 40 ? selectedProblemStatement.substring(0, 40) + "..." : selectedProblemStatement}"
                    </p>
                  )}
                </div>
              </div>

              {/* Problem Statement Filter */}
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Filter by Problem Statement:</span>
                <Select value={selectedProblemStatement} onValueChange={setSelectedProblemStatement}>
                  <SelectTrigger className="w-64 bg-white">
                    <SelectValue placeholder="All Problem Statements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Problem Statements ({participants.length})</SelectItem>
                    {uniqueProblemStatements.map((ps, idx) => (
                      <SelectItem key={idx} value={ps}>
                        {ps.length > 50 ? ps.substring(0, 50) + "..." : ps} ({participants.filter(p => 
                          hasSubmittedToProblemStatement(p, ps)
                        ).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProblemStatement !== 'All' && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setSelectedProblemStatement('All')}
                    className="text-gray-700 hover:text-gray-900 border-gray-400 hover:border-gray-500 bg-white hover:bg-gray-50 px-6 py-2 font-medium"
                  >
                    Clear Filter
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    // Export participants functionality
                    const csvContent = [
                      ['Name', 'Email', 'Team', 'Problem Statement', 'Status'],
                      ...filteredParticipants.map(p => [
                        p.name,
                        p.email,
                        p.teamName || 'Individual',
                        p.submittedProblemStatements?.join(', ') || 'Not specified',
                        p.hasSubmitted ? 'Submitted' : 'Pending'
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `participants-${selectedProblemStatement === 'All' ? 'all' : 'filtered'}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="text-gray-700 hover:text-gray-900 border-gray-400 hover:border-gray-500 bg-white hover:bg-gray-50 px-4 py-2 font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="overflow-hidden">
              <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Users className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{filteredParticipants.length}</div>
                    <div className="text-sm text-gray-500">
                      {selectedProblemStatement === 'All' ? 'Total Participants' : 'Filtered Participants'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <Users2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredParticipants.filter(p => p.teamName).length}
                    </div>
                    <div className="text-sm text-gray-500">In Teams</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredParticipants.filter(p => !p.teamName).length}
                    </div>
                    <div className="text-sm text-gray-500">Individual</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <FileCheck className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredParticipants.filter(p => p.hasSubmitted).length}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedProblemStatement === 'All' ? 'With Submissions' : 'With This PS'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participants Table */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle>Participants List</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredParticipants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No participants found</h3>
                  <p className="text-gray-500">
                    {selectedProblemStatement === 'All' 
                      ? 'No participants registered yet.' 
                      : `No participants found for the selected problem statement.`
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem Statement</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredParticipants.map((p, idx) => (
                        <tr key={p._id || p.userId || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.teamName ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {p.teamName}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Individual</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.submittedProblemStatements && p.submittedProblemStatements.length > 0 ? (
                              <div className="space-y-1">
                                {p.submittedProblemStatements.map((ps, psIdx) => (
                                  <span key={psIdx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {getProblemStatementText(ps).length > 30 ? getProblemStatementText(ps).substring(0, 30) + "..." : getProblemStatementText(ps)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">No submission</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {p.hasSubmitted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                            </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Teams View
  if (showTeamsView) {
    if (selectedTeamId) {
      const team = teams.find(t => t.id === selectedTeamId || t._id === selectedTeamId);
      // Build a map of userId to submission status
      const userSubmissionMap = {};
      submissions.forEach(sub => {
        if (sub.submittedBy && sub.submittedBy._id) {
          userSubmissionMap[sub.submittedBy._id] = sub.status || "Draft";
        }
      });

      // Also check team submissions for status
      const teamSubmissionMap = {};
      if (team?.submissions) {
        team.submissions.forEach(sub => {
          if (sub.submittedBy) {
            teamSubmissionMap[sub.submittedBy] = sub.status || "Submitted";
          }
        });
      }

      return (
        <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto p-6">
            {/* Enhanced Header */}
            <div className="sticky top-0 z-20 backdrop-blur-sm bg-white/80 rounded-xl shadow-sm mb-6">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-gray-100"
                    onClick={() => setSelectedTeamId(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Teams
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900">{team?.name || 'Team Details'}</h1>
                </div>
              </div>
            </div>

            {/* Team Info Card */}
            <Card className="overflow-hidden mb-6">
              <CardHeader className="pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Users2 className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{team?.name}</h2>
                      <p className="text-sm text-gray-500">{team?.members?.length || 0} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {team?.members?.map((member, idx) => (
                        <div key={member._id || member.id || idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                          {(userSubmissionMap[member._id || member.id] || teamSubmissionMap[member.name]) && (
                            <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {userSubmissionMap[member._id || member.id] || teamSubmissionMap[member.name] || "Submitted"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Enhanced Header */}
          <div className="sticky top-0 z-20 backdrop-blur-sm bg-white/80 rounded-xl shadow-sm mb-6">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100"
                  onClick={() => setShowTeamsView(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                  {selectedTeamProblemStatement !== 'All' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Filtered by: "{selectedTeamProblemStatement.length > 40 ? selectedTeamProblemStatement.substring(0, 40) + "..." : selectedTeamProblemStatement}"
                    </p>
                  )}
                </div>
              </div>

              {/* Problem Statement Filter */}
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Filter by Problem Statement:</span>
                <Select value={selectedTeamProblemStatement} onValueChange={setSelectedTeamProblemStatement}>
                  <SelectTrigger className="w-64 bg-white">
                    <SelectValue placeholder="All Problem Statements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Problem Statements ({teams.length})</SelectItem>
                    {uniqueProblemStatements.map((ps, idx) => (
                      <SelectItem key={idx} value={ps}>
                        {ps.length > 50 ? ps.substring(0, 50) + "..." : ps} ({teams.filter(t => 
                          hasTeamSubmittedToProblemStatement(t, ps)
                        ).length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeamProblemStatement !== 'All' && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setSelectedTeamProblemStatement('All')}
                    className="text-gray-700 hover:text-gray-900 border-gray-400 hover:border-gray-500 bg-white hover:bg-gray-50 px-6 py-2 font-medium"
                  >
                    Clear Filter
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    // Export teams functionality
                    const csvContent = [
                      ['Team Name', 'Members', 'Problem Statement', 'Has Submitted'],
                      ...filteredTeams.map(t => [
                        t.name,
                        t.members?.map(m => m.name).join('; ') || 'No members',
                        t.submittedProblemStatements?.join(', ') || 'Not specified',
                        t.hasSubmitted ? 'Yes' : 'No'
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `teams-${selectedTeamProblemStatement === 'All' ? 'all' : 'filtered'}.csv`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="text-gray-700 hover:text-gray-900 border-gray-400 hover:border-gray-500 bg-white hover:bg-gray-50 px-4 py-2 font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="overflow-hidden">
              <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Users2 className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{filteredTeams.length}</div>
                    <div className="text-sm text-gray-500">
                      {selectedTeamProblemStatement === 'All' ? 'Total Teams' : 'Filtered Teams'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
               <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <FileCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredTeams.filter(t => t.hasSubmitted).length}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedTeamProblemStatement === 'All' ? 'With Submissions' : 'With This PS'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredTeams.reduce((total, team) => total + (team.members?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Members</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
               <CardContent className="p-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Trophy className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {filteredTeams.length > 0 ? 
                        Math.round(filteredTeams.reduce((total, team) => total + (team.members?.length || 0), 0) / filteredTeams.length) : 0
                      }
                    </div>
                    <div className="text-sm text-gray-500">Avg Team Size</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, idx) => (
              <Card key={team.id || team._id || idx} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setSelectedTeamId(team.id || team._id)}>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Users2 className="w-5 h-5 text-indigo-500" />
                </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-500">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {team.members?.slice(0, 3).map((member, memberIdx) => (
                      <div key={member._id || member.id || memberIdx} className="flex items-center gap-2 text-sm">
                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                          {member.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-gray-700">{member.name}</span>
                              </div>
                            ))}
                    {team.members && team.members.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{team.members.length - 3} more members
                              </div>
                            )}
                    {team.submittedProblemStatements && team.submittedProblemStatements.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Problem Statements:</div>
                        <div className="space-y-1">
                          {team.submittedProblemStatements.map((ps, psIdx) => (
                            <span key={psIdx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getProblemStatementText(ps).length > 20 ? getProblemStatementText(ps).substring(0, 20) + "..." : getProblemStatementText(ps)}
                          </span>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      </div>
    );
  }

  return null;
}