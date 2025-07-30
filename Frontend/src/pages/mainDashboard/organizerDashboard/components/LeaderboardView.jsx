import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/CommonUI/card";
import { Button } from "../../../../components/CommonUI/button";
import { Trophy, Award, Users, FileText, CheckCircle, Clock, AlertCircle, RefreshCw, Info, Eye, Filter, List, XCircle, Crown, Star, Mail, Target } from "lucide-react";
import { useToast } from "../../../../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../../components/DashboardUI/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/CommonUI/select";
import EmailSenderModal from './EmailSenderModal';
import { Label } from "../../../../components/CommonUI/label";
import { Checkbox } from "../../../../components/DashboardUI/checkbox";


export default function LeaderboardView({ hackathonId, roundIndex = 0, onShortlistingComplete }) {
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [shortlistCount, setShortlistCount] = useState(10);
  const [shortlistThreshold, setShortlistThreshold] = useState(5);
  const [shortlistMode, setShortlistMode] = useState('topN'); // 'topN', 'threshold', or 'date'
  const [summary, setSummary] = useState(null);
  const [selectedRound, setSelectedRound] = useState(roundIndex);
  const [showOnlyEvaluated, setShowOnlyEvaluated] = useState(false); // Will be set based on round type
  const [viewSubmissionModalOpen, setViewSubmissionModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loadingSubmissionDetails, setLoadingSubmissionDetails] = useState(false);
  const [editShortlistModalOpen, setEditShortlistModalOpen] = useState(false);
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState(null);
  const [updatingShortlist, setUpdatingShortlist] = useState(false);
  const [individualEditModalOpen, setIndividualEditModalOpen] = useState(false);
  const [editAllShortlistModalOpen, setEditAllShortlistModalOpen] = useState(false);
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState([]);
  const [loadingShortlisted, setLoadingShortlisted] = useState(false);
  const [hasShortlisted, setHasShortlisted] = useState(false);
  const [previousShortlistMode, setPreviousShortlistMode] = useState(null);
  const [previousShortlistCount, setPreviousShortlistCount] = useState(null);
  const [previousShortlistThreshold, setPreviousShortlistThreshold] = useState(null);
  const [shortlistFilter, setShortlistFilter] = useState('all'); // 'all', 'shortlisted', 'not-shortlisted'
  
  // Problem Statement Filter State
  const [selectedProblemStatement, setSelectedProblemStatement] = useState('All');
  const [availableProblemStatements, setAvailableProblemStatements] = useState([]);
  
  // Shortlisting Problem Statement Filter State
  const [shortlistProblemStatement, setShortlistProblemStatement] = useState('All');
  
  // Round 2 Winner Assignment States
  const [winnerAssignmentModalOpen, setWinnerAssignmentModalOpen] = useState(false);
  const [assigningWinners, setAssigningWinners] = useState(false);
  const [winnerCount, setWinnerCount] = useState(3);
  const [winnerMode, setWinnerMode] = useState('topN'); // 'topN', 'threshold', 'manual'
  const [winnerThreshold, setWinnerThreshold] = useState(7.0);
  const [selectedWinnerIds, setSelectedWinnerIds] = useState([]);
  const [hasWinners, setHasWinners] = useState(false);
  
  // Winner Assignment Problem Statement Filter State
  const [winnerProblemStatement, setWinnerProblemStatement] = useState('All');
  
  // Hackathon data state
  const [hackathonData, setHackathonData] = useState(null);
  
  // Add new state for per-winner problem statement selection
  const [winnerProblemStatementMap, setWinnerProblemStatementMap] = useState({});
  
  // Reset winner problem statement when modal opens
  useEffect(() => {
    if (winnerAssignmentModalOpen) {
      setWinnerProblemStatement('All');
      console.log('🔍 Frontend - Winner modal opened, reset problem statement to All');
      console.log('🔍 Frontend - Winner modal opened - availableProblemStatements:', availableProblemStatements);
      console.log('🔍 Frontend - Winner modal opened - hackathonData:', hackathonData);
      setWinnerProblemStatementMap({});
    }
  }, [winnerAssignmentModalOpen, availableProblemStatements, hackathonData]);
  
  // Winners Display States
  const [winnersDisplayModalOpen, setWinnersDisplayModalOpen] = useState(false);
  const [winners, setWinners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
  
  // Email Sender States
  const [emailSenderModalOpen, setEmailSenderModalOpen] = useState(false);
  const [availableRounds, setAvailableRounds] = useState([0]); // Default to 1 round, will be updated dynamically

  useEffect(() => {
    if (hackathonId) {
      fetchLeaderboard();
      checkAutoProgress();
      fetchHackathonData();
    }
  }, [hackathonId, selectedRound]);

  // Auto-enable "Show only evaluated" filter for final rounds (winner assignment rounds)
  useEffect(() => {
    // This will be determined by the backend response indicating if it's a final round
    // For now, we'll let the user decide
  }, [selectedRound]);

  // Check if shortlisting has been done
  useEffect(() => {
    if (leaderboard.length > 0) {
      const hasShortlistedSubmissions = leaderboard.some(entry => entry.status === 'shortlisted');
      const shortlistedCount = leaderboard.filter(entry => entry.status === 'shortlisted').length;
      const hasWinnerSubmissions = leaderboard.some(entry => entry.status === 'winner');
      
      console.log('🔍 Frontend - Checking shortlisting status:', {
        totalEntries: leaderboard.length,
        shortlistedEntries: shortlistedCount,
        hasShortlistedSubmissions,
        hasShortlisted: hasShortlisted, // Current state
        hasWinnerSubmissions,
        entries: leaderboard.map(entry => ({ 
          id: entry._id, 
          status: entry.status, 
          title: entry.projectTitle,
          teamName: entry.teamName,
          averageScore: entry.averageScore
        }))
      });
      
      // Only update hasShortlisted if we find shortlisted entries and it's not already set
      if (shortlistedCount > 0 && !hasShortlisted) {
        console.log('🔍 Frontend - Found shortlisted entries, setting hasShortlisted to true');
        setHasShortlisted(true);
      } else if (shortlistedCount === 0 && hasShortlisted) {
        console.log('🔍 Frontend - No shortlisted entries found, setting hasShortlisted to false');
        setHasShortlisted(false);
      }
      
      // Check for winners
      console.log('🔍 Frontend - Checking winners status:', {
        hasWinnerSubmissions,
        hasWinners,
        winnerEntries: leaderboard.filter(entry => entry.status === 'winner').length
      });
      
      if (hasWinnerSubmissions && !hasWinners) {
        console.log('🔍 Frontend - Setting hasWinners to true');
        setHasWinners(true);
      } else if (!hasWinnerSubmissions && hasWinners) {
        console.log('🔍 Frontend - Setting hasWinners to false');
        setHasWinners(false);
       }
    }
  }, [leaderboard]);

  const checkAutoProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/auto-progress-round2`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.progressed) {
          toast({
            title: 'Round 2 Auto-Progress',
            description: `${data.count} submissions have been automatically moved to Round 2`,
            variant: 'default',
          });
          fetchLeaderboard(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error checking auto-progress:', error);
    }
  };

  const fetchHackathonData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hackathons/${hackathonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const hackathonData = await response.json();
        console.log('🔍 Frontend - Hackathon data fetched:', hackathonData);
        console.log('🔍 Frontend - Problem statements in hackathon data:', hackathonData.problemStatements);
        setHackathonData(hackathonData);
        setSummary(prev => ({
          ...prev,
          hackathon: hackathonData
        }));
      }
    } catch (error) {
      console.error('🔍 Frontend - Error fetching hackathon data:', error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      console.log('🔍 Frontend - Fetching leaderboard for hackathonId:', hackathonId, 'roundIndex:', selectedRound);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🔍 Frontend - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Frontend - Leaderboard data received:', data);
        
        // Filter to show only evaluated submissions if requested
        let filteredLeaderboard = data.leaderboard || [];
        console.log('🔍 Frontend - Raw leaderboard data:', filteredLeaderboard);
        console.log('🔍 Frontend - Show only evaluated:', showOnlyEvaluated);
        console.log('🔍 Frontend - Summary data:', data.summary);
        
        // Debug: Log each entry's score count
        filteredLeaderboard.forEach((entry, index) => {
          console.log(`🔍 Frontend - Entry ${index}:`, {
            projectTitle: entry.projectTitle,
            scoreCount: entry.scoreCount,
            averageScore: entry.averageScore,
            totalScore: entry.totalScore
          });
        });
        
        if (showOnlyEvaluated) {
          filteredLeaderboard = filteredLeaderboard.filter(entry => entry.scoreCount > 0);
          console.log('🔍 Frontend - Filtered leaderboard (evaluated only):', filteredLeaderboard);
        }
        
        setLeaderboard(filteredLeaderboard);
        setSummary(data.summary);
        
        // Store hackathon data for problem statements
        if (data.hackathon) {
          setSummary(prev => ({
            ...prev,
            hackathon: data.hackathon
          }));
        }
        
        // Update available rounds based on hackathon data
        if (data.hackathon && data.hackathon.rounds && data.hackathon.rounds.length > 0) {
          const totalRounds = data.hackathon.rounds.length;
          const rounds = Array.from({ length: totalRounds }, (_, i) => i);
          setAvailableRounds(rounds);
        } else {
          // Fallback: if no rounds data, assume single round
          setAvailableRounds([0]);
        }
      } else {
        const errorData = await response.json();
        console.error('🔍 Frontend - Error response:', errorData);
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('🔍 Frontend - Error fetching leaderboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leaderboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (submission) => {
    setSelectedSubmission(submission);
    setViewSubmissionModalOpen(true);
    setLoadingSubmissionDetails(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch detailed submission information
      const response = await fetch(`/api/submission-form/admin/${submission._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const submissionData = await response.json();
        
        // Fetch judge evaluations for this submission
        const evaluationsResponse = await fetch(`/api/scores/submission/${submission._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let evaluations = [];
        if (evaluationsResponse.ok) {
          evaluations = await evaluationsResponse.json();
        }
        
        setSubmissionDetails({
          ...submissionData.submission,
          evaluations
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch submission details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submission details",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmissionDetails(false);
    }
  };

  const handleShortlisting = async () => {
    // Validate based on mode
    if (shortlistMode === 'topN' && shortlistCount < 1) {
      toast({
        title: 'Invalid count',
        description: 'Please enter a valid number of submissions to shortlist',
        variant: 'destructive',
      });
      return;
    }

    if (shortlistMode === 'threshold' && (shortlistThreshold < 0 || shortlistThreshold > 10)) {
      toast({
        title: 'Invalid threshold',
        description: 'Please enter a valid score threshold between 0 and 10',
        variant: 'destructive',
      });
      return;
    }

    setShortlisting(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = shortlistMode === 'topN' 
        ? { shortlistCount, mode: 'topN', problemStatement: shortlistProblemStatement }
        : { shortlistThreshold, mode: 'threshold', problemStatement: shortlistProblemStatement };

      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Shortlisting successful',
          description: `Successfully shortlisted ${data.shortlistedSubmissions.length} submissions`,
          variant: 'default',
        });
        setShortlistModalOpen(false);
        
        console.log('🔍 Frontend - Shortlisting successful, updating states...');
        
        // Track the shortlisting mode and parameters
        setHasShortlisted(true);
        setPreviousShortlistMode(shortlistMode);
        setPreviousShortlistCount(shortlistCount);
        setPreviousShortlistThreshold(shortlistThreshold);
        
        console.log('🔍 Frontend - hasShortlisted set to true');
        
        console.log('🔍 Frontend - States updated, fetching leaderboard...');
        
        // Immediately update the leaderboard to show shortlisted status
        fetchLeaderboard();
        
        // Force a second refresh after a short delay to ensure data is updated
        setTimeout(() => {
          console.log('🔍 Frontend - Force refresh after shortlisting');
          fetchLeaderboard();
        }, 1000);
        
        // Force a third refresh after a longer delay to ensure database updates are reflected
        setTimeout(() => {
          console.log('🔍 Frontend - Final refresh after shortlisting');
          fetchLeaderboard();
        }, 3000);
        
        if (onShortlistingComplete) {
          onShortlistingComplete();
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Shortlisting failed');
      }
    } catch (error) {
      console.error('Error performing shortlisting:', error);
      toast({
        title: 'Shortlisting failed',
        description: error.message || 'Failed to perform shortlisting',
        variant: 'destructive',
      });
    } finally {
      setShortlisting(false);
    }
  };

  const handleEditShortlist = (entry) => {
    console.log('🔍 Frontend - Editing individual shortlist for entry:', entry);
    setSelectedEntryForEdit(entry);
    setIndividualEditModalOpen(true);
  };

  const handleToggleShortlist = async (submissionId, shouldShortlist) => {
    setUpdatingShortlist(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/toggle-shortlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          submissionId,
          shortlist: shouldShortlist
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Shortlist updated',
          description: data.message,
          variant: 'default',
        });
        setEditShortlistModalOpen(false);
        setIndividualEditModalOpen(false);
        
        // Refresh the leaderboard multiple times to ensure updates are reflected
        fetchLeaderboard();
        setTimeout(() => {
          fetchLeaderboard();
        }, 500);
        setTimeout(() => {
          fetchLeaderboard();
        }, 1500);
        
        if (onShortlistingComplete) {
          onShortlistingComplete();
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update shortlist');
      }
    } catch (error) {
      console.error('Error updating shortlist:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update shortlist status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingShortlist(false);
    }
  };

  const handleEditAllShortlist = async () => {
    setLoadingShortlisted(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/shortlisted`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShortlistedSubmissions(data.shortlistedSubmissions || []);
        setEditAllShortlistModalOpen(true);
      } else {
        throw new Error('Failed to fetch shortlisted submissions');
      }
    } catch (error) {
      console.error('Error fetching shortlisted submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shortlisted submissions',
        variant: 'destructive',
      });
    } finally {
      setLoadingShortlisted(false);
    }
  };

  const fetchWinnersDetails = async () => {
    setLoadingWinners(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/winners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWinners(data.winners || []);
      } else {
        console.error('Failed to fetch winners details');
      }
    } catch (error) {
      console.error('Error fetching winners details:', error);
    } finally {
      setLoadingWinners(false);
    }
  };

  const handleAssignWinners = async () => {
    setAssigningWinners(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        winnerCount: winnerCount,
        mode: winnerMode,
        threshold: winnerMode === 'threshold' ? winnerThreshold : undefined,
        winnerIds: winnerMode === 'manual' ? selectedWinnerIds : undefined,
        problemStatement: winnerProblemStatement !== 'All' ? winnerProblemStatement : undefined
      };

      const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/assign-winners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: data.isReassignment ? 'Winners Reassigned Successfully' : 'Winners Assigned Successfully',
          description: data.message,
          variant: 'default',
        });
        setWinnerAssignmentModalOpen(false);
        fetchLeaderboard(); // Refresh leaderboard to show winners
        
        // Show winners details modal
        setWinners(data.winners || []);
        setWinnersDisplayModalOpen(true);
        
        if (onShortlistingComplete) {
          onShortlistingComplete();
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign winners');
      }
    } catch (error) {
      console.error('Error assigning winners:', error);
      toast({
        title: 'Winner Assignment Failed',
        description: error.message || 'Failed to assign winners',
        variant: 'destructive',
      });
    } finally {
      setAssigningWinners(false);
    }
  };

  const handleEmailSent = (emailResult) => {
    toast({
      title: 'Emails Sent Successfully',
      description: `Successfully sent emails to ${emailResult.winnerEmails.successful} winners${emailResult.shortlistedEmails ? ` and ${emailResult.shortlistedEmails.successful} shortlisted participants` : ''}`,
      variant: 'default',
    });
    fetchLeaderboard(); // Refresh to show any updates
  };

  const getStatusIcon = (scoreCount) => {
    if (scoreCount > 0) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (scoreCount) => {
    if (scoreCount > 0) {
      return 'Evaluated';
    }
    return 'Pending';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // Helper function to extract problem statement text
  const getProblemStatementText = (ps) => {
    if (typeof ps === 'string') return ps;
    if (typeof ps === 'object' && ps.statement) return ps.statement;
    return String(ps);
  };

  // Helper function to check if a submission matches the selected problem statement
  const hasSubmittedToProblemStatement = (entry, problemStatement) => {
    if (!entry.problemStatement) return false;
    return getProblemStatementText(entry.problemStatement) === getProblemStatementText(problemStatement);
  };

  // Extract available problem statements from leaderboard entries and hackathon data
  useEffect(() => {
    console.log('🔍 Frontend - useEffect triggered - leaderboard length:', leaderboard.length, 'summary:', summary, 'hackathonData:', hackathonData);
    
    const problemStatements = [...new Set(leaderboard.map(entry => entry.problemStatement).filter(ps => ps))];
    console.log('🔍 Frontend - Available problem statements from leaderboard:', problemStatements);
    console.log('🔍 Frontend - Leaderboard entries with problem statements:', leaderboard.filter(entry => entry.problemStatement).map(entry => ({
      projectTitle: entry.projectTitle,
      problemStatement: entry.problemStatement
    })));
    
    // Get problem statements from hackathon data as fallback
    let allProblemStatements = [...problemStatements];
    
    // Try to get from hackathonData first
    if (hackathonData?.problemStatements) {
      const hackathonPS = hackathonData.problemStatements.map(ps => 
        typeof ps === 'string' ? ps : ps.statement
      );
      console.log('🔍 Frontend - Problem statements from hackathonData:', hackathonPS);
      allProblemStatements = [...new Set([...problemStatements, ...hackathonPS])];
    } else if (summary?.hackathon?.problemStatements) {
      const hackathonPS = summary.hackathon.problemStatements.map(ps => 
        typeof ps === 'string' ? ps : ps.statement
      );
      console.log('🔍 Frontend - Problem statements from summary.hackathon:', hackathonPS);
      allProblemStatements = [...new Set([...problemStatements, ...hackathonPS])];
    } else {
      console.log('🔍 Frontend - No hackathon problem statements found in either source');
    }
    
    console.log('🔍 Frontend - Final available problem statements:', allProblemStatements);
    setAvailableProblemStatements(allProblemStatements);
  }, [leaderboard, summary, hackathonData]);

  const filteredLeaderboard = leaderboard
    .filter(entry => {
      // First filter by evaluation status
      if (showOnlyEvaluated && entry.scoreCount === 0) {
        return false;
      }
      
      // Then filter by shortlist status
      if (shortlistFilter === 'shortlisted') {
        return entry.status === 'shortlisted';
      } else if (shortlistFilter === 'not-shortlisted') {
        return entry.status !== 'shortlisted';
      }
      
      // Then filter by problem statement
      if (selectedProblemStatement !== 'All') {
        return hasSubmittedToProblemStatement(entry, selectedProblemStatement);
      }
      
      return true; // 'all' filter
    });

if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
        <div className="w-full max-w-none mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <Card className="shadow-none hover:shadow-none border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
     {/* Enhanced Header */}
<div className="space-y-6 mb-8">
  {/* Main Header Section */}
  <Card className="shadow-none hover:shadow-none ">
    <CardContent className="p-6 pt-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
           
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Round {selectedRound + 1} Leaderboard
              </h2>
              <p className="text-gray-600 text-base">
                {(() => {
                  const isFinalRound = leaderboard.length > 0 && leaderboard.some(entry => entry.isFinalRound);
                  if (selectedRound === 0) {
                    return 'Track evaluation progress and shortlist top performers';
                  } else if (isFinalRound) {
                    return 'Final rankings and winner selection';
                  } else {
                    return 'Track evaluation progress and shortlist top performers';
                  }
                })()}
              </p>
            </div>
          </div>

          {/* Round Specific Content */}
          {(() => {
            const isFinalRound = leaderboard.length > 0 && leaderboard.some(entry => entry.isFinalRound);
            return !isFinalRound;
          })() && (
            <div className="">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  
                  {summary && summary.evaluatedSubmissions > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {summary.evaluatedSubmissions} submissions evaluated • Ready for shortlisting
                      </span>
                    </div>
                  )}
                  
                  {summary && summary.evaluatedSubmissions === 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-700 font-medium">
                        Waiting for judge evaluations to begin shortlisting
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Final Round Specific Content */}
          {(() => {
            const isFinalRound = leaderboard.length > 0 && leaderboard.some(entry => entry.isFinalRound);
            return isFinalRound;
          })() && (
            <div className="">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  {summary && summary.evaluatedSubmissions > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-medium">
                        {summary.evaluatedSubmissions} submissions evaluated • Ready for winner assignment
                      </span>
                    </div>
                  )}
                  
                  {summary && summary.evaluatedSubmissions === 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-700 font-medium">
                        Waiting for judge evaluations to begin winner assignment
                      </span>
                    </div>
                  )}
                  
                  {/* Winners Summary */}
                  {hasWinners && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="w-6 h-6 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">
                              🏆 Winners Announced
                            </h4>
                            <p className="text-sm text-yellow-700">
                              {leaderboard.filter(entry => entry.status === 'winner').length} winner{leaderboard.filter(entry => entry.status === 'winner').length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            fetchWinnersDetails();
                            setWinnersDisplayModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                        >
                          <Trophy className="w-4 h-4 mr-2" />
                          View Winners Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-col gap-3 ml-6">
          <Button
            onClick={() => {
              console.log('🔍 Frontend - Manual refresh triggered');
              fetchLeaderboard();
            }}
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {summary && summary.totalSubmissions > 0 && (
            <>
              {/* Round 1 Actions */}
              {selectedRound === 0 && (
                <div className="flex flex-col gap-2">
                  {!hasShortlisted ? (
                    <Button
                      onClick={() => setShortlistModalOpen(true)}
                      className={`${
                        summary.evaluatedSubmissions > 0 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                      disabled={summary.evaluatedSubmissions === 0}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {summary.evaluatedSubmissions > 0 
                        ? 'Shortlist for Round 2' 
                        : 'Shortlist (No Evaluations Yet)'
                      }
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setEditShortlistModalOpen(true)}
                        variant="outline"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        disabled={loadingShortlisted}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {loadingShortlisted ? 'Loading...' : 'Edit Shortlist'}
                      </Button>
                      <Button
                        onClick={handleEditAllShortlist}
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        disabled={loadingShortlisted}
                      >
                        <List className="w-4 h-4 mr-2" />
                        {loadingShortlisted ? 'Loading...' : 'View All Shortlisted'}
                      </Button>
                    </>
                  )}
                </div>
              )}
              
              {/* Final Round Actions (Winner Assignment) */}
              {(() => {
                // Check if this is a final round by looking at the leaderboard data
                // The backend will indicate if this is a final round through the response
                const isFinalRound = leaderboard.length > 0 && leaderboard.some(entry => entry.isFinalRound);
                return isFinalRound;
              })() && (
                <div className="flex flex-col gap-2">
                  {!hasWinners ? (
                    <>
                      <Button
                        onClick={() => {
                          setWinnerProblemStatement('All');
                          setWinnerAssignmentModalOpen(true);
                        }}
                        className={`${
                          summary.evaluatedSubmissions > 0 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        }`}
                        disabled={summary.evaluatedSubmissions === 0}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {summary.evaluatedSubmissions > 0 
                          ? 'Assign Winners' 
                          : 'Assign Winners (No Evaluations Yet)'
                        }
                      </Button>
                      <Button
                        onClick={() => setEmailSenderModalOpen(true)}
                        variant="outline"
                        className="text-gray-400 border-gray-300"
                        disabled={true}
                        title="No winners assigned yet"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Winner Emails
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setWinnerProblemStatement('All');
                          setWinnerAssignmentModalOpen(true);
                        }}
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        disabled={assigningWinners}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {assigningWinners ? 'Loading...' : 'Reassign Winners'}
                      </Button>
                      <Button
                        onClick={() => {
                          fetchWinnersDetails();
                          setWinnersDisplayModalOpen(true);
                        }}
                        variant="outline"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        disabled={loadingWinners}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        {loadingWinners ? 'Loading...' : 'View Winners Details'}
                      </Button>
                      <Button
                        onClick={() => setEmailSenderModalOpen(true)}
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        disabled={false}
                        title="Send emails to winners"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Winner Emails
                      </Button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Enhanced Filters Section */}
  <Card className="shadow-none hover:shadow-none ">
    <CardContent className="p-6 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-600 rounded-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filters & View Options</h3>
        </div>
        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
          Showing {filteredLeaderboard.length} of {leaderboard.length} submissions
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Round Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Round Selection</Label>
          <Select value={selectedRound.toString()} onValueChange={(value) => setSelectedRound(parseInt(value))}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRounds.map((roundIndex) => (
                <SelectItem key={roundIndex} value={roundIndex.toString()}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      roundIndex === availableRounds.length - 1 ? 'bg-purple-500' : 'bg-blue-500'
                    }`}></div>
                    {roundIndex === availableRounds.length - 1 ? `Winner Assignment Round ${roundIndex + 1}` : `Round ${roundIndex + 1}`}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show Only Evaluated Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Evaluation Status</Label>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <Checkbox
              id="show-evaluated"
              checked={showOnlyEvaluated}
              onCheckedChange={(checked) => setShowOnlyEvaluated(checked)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="show-evaluated" className="text-sm text-gray-700 cursor-pointer">
              Show only evaluated
              {(() => {
                const isFinalRound = leaderboard.length > 0 && leaderboard.some(entry => entry.isFinalRound);
                return isFinalRound;
              })() && (
                <span className="text-blue-600 ml-1 text-xs">(Auto-enabled for final round)</span>
              )}
            </Label>
          </div>
        </div>

        {/* Shortlist Status Filter */}
        {hasShortlisted && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Shortlist Status</Label>
            <Select value={shortlistFilter} onValueChange={setShortlistFilter}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="shortlisted">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Shortlisted Only
                  </div>
                </SelectItem>
                <SelectItem value="not-shortlisted">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-500" />
                    Not Shortlisted
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Problem Statement Filter */}
        {availableProblemStatements.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Problem Statement</Label>
            <Select value={selectedProblemStatement} onValueChange={setSelectedProblemStatement}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Problem Statements</SelectItem>
                {availableProblemStatements.map((ps, index) => (
                  <SelectItem key={index} value={ps}>
                    {ps.length > 40 ? ps.substring(0, 40) + '...' : ps}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Summary Stats */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Summary</Label>
          <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-gray-900">{leaderboard.length}</span>
            </div>
            {hasShortlisted && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">Shortlisted:</span>
                <span className="font-semibold text-green-700">
                  {leaderboard.filter(entry => entry.status === 'shortlisted').length}
                </span>
              </div>
            )}
            {(() => {
              const isFinalRound = leaderboard.length > 0 && leaderboard.some(entry => entry.isFinalRound);
              return isFinalRound && showOnlyEvaluated;
            })() && (
              <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <Info className="w-3 h-3 inline mr-1" />
                Only judged evaluations shown for Round 2
              </div>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      {/* Summary Cards */}
{summary && (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
    <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-blue-50 to-blue-100">
      <CardContent className="p-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-900">
              {summary.totalSubmissions}
            </p>
            <p className="text-sm font-medium text-blue-700">Total Submissions</p>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-green-50 to-green-100">
      <CardContent className="p-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-600 rounded-xl">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-green-900">
              {summary.evaluatedSubmissions}
            </p>
            <p className="text-sm font-medium text-green-700">Evaluated</p>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <CardContent className="p-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-600 rounded-xl">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-900">
              {summary.pendingEvaluations}
            </p>
            <p className="text-sm font-medium text-yellow-700">Pending</p>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-purple-50 to-purple-100">
      <CardContent className="p-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-900">
              {summary.averageScore || 0}/10
            </p>
            <p className="text-sm font-medium text-purple-700">Avg Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className="shadow-none hover:shadow-none border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
      <CardContent className="p-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-900">
              {summary.shortlistedCount || 0}
            </p>
            <p className="text-sm font-medium text-indigo-700">Shortlisted</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}


      {/* Leaderboard Table */}
      <Card className="shadow-none hover:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {showOnlyEvaluated 
                  ? 'No evaluated submissions found for this round' 
                  : 'No submissions found for this round'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                  
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    {selectedRound === 1 ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PPT Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 uppercase tracking-wider">
                          Combined Score
                        </th>
                      </>
                    ) : (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {selectedRound === 0 ? (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shortlisted
                      </th>
                    ) : (
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-600 uppercase tracking-wider">
                        Winner
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Winning Problem Statement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaderboard.map((entry, index) => (
                    <tr key={entry._id} className={`hover:bg-gray-50 ${
                      entry.status === 'winner' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.status === 'winner' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-yellow-500 to-orange-500">
                                <Crown className="w-4 h-4" />
                              </div>
                              <span className="text-xs text-yellow-600 font-medium">
                                Winner
                              </span>
                            </div>
                          ) : index < 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' : 
                              index === 1 ? 'bg-gray-400' : 
                              'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                          ) : (
                            <span className="text-gray-900 font-medium">{entry.rank}</span>
                          )}
                
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entry.teamName}</div>
                          <div className="text-sm text-gray-500">{entry.leaderName}</div>
                        </div>
                      </td>
                    
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {entry.pptFile ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Award className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm text-gray-600">
                            {entry.pptFile ? 'PPT' : 'Project'}
                          </span>
                        </div>
                      </td>
                      {selectedRound === 1 ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {typeof entry.pptScore === 'number' ? `${entry.pptScore}/10` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {typeof entry.projectScore === 'number' ? `${entry.projectScore}/10` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-yellow-600">
                              {entry.averageScore > 0 ? `${entry.averageScore}/10` : 'N/A'}
                            </div>
                          </td>
                        </>
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.averageScore > 0 ? `${entry.averageScore}/10` : 'N/A'}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {entry.scoreCount} evaluation{entry.scoreCount !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(entry.scoreCount)}
                          <span className="text-sm text-gray-600">
                            {getStatusText(entry.scoreCount)}
                          </span>
                        </div>
                      </td>
                      {selectedRound === 0 ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.status === 'shortlisted' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">Shortlisted</span>
                            </div>
                          ) : shortlistModalOpen && shortlistMode === 'topN' && 
                             leaderboard.filter(e => e.scoreCount > 0).findIndex(e => e._id === entry._id) < shortlistCount ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                              <span className="text-sm text-green-600 font-medium">Will be shortlisted</span>
                            </div>
                          ) : shortlistModalOpen && shortlistMode === 'threshold' && 
                             entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                              <span className="text-sm text-green-600 font-medium">Will be shortlisted</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not Shortlisted</span>
                          )}
                        </td>
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.status === 'winner' ? (
                            <div className="flex items-center gap-1">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600 font-medium">Winner</span>
                            </div>
                          ) : winnerAssignmentModalOpen && winnerMode === 'topN' && 
                             leaderboard.filter(e => e.scoreCount > 0).findIndex(e => e._id === entry._id) < winnerCount ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold">
                                👑
                              </div>
                              <span className="text-sm text-yellow-600 font-medium">Will be winner</span>
                            </div>
                          ) : winnerAssignmentModalOpen && winnerMode === 'threshold' && 
                             entry.scoreCount > 0 && entry.averageScore >= winnerThreshold ? (
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold">
                                👑
                              </div>
                              <span className="text-sm text-yellow-600 font-medium">Will be winner</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.status === 'winner' && entry.problemStatement && (
                          <span className="text-purple-700 font-medium">
                            {getProblemStatementText(entry.problemStatement)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewSubmission(entry)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleEditShortlist(entry)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Submission Modal */}
      <Dialog open={viewSubmissionModalOpen} onOpenChange={setViewSubmissionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Submission Details
            </DialogTitle>
          </DialogHeader>
          {loadingSubmissionDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading submission details...</span>
            </div>
          ) : submissionDetails ? (
            <div className="space-y-6">
              {/* Submission Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {submissionDetails.projectTitle || submissionDetails.title || 'Untitled Project'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Team:</span>
                        <span className="ml-2 text-gray-900">{submissionDetails.teamName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submission Type:</span>
                        <span className="ml-2 text-gray-900">
                          {submissionDetails.pptFile ? 'PPT Presentation' : 'Project Files'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Submitted:</span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(submissionDetails.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {submissionDetails.evaluations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Evaluations</div>
                  </div>
                </div>
              </div>

              {/* Submission Files */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Submission Files
                </h4>
                <div className="space-y-4">
                  {submissionDetails.pptFile && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">PPT Presentation</div>
                            <div className="text-sm text-gray-500">
                              {submissionDetails.pptFile.split('/').pop()}
                            </div>
                          </div>
                        </div>
                        <a
                          href={submissionDetails.pptFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                          Open in New Tab
                        </a>
                      </div>
                      
                      {/* PPT Preview Section */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          PPT Preview
                        </h5>
                        <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent(submissionDetails.pptFile)}&embedded=true`}
                            style={{ 
                              width: "100%", 
                              height: "600px", 
                              border: "none"
                            }}
                            title="PPT Preview"
                            allowFullScreen
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {submissionDetails.projectFiles && submissionDetails.projectFiles.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Project Files:</h5>
                      {submissionDetails.projectFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{file.name}</div>
                              <div className="text-sm text-gray-500">{file.type}</div>
                            </div>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Judge Evaluations */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Judge Evaluations ({submissionDetails.evaluations?.length || 0})
                </h4>
                {submissionDetails.evaluations && submissionDetails.evaluations.length > 0 ? (
                  <div className="space-y-4">
                    {submissionDetails.evaluations.map((evaluation, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-700">
                                {(evaluation.judge?.name || evaluation.judge?.email || 'J')[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {evaluation.judge?.name || evaluation.judge?.email || 'Unknown Judge'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {evaluation.judge?.email || 'No email available'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {evaluation.totalScore || (evaluation.scores && Object.values(evaluation.scores).reduce((sum, score) => sum + (score || 0), 0) / Object.keys(evaluation.scores).length) || 0}/10
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(evaluation.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Evaluation Criteria */}
                        {evaluation.scores && Object.keys(evaluation.scores).length > 0 && (
                          <div className="space-y-2">
                            <h6 className="font-medium text-gray-900">Evaluation Criteria:</h6>
                            {Object.entries(evaluation.scores).map(([criteria, score]) => (
                              <div key={criteria} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700 capitalize">{criteria}</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {score}/10
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comments */}
                        {evaluation.feedback && (
                          <div className="mt-4">
                            <h6 className="font-medium text-gray-900 mb-2">Comments:</h6>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No evaluations completed yet</p>
                  </div>
                )}
              </div>

              {/* Average Score */}
              {submissionDetails.evaluations && submissionDetails.evaluations.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Score</h4>
                    <div className="text-4xl font-bold text-green-600">
                      {(() => {
                        if (!submissionDetails.evaluations || submissionDetails.evaluations.length === 0) return '0.0';
                        const totalScore = submissionDetails.evaluations.reduce((sum, evaluation) => {
                          const score = evaluation.totalScore || 
                            (evaluation.scores && Object.values(evaluation.scores).reduce((s, val) => s + (val || 0), 0) / Object.keys(evaluation.scores).length) || 0;
                          return sum + score;
                        }, 0);
                        return (totalScore / submissionDetails.evaluations.length).toFixed(1);
                      })()}/10
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Based on {submissionDetails.evaluations.length} evaluation{submissionDetails.evaluations.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No submission details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shortlist Modal */}
      <Dialog open={shortlistModalOpen} onOpenChange={setShortlistModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Shortlist for Round 2
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Shortlisting Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shortlisting Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="topN"
                    checked={shortlistMode === 'topN'}
                    onChange={(e) => setShortlistMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Top N Projects</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="threshold"
                    checked={shortlistMode === 'threshold'}
                    onChange={(e) => setShortlistMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Score Threshold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="date"
                    checked={shortlistMode === 'date'}
                    onChange={(e) => setShortlistMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Round 1 End Date</span>
                </label>
              </div>
            </div>

            {/* Problem Statement Filter for Shortlisting */}
            {availableProblemStatements.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Problem Statement
                </label>
                <select
                  value={shortlistProblemStatement}
                  onChange={(e) => setShortlistProblemStatement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Problem Statements</option>
                  {availableProblemStatements.map((ps, index) => (
                    <option key={index} value={ps}>
                      {ps.length > 40 ? ps.substring(0, 40) + '...' : ps}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {shortlistProblemStatement === 'All' 
                    ? 'Shortlist from all problem statements'
                    : `Shortlist only from "${shortlistProblemStatement.substring(0, 30)}..."`
                  }
                </p>
              </div>
            )}

            {/* Top N Mode */}
            {shortlistMode === 'topN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of projects to shortlist
                </label>
                <input
                  type="number"
                  min="1"
                  max={leaderboard.length}
                  value={shortlistCount}
                  onChange={(e) => setShortlistCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {leaderboard.length} projects
                </p>
              </div>
            )}

            {/* Threshold Mode */}
            {shortlistMode === 'threshold' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum score threshold
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={shortlistThreshold}
                  onChange={(e) => setShortlistThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Projects with average score ≥ {shortlistThreshold}/10 will be shortlisted
                </p>
              </div>
            )}

            {/* Date Mode */}
            {shortlistMode === 'date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortlist all submissions after Round 1 ends
                </label>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    This will shortlist all submissions that were submitted before the Round 1 end date.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Useful when you want to advance all teams that participated in Round 1.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Preview</span>
              </div>
              <div className="text-sm text-blue-700">
                {shortlistMode === 'topN' && (
                  <div>
                    <p>Will shortlist the top {shortlistCount} projects:</p>
                    <p className="text-xs text-blue-600 mb-2">
                      {leaderboard.filter(entry => entry.scoreCount > 0 && (shortlistProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, shortlistProblemStatement))).length} projects evaluated, 
                      {Math.min(shortlistCount, leaderboard.filter(entry => entry.scoreCount > 0 && (shortlistProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, shortlistProblemStatement))).length)} will be shortlisted
                      {shortlistProblemStatement !== 'All' && (
                        <span className="text-green-600"> (filtered by PS)</span>
                      )}
                    </p>
                    <div className="mt-2 space-y-1">
                      {leaderboard
                        .filter(entry => entry.scoreCount > 0 && (shortlistProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, shortlistProblemStatement)))
                        .slice(0, shortlistCount)
                        .map((entry, index) => (
                          <div key={entry._id} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                            <span className="font-medium">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                            <span className="text-green-600">({entry.averageScore}/10)</span>
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                        ))}
                      {leaderboard.filter(entry => entry.scoreCount > 0).length < shortlistCount && (
                        <p className="text-orange-600 text-xs">
                          Only {leaderboard.filter(entry => entry.scoreCount > 0).length} projects have been evaluated
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {shortlistMode === 'threshold' && (
                  <div>
                    <p>Will shortlist projects with score ≥ {shortlistThreshold}/10:</p>
                    <p className="text-xs text-blue-600 mb-2">
                      {leaderboard.filter(entry => entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold).length} projects meet the threshold
                    </p>
                    <div className="mt-2 space-y-1">
                      {leaderboard
                        .filter(entry => entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold)
                        .map((entry, index) => (
                          <div key={entry._id} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                            <span className="font-medium">{entry.projectTitle}</span>
                            <span className="text-green-600">({entry.averageScore}/10)</span>
                          </div>
                        ))}
                      {leaderboard.filter(entry => entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold).length === 0 && (
                        <p className="text-orange-600 text-xs">No projects meet the threshold criteria</p>
                      )}
                    </div>
                  </div>
                )}
                {shortlistMode === 'date' && (
                  <div>
                    <p>Will shortlist all {leaderboard.filter(entry => entry.scoreCount > 0).length} evaluated projects</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {shortlistMode === 'topN' 
                    ? `This will shortlist the top ${shortlistCount} projects to advance to Round 2.`
                    : shortlistMode === 'threshold'
                    ? `This will shortlist all projects with average score ≥ ${shortlistThreshold}/10 to advance to Round 2.`
                    : `This will shortlist all submissions that participated in Round 1 to advance to Round 2.`
                  }
                </span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">What happens after shortlisting?</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Shortlisted teams will be notified</li>
                    <li>• They can submit new projects for Round 2</li>
                    <li>• Only shortlisted teams can access Round 2</li>
                    <li>• Auto-progression occurs when Round 2 starts</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {summary && summary.evaluatedSubmissions === 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">No evaluations yet</p>
                    <p className="text-xs mt-1">
                      You can still shortlist submissions manually, but it's recommended to wait for judge evaluations for better decision-making.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShortlistModalOpen(false)}
                disabled={shortlisting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShortlisting}
                disabled={shortlisting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {shortlisting ? 'Shortlisting...' : 'Shortlist Projects'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Shortlist Modal */}
      <Dialog open={editShortlistModalOpen} onOpenChange={setEditShortlistModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Edit Shortlisting Method
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Previous Method Info */}
            {previousShortlistMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Previous Method</span>
                </div>
                <div className="text-sm text-blue-700">
                  {previousShortlistMode === 'topN' && (
                    <p>Top {previousShortlistCount} Projects</p>
                  )}
                  {previousShortlistMode === 'threshold' && (
                    <p>Score Threshold ≥ {previousShortlistThreshold}/10</p>
                  )}
                  {previousShortlistMode === 'date' && (
                    <p>Round 1 End Date (All Submissions)</p>
                  )}
                </div>
              </div>
            )}

            {/* Shortlisting Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shortlisting Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="topN"
                    checked={shortlistMode === 'topN'}
                    onChange={(e) => setShortlistMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Top N Projects</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="threshold"
                    checked={shortlistMode === 'threshold'}
                    onChange={(e) => setShortlistMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Score Threshold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="date"
                    checked={shortlistMode === 'date'}
                    onChange={(e) => setShortlistMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Round 1 End Date</span>
                </label>
              </div>
            </div>

            {/* Problem Statement Filter for Edit Shortlisting */}
            {availableProblemStatements.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Problem Statement
                </label>
                <select
                  value={shortlistProblemStatement}
                  onChange={(e) => setShortlistProblemStatement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Problem Statements</option>
                  {availableProblemStatements.map((ps, index) => (
                    <option key={index} value={ps}>
                      {ps.length > 40 ? ps.substring(0, 40) + '...' : ps}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {shortlistProblemStatement === 'All' 
                    ? 'Shortlist from all problem statements'
                    : `Shortlist only from "${shortlistProblemStatement.substring(0, 30)}..."`
                  }
                </p>
              </div>
            )}

            {/* Top N Mode */}
            {shortlistMode === 'topN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of projects to shortlist
                </label>
                <input
                  type="number"
                  min="1"
                  max={leaderboard.length}
                  value={shortlistCount}
                  onChange={(e) => setShortlistCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {leaderboard.length} projects
                </p>
              </div>
            )}

            {/* Threshold Mode */}
            {shortlistMode === 'threshold' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum score threshold
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={shortlistThreshold}
                  onChange={(e) => setShortlistThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Projects with average score ≥ {shortlistThreshold}/10 will be shortlisted
                </p>
              </div>
            )}

            {/* Date Mode */}
            {shortlistMode === 'date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortlist all submissions after Round 1 ends
                </label>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    This will shortlist all submissions that were submitted before the Round 1 end date.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Useful when you want to advance all teams that participated in Round 1.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Preview</span>
              </div>
              <div className="text-sm text-blue-700">
                {shortlistMode === 'topN' && (
                  <div>
                    <p>Will shortlist the top {shortlistCount} projects:</p>
                    <p className="text-xs text-blue-600 mb-2">
                      {leaderboard.filter(entry => entry.scoreCount > 0 && (shortlistProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, shortlistProblemStatement))).length} projects evaluated, 
                      {Math.min(shortlistCount, leaderboard.filter(entry => entry.scoreCount > 0 && (shortlistProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, shortlistProblemStatement))).length)} will be shortlisted
                      {shortlistProblemStatement !== 'All' && (
                        <span className="text-green-600"> (filtered by PS)</span>
                      )}
                    </p>
                    <div className="mt-2 space-y-1">
                      {leaderboard
                        .filter(entry => entry.scoreCount > 0 && (shortlistProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, shortlistProblemStatement)))
                        .slice(0, shortlistCount)
                        .map((entry, index) => (
                          <div key={entry._id} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                            <span className="font-medium">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                            <span className="text-green-600">({entry.averageScore}/10)</span>
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                        ))}
                      {leaderboard.filter(entry => entry.scoreCount > 0).length < shortlistCount && (
                        <p className="text-orange-600 text-xs">
                          Only {leaderboard.filter(entry => entry.scoreCount > 0).length} projects have been evaluated
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {shortlistMode === 'threshold' && (
                  <div>
                    <p>Will shortlist projects with score ≥ {shortlistThreshold}/10:</p>
                    <p className="text-xs text-blue-600 mb-2">
                      {leaderboard.filter(entry => entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold).length} projects meet the threshold
                    </p>
                    <div className="mt-2 space-y-1">
                      {leaderboard
                        .filter(entry => entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold)
                        .map((entry, index) => (
                          <div key={entry._id} className="flex items-center gap-2 text-xs">
                            <span className="w-4 h-4 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                            <span className="font-medium">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                            <span className="text-green-600">({entry.averageScore}/10)</span>
                          </div>
                        ))}
                      {leaderboard.filter(entry => entry.scoreCount > 0 && entry.averageScore >= shortlistThreshold).length === 0 && (
                        <p className="text-orange-600 text-xs">No projects meet the threshold criteria</p>
                      )}
                    </div>
                  </div>
                )}
                {shortlistMode === 'date' && (
                  <div>
                    <p>Will shortlist all {leaderboard.filter(entry => entry.scoreCount > 0).length} evaluated projects</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {shortlistMode === 'topN' 
                    ? `This will shortlist the top ${shortlistCount} projects to advance to Round 2.`
                    : shortlistMode === 'threshold'
                    ? `This will shortlist all projects with average score ≥ ${shortlistThreshold}/10 to advance to Round 2.`
                    : `This will shortlist all submissions that participated in Round 1 to advance to Round 2.`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setEditShortlistModalOpen(false)}
              disabled={shortlisting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShortlisting}
              disabled={shortlisting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {shortlisting ? 'Updating...' : 'Update Shortlist'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Individual Edit Shortlist Modal */}
      <Dialog open={individualEditModalOpen} onOpenChange={setIndividualEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Edit Submission Shortlist Status
            </DialogTitle>
          </DialogHeader>
          {selectedEntryForEdit && (
            <div className="space-y-4">
              {/* Submission Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  {selectedEntryForEdit.teamName || selectedEntryForEdit.team?.name || selectedEntryForEdit.projectTitle || 'Untitled Project'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Team:</strong> {selectedEntryForEdit.teamName}</p>
                  <p><strong>Average Score:</strong> {selectedEntryForEdit.averageScore}/10</p>
                  <p><strong>Evaluations:</strong> {selectedEntryForEdit.scoreCount}</p>
                  <p><strong>Current Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                      selectedEntryForEdit.status === 'shortlisted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEntryForEdit.status === 'shortlisted' ? 'Shortlisted' : 'Not Shortlisted'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedEntryForEdit.status === 'shortlisted' ? (
                  <Button
                    onClick={() => handleToggleShortlist(selectedEntryForEdit._id, false)}
                    variant="destructive"
                    className="flex-1"
                    disabled={updatingShortlist}
                  >
                    {updatingShortlist ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Removing...
                      </div>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Remove from Shortlist
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleToggleShortlist(selectedEntryForEdit._id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={updatingShortlist}
                  >
                    {updatingShortlist ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Add to Shortlist
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={() => setIndividualEditModalOpen(false)}
                  variant="outline"
                  disabled={updatingShortlist}
                >
                  Cancel
                </Button>
              </div>

              {/* Status Message */}
              <div className="text-sm text-gray-600 text-center">
                {selectedEntryForEdit.status === 'shortlisted' 
                  ? 'This submission is currently shortlisted for Round 2.'
                  : 'This submission is not currently shortlisted for Round 2.'
                }
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit All Shortlist Modal */}
      <Dialog open={editAllShortlistModalOpen} onOpenChange={setEditAllShortlistModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              Edit Shortlisted Submissions
            </DialogTitle>
          </DialogHeader>
          {loadingShortlisted ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading shortlisted submissions...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Shortlisted Submissions</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Manage which submissions are shortlisted for Round 2. You can remove submissions from the shortlist or add new ones.
                </p>
              </div>

              {shortlistedSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No shortlisted submissions found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Use the "Shortlist for Round 2" button to shortlist submissions first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Currently Shortlisted ({shortlistedSubmissions.length})</h4>
                  {shortlistedSubmissions.map((submission, index) => (
                    <div key={submission._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <h5 className="font-semibold text-gray-900">{submission.projectTitle}</h5>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Shortlisted
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><span className="font-medium">Team:</span> {submission.teamName}</div>
                            <div><span className="font-medium">Leader:</span> {submission.leaderName}</div>
                            <div><span className="font-medium">Score:</span> {submission.averageScore}/10</div>
                            <div><span className="font-medium">Evaluations:</span> {submission.scoreCount}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewSubmission(submission)}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleToggleShortlist(submission._id, false)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            disabled={updatingShortlist}
                          >
                            {updatingShortlist ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Remove
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">How to manage shortlisted submissions:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• <strong>View:</strong> See detailed submission information</li>
                      <li>• <strong>Remove:</strong> Remove from shortlist (team won't be able to submit to Round 2)</li>
                      <li>• <strong>Add new:</strong> Use the "Edit" button in the leaderboard table to add submissions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Winner Assignment Modal */}
      <Dialog open={winnerAssignmentModalOpen} onOpenChange={setWinnerAssignmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Assign Winners for Round 2
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Winner Selection Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Winner Selection Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="topN"
                    checked={winnerMode === 'topN'}
                    onChange={(e) => setWinnerMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Top N Projects</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="threshold"
                    checked={winnerMode === 'threshold'}
                    onChange={(e) => setWinnerMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Score Threshold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="manual"
                    checked={winnerMode === 'manual'}
                    onChange={(e) => setWinnerMode(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Manual Selection</span>
                </label>
              </div>
            </div>
            {/* Winner Count or Threshold */}
            {winnerMode === 'topN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Winners
                </label>
                <input
                  type="number"
                  min="1"
                  max={leaderboard.length}
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {leaderboard.length} projects
                </p>
              </div>
            )}
            {winnerMode === 'threshold' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Score Threshold for Winners
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={winnerThreshold}
                  onChange={(e) => setWinnerThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Projects with average score ≥ {winnerThreshold}/10 will be winners
                </p>
              </div>
            )}
            {/* Manual Selection Mode */}
            {winnerMode === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Submissions to be Winners
                </label>
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div key={entry._id} className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedWinnerIds.includes(entry._id)}
                          onChange={() => {
                            if (selectedWinnerIds.includes(entry._id)) {
                              setSelectedWinnerIds(selectedWinnerIds.filter(id => id !== entry._id));
                            } else {
                              setSelectedWinnerIds([...selectedWinnerIds, entry._id]);
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                        <span className="text-gray-500">({entry.averageScore}/10)</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {entry.scoreCount} evaluations
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Hold Ctrl/Cmd to select multiple.
                </p>
              </div>
            )}
            {/* Per-winner Problem Statement Selection */}
            <div>
              <h4 className="text-md font-semibold text-blue-700 mb-2 mt-4">Assign Problem Statement to Each Winner</h4>
              {(winnerMode === 'topN' || winnerMode === 'threshold') && (
                <div className="space-y-2">
                  {leaderboard
                    .filter(entry => entry.scoreCount > 0 && (winnerMode === 'topN'
                      ? leaderboard.filter(e => e.scoreCount > 0).findIndex(e => e._id === entry._id) < winnerCount
                      : entry.averageScore >= winnerThreshold))
                    .slice(0, winnerMode === 'topN' ? winnerCount : undefined)
                    .map((entry, idx) => (
                      <div key={entry._id} className="flex items-center gap-2 mb-2">
                        <span className="font-medium w-48 truncate">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                        <select
                          value={winnerProblemStatementMap[entry._id] || 'All'}
                          onChange={e => setWinnerProblemStatementMap(prev => ({ ...prev, [entry._id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="All">All Problem Statements</option>
                          {availableProblemStatements.map((ps, i) => (
                            <option key={i} value={ps}>
                              {getProblemStatementText(ps).length > 50 ? getProblemStatementText(ps).substring(0, 50) + '...' : getProblemStatementText(ps)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                </div>
              )}
              {winnerMode === 'manual' && (
                <div className="space-y-2">
                  {selectedWinnerIds.map((id, idx) => {
                    const entry = leaderboard.find(e => e._id === id);
                    if (!entry) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 mb-2">
                        <span className="font-medium w-48 truncate">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                        <select
                          value={winnerProblemStatementMap[id] || 'All'}
                          onChange={e => setWinnerProblemStatementMap(prev => ({ ...prev, [id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="All">All Problem Statements</option>
                          {availableProblemStatements.map((ps, i) => (
                            <option key={i} value={ps}>
                              {getProblemStatementText(ps).length > 50 ? getProblemStatementText(ps).substring(0, 50) + '...' : getProblemStatementText(ps)}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Preview</span>
              </div>
              <div className="text-sm text-blue-700">
                {winnerMode === 'topN' && (
                  <div>
                    <p>Will assign {winnerCount} winners:</p>
                    <p className="text-xs text-blue-600 mb-2">
                      {leaderboard.filter(entry => entry.scoreCount > 0 && (winnerProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, winnerProblemStatement))).length} projects evaluated, 
                      {Math.min(winnerCount, leaderboard.filter(entry => entry.scoreCount > 0 && (winnerProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, winnerProblemStatement))).length)} will be winners
                    </p>
                    <div className="mt-2 space-y-1">
                      {leaderboard
                        .filter(entry => entry.scoreCount > 0 && (winnerProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, winnerProblemStatement)))
                        .slice(0, winnerCount)
                        .map((entry, index) => (
                          <div key={entry._id} className="flex items-center gap-2 text-xs">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                            <span className="text-yellow-600">({entry.averageScore}/10)</span>
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {winnerMode === 'threshold' && (
                  <div>
                    <p>Will assign winners with score ≥ {winnerThreshold}/10:</p>
                    <p className="text-xs text-blue-600 mb-2">
                      {leaderboard.filter(entry => entry.scoreCount > 0 && entry.averageScore >= winnerThreshold && (winnerProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, winnerProblemStatement))).length} projects meet the threshold
                    </p>
                    <div className="mt-2 space-y-1">
                      {leaderboard
                        .filter(entry => entry.scoreCount > 0 && entry.averageScore >= winnerThreshold && (winnerProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, winnerProblemStatement)))
                        .map((entry, index) => (
                          <div key={entry._id} className="flex items-center gap-2 text-xs">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{entry.teamName || entry.team?.name || entry.projectTitle}</span>
                            <span className="text-yellow-600">({entry.averageScore}/10)</span>
                          </div>
                        ))}
                      {leaderboard.filter(entry => entry.scoreCount > 0 && entry.averageScore >= winnerThreshold && (winnerProblemStatement === 'All' || hasSubmittedToProblemStatement(entry, winnerProblemStatement))).length === 0 && (
                        <p className="text-orange-600 text-xs">No projects meet the threshold criteria</p>
                      )}
                    </div>
                  </div>
                )}
                {winnerMode === 'manual' && (
                  <div>
                    <p>Selected {selectedWinnerIds.length} submissions to be winners:</p>
                    <div className="mt-2 space-y-1">
                      {selectedWinnerIds.map((id, index) => {
                        const winnerEntry = leaderboard.find(entry => entry._id === id);
                        return (
                          <div key={id} className="flex items-center gap-2 text-xs">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{winnerEntry?.projectTitle || 'Untitled Project'}</span>
                            <span className="text-yellow-600">({winnerEntry?.averageScore}/10)</span>
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setWinnerAssignmentModalOpen(false)}
                disabled={assigningWinners}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setAssigningWinners(true);
                  try {
                    const token = localStorage.getItem('token');
                    // Build winner list and PS mapping for all modes
                    let winners = [];
                    if (winnerMode === 'topN') {
                      winners = leaderboard
                        .filter(entry => entry.scoreCount > 0)
                        .slice(0, winnerCount)
                        .map(entry => ({ id: entry._id, problemStatement: winnerProblemStatementMap[entry._id] || 'All' }));
                    } else if (winnerMode === 'threshold') {
                      winners = leaderboard
                        .filter(entry => entry.scoreCount > 0 && entry.averageScore >= winnerThreshold)
                        .map(entry => ({ id: entry._id, problemStatement: winnerProblemStatementMap[entry._id] || 'All' }));
                    } else if (winnerMode === 'manual') {
                      winners = selectedWinnerIds.map(id => ({ id, problemStatement: winnerProblemStatementMap[id] || 'All' }));
                    }
                    const requestBody = {
                      winnerCount: winnerCount,
                      mode: winnerMode,
                      threshold: winnerMode === 'threshold' ? winnerThreshold : undefined,
                      winnerIds: winnerMode === 'manual' ? selectedWinnerIds : undefined,
                      winners, // <-- new field: array of {id, problemStatement}
                    };
                    const response = await fetch(`/api/judge-management/hackathons/${hackathonId}/rounds/${selectedRound}/assign-winners`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify(requestBody)
                    });
                    if (response.ok) {
                      const data = await response.json();
                      toast({
                        title: data.isReassignment ? 'Winners Reassigned' : 'Winners Assigned',
                        description: data.message,
                        variant: 'default',
                      });
                      setWinnerAssignmentModalOpen(false);
                      fetchLeaderboard();
                      if (onShortlistingComplete) {
                        onShortlistingComplete();
                      }
                    } else {
                      const error = await response.json();
                      throw new Error(error.message || 'Failed to assign winners');
                    }
                  } catch (error) {
                    console.error('Error assigning winners:', error);
                    toast({
                      title: 'Assign Winners Failed',
                      description: error.message || 'Failed to assign winners',
                      variant: 'destructive',
                    });
                  } finally {
                    setAssigningWinners(false);
                  }
                }}
                disabled={assigningWinners}
                className="bg-gold-600 hover:bg-gold-700 text-white"
              >
                {assigningWinners ? 'Assigning Winners...' : 'Assign Winners'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Winners Display Modal */}
      <Dialog open={winnersDisplayModalOpen} onOpenChange={setWinnersDisplayModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Round 2 Winners - Detailed View
            </DialogTitle>
            <DialogDescription>
              View detailed information about the winners including their scores, team details, and performance breakdown.
            </DialogDescription>
          </DialogHeader>
          {loadingWinners ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <span className="ml-2 text-gray-600">Loading winners details...</span>
            </div>
          ) : winners.length > 0 ? (
            <div className="space-y-6">
              {/* Winners Summary */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-800 mb-2">
                      🏆 Round 2 Winners
                    </h3>
                    <p className="text-yellow-700">
                      {winners.length} winner{winners.length !== 1 ? 's' : ''} selected based on combined PPT + Project scores
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-yellow-600">
                      {winners.length}
                    </div>
                    <div className="text-sm text-yellow-600">Winners</div>
                  </div>
                </div>
              </div>

              {/* Winners List */}
              <div className="space-y-4">
                {winners.map((winner, index) => (
                  <div key={winner._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">
                            {winner.projectTitle}
                          </h4>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Team:</span> {winner.teamName}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Leader:</span> {winner.leaderName}
                          </div>
                          {winner.problemStatement && (
                            <div className="text-sm text-purple-700 font-semibold mt-1">
                              <span className="font-medium">Problem Statement:</span> {getProblemStatementText(winner.problemStatement)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">
                          {winner.combinedScore}/10
                        </div>
                        <div className="text-sm text-gray-500">Combined Score</div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">PPT Score</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {winner.pptScore}/10
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Round 1 Presentation
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">Project Score</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {winner.projectScore}/10
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Round 2 Project
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Combined Score</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {winner.combinedScore}/10
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          PPT + Project Average
                        </div>
                      </div>
                    </div>

                    {/* Winner Badge */}
                    <div className="flex items-center justify-center">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-lg">
                        🏆 WINNER #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Winner Assignment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Winner Assignment Details
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Winners were selected based on combined scores from both rounds</p>
                  <p>• Round 1 PPT scores and Round 2 project scores were averaged</p>
                  <p>• All winners have been notified via email and in-app notifications</p>
                  <p>• Winner status is now visible to participants in their dashboard</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Winners Found</h3>
              <p className="text-gray-500">
                No winners have been assigned yet for Round 2. Assign winners to see detailed information.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setWinnersDisplayModalOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setWinnersDisplayModalOpen(false);
                setWinnerProblemStatement('All');
                setWinnerAssignmentModalOpen(true);
              }}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Reassign Winners
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Sender Modal */}
      <EmailSenderModal
        isOpen={emailSenderModalOpen}
        onClose={() => setEmailSenderModalOpen(false)}
        hackathonId={hackathonId}
        hackathonTitle={summary?.hackathonTitle || 'Hackathon'}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
} 
