import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/CommonUI/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/CommonUI/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/CommonUI/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../../components/DashboardUI/dialog";
import { 
  ArrowLeft, 
  FileCheck, 
  Upload,
  Filter,
  Download,
  Eye,
  Trophy,
  Users,
  FileText
} from "lucide-react";

export default function SubmissionsView({
  submissions = [],
  hackathon,
  selectedType = 'All',
  setSelectedType = () => {},
  selectedProblemStatement = 'All',
  setSelectedProblemStatement = () => {},
  setShowSubmissionsView = () => {},
  // Remove selectedSubmissionId/setSelectedSubmissionId from props, manage locally
  onExportSubmissions = () => {},
}) {
  // Helper function to extract problem statement text
  const getProblemStatementText = (ps) => {
    if (typeof ps === 'string') return ps;
    if (typeof ps === 'object' && ps.statement) return ps.statement;
    return String(ps);
  };

  // Helper function to check if a submission matches the selected problem statement
  const hasSubmittedToProblemStatement = (submission, problemStatement) => {
    if (!submission.problemStatement) return false;
    return getProblemStatementText(submission.problemStatement) === getProblemStatementText(problemStatement);
  };

  // Filtering logic for submissions by type and problem statement
  const filteredSubmissions = submissions.filter(sub => {
    const typeMatch = selectedType === 'All' || 
      (selectedType === 'Round 1' && sub.roundNumber === 1) ||
      (selectedType === 'Round 2' && sub.roundNumber === 2);
    
    const psMatch = selectedProblemStatement === 'All' || 
      hasSubmittedToProblemStatement(sub, selectedProblemStatement);
    
    return typeMatch && psMatch;
  });

  // Get all problem statements from hackathon (including those with no submissions)
  const allProblemStatements = hackathon?.problemStatements || [];

  // Process and deduplicate problem statements
  const uniqueProblemStatements = [...new Set(
    allProblemStatements
      .map(ps => getProblemStatementText(ps))
      .filter(ps => ps && ps.trim()) // Remove empty strings
  )];

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const round1Submissions = submissions.filter(s => s.roundNumber === 1).length;
  const round2Submissions = submissions.filter(s => s.roundNumber === 2).length;
  const filteredSubmissionsCount = filteredSubmissions.length;

  // Get problem statement statistics
  const problemStatementStats = {};
  submissions.forEach(sub => {
    if (sub.problemStatement) {
      const ps = getProblemStatementText(sub.problemStatement);
      if (!problemStatementStats[ps]) {
        problemStatementStats[ps] = { total: 0, round1: 0, round2: 0 };
      }
      problemStatementStats[ps].total++;
      if (sub.roundNumber === 1) {
        problemStatementStats[ps].round1++;
      } else if (sub.roundNumber === 2) {
        problemStatementStats[ps].round2++;
      }
    }
  });

  // Calculate problem statement counts based on current type filter
  const getProblemStatementCount = (ps) => {
    if (selectedType === 'All') {
      return problemStatementStats[ps]?.total || 0;
    } else if (selectedType === 'Round 1') {
      return problemStatementStats[ps]?.round1 || 0;
    } else if (selectedType === 'Round 2') {
      return problemStatementStats[ps]?.round2 || 0;
    }
    return 0;
  };

  // Modal state and details
  const [submissionDetailsModalOpen, setSubmissionDetailsModalOpen] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingSubmissionDetails, setLoadingSubmissionDetails] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Format date helper
  const formatDate = (date) => date ? new Date(date).toLocaleString() : '--';

  // Fetch full submission details and evaluations
  const handleViewSubmission = async (submission) => {
    setSelectedSubmission(submission);
    setSubmissionDetailsModalOpen(true);
    setLoadingSubmissionDetails(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch detailed submission information
      const response = await fetch(`http://localhost:3000/api/submission-form/admin/${submission._id}`);
      let submissionData = null;
      if (response.ok) {
        submissionData = await response.json();
      }
      // Fetch judge evaluations for this submission
      const evaluationsResponse = await fetch(`http://localhost:3000/api/scores/submission/${submission._id}`);
      let evaluations = [];
      if (evaluationsResponse.ok) {
        evaluations = await evaluationsResponse.json();
      }
      // Merge with original submission data
      const mergedSubmission = {
        ...submissionData?.submission,
        ...submission,
        evaluations,
        assignedJudges: submission.assignedJudges || [],
      };
      setSubmissionDetails(mergedSubmission);
    } catch (error) {
      setSubmissionDetails(null);
    } finally {
      setLoadingSubmissionDetails(false);
    }
  };

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
                {(selectedProblemStatement !== 'All' || selectedType !== 'All') && (
                  <p className="text-sm text-gray-600 mt-1">
                    Filtered by: {selectedType !== 'All' ? selectedType : ''} 
                    {selectedType !== 'All' && selectedProblemStatement !== 'All' ? ' + ' : ''}
                    {selectedProblemStatement !== 'All' ? `"${selectedProblemStatement.length > 40 ? selectedProblemStatement.substring(0, 40) + "..." : selectedProblemStatement}"` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              
              {/* Type Filter */}
              <span className="text-sm font-medium text-gray-500">Type:</span>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 bg-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types ({totalSubmissions})</SelectItem>
                  <SelectItem value="Round 1">Round 1 ({round1Submissions})</SelectItem>
                  <SelectItem value="Round 2">Round 2 ({round2Submissions})</SelectItem>
                </SelectContent>
              </Select>

              {/* Problem Statement Filter */}
              <span className="text-sm font-medium text-gray-500">Problem Statement:</span>
              <Select value={selectedProblemStatement} onValueChange={setSelectedProblemStatement}>
                <SelectTrigger className="w-64 bg-white">
                  <SelectValue placeholder="All Problem Statements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Problem Statements ({filteredSubmissionsCount})</SelectItem>
                  {uniqueProblemStatements.map((ps, idx) => (
                    <SelectItem key={idx} value={ps}>
                      {ps.length > 50 ? ps.substring(0, 50) + "..." : ps} ({getProblemStatementCount(ps)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(selectedType !== 'All' || selectedProblemStatement !== 'All') && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    setSelectedType('All');
                    setSelectedProblemStatement('All');
                  }}
                  className="text-gray-700 hover:text-gray-900 border-gray-400 hover:border-gray-500 bg-white hover:bg-gray-50 px-8 py-2 font-medium"
                >
                  Clear Filters
                </Button>
              )}

              {/* Export Button */}
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  // Export submissions functionality
                  const csvContent = [
                    ['Project Title', 'Submitted By', 'Email', 'Round', 'Problem Statement', 'Status', 'Submitted Date'],
                    ...filteredSubmissions.map(s => [
                      s.projectTitle || 'Untitled Project',
                      s.submittedByName || s.submittedBy?.name || 'Unknown',
                      s.submittedBy?.email || 'N/A',
                      s.roundLabel || `Round ${s.roundNumber}`,
                      s.problemStatement ? getProblemStatementText(s.problemStatement) : 'Not specified',
                      s.status === 'submitted' ? 'Submitted' : 'Draft',
                      s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'N/A'
                    ])
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `submissions-${selectedType === 'All' ? 'all' : selectedType.toLowerCase()}-${selectedProblemStatement === 'All' ? 'all' : 'filtered'}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="text-gray-700 hover:text-gray-900 border-gray-400 hover:border-gray-500 bg-white hover:bg-gray-50 px-8 py-2 font-medium"
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
                  <Upload className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{filteredSubmissionsCount}</div>
                  <div className="text-sm text-gray-500">
                    {selectedType !== 'All' || selectedProblemStatement !== 'All' ? 'Filtered Submissions' : 'Total Submissions'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Trophy className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredSubmissions.filter(s => s.roundNumber === 1).length}
                  </div>
                  <div className="text-sm text-gray-500">Round 1</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FileCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredSubmissions.filter(s => s.roundNumber === 2).length}
                  </div>
                  <div className="text-sm text-gray-500">Round 2</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardContent className="p-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(filteredSubmissions.map(s => s.submittedBy?._id || s.submittedBy?.id)).size}
                  </div>
                  <div className="text-sm text-gray-500">Unique Submitters</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Submissions ({filteredSubmissionsCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No submissions found for the selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                      {selectedProblemStatement !== 'All' && (
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem Statement</th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredSubmissions.map((submission, idx) => (
                      <tr key={submission._id || submission.id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                              {submission.projectTitle?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.projectTitle || 'Untitled Project'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.teamName || 'Individual'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {submission.submittedByName || submission.submittedBy?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {submission.submittedBy?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.roundNumber === 1 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {submission.roundLabel || `Round ${submission.roundNumber}`}
                          </span>
                        </td>
                        {selectedProblemStatement !== 'All' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {submission.problemStatement ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {getProblemStatementText(submission.problemStatement).length > 30 
                                  ? getProblemStatementText(submission.problemStatement).substring(0, 30) + "..." 
                                  : getProblemStatementText(submission.problemStatement)}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === 'submitted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status === 'submitted' ? 'Submitted' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
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
      {/* Submission Details Modal */}
      <Dialog open={submissionDetailsModalOpen} onOpenChange={setSubmissionDetailsModalOpen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[98vw] h-[98vh] overflow-y-auto p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Submission Details
            </DialogTitle>
            <DialogDescription>
              Complete view of submission, assigned judges, and evaluations
            </DialogDescription>
          </DialogHeader>
          {loadingSubmissionDetails ? (
            <div className="flex items-center justify-center py-12">
              {/* Loader2 icon, fallback to text if not imported */}
              <span className="ml-2 text-gray-600">Loading submission details...</span>
            </div>
          ) : submissionDetails ? (
            // --- Copy the modal JSX from JudgeManagementAssignments.jsx here ---
            <div className="bg-gradient-to-b from-slate-50 via-purple-50 to-slate-100 min-h-full">
              {/* ...modal content as in JudgeManagementAssignments.jsx... */}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No submission details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}