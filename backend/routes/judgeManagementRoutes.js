const express = require('express');
const router = express.Router();
const judgeManagementController = require('../controllers/judgeManagementController');
const { protect, isOrganizerOrAdmin } = require('../middleware/authMiddleware');

// 🎯 Problem Statement Management
router.post('/hackathons/:hackathonId/problem-statements', protect, isOrganizerOrAdmin, judgeManagementController.addProblemStatements);

// 🎯 Judge Assignment Management
router.post('/hackathons/:hackathonId/assign-judges', protect, isOrganizerOrAdmin, judgeManagementController.assignJudges);
router.get('/hackathons/:hackathonId/judge-assignments', protect, isOrganizerOrAdmin, judgeManagementController.getJudgeAssignments);
router.put('/judge-assignments/:assignmentId', protect, isOrganizerOrAdmin, judgeManagementController.updateJudgeAssignment);
router.delete('/judge-assignments/:assignmentId', protect, isOrganizerOrAdmin, judgeManagementController.removeJudgeAssignment);

// 🗑️ Delete Judge and All Their Assignments
router.delete('/hackathons/:hackathonId/judges/:judgeId', protect, isOrganizerOrAdmin, judgeManagementController.deleteJudge);

// Assign teams to a judge assignment
router.post('/judge-assignments/:assignmentId/assign-teams', protect, isOrganizerOrAdmin, judgeManagementController.assignTeamsToJudge);

// Assign rounds to a judge assignment
router.post('/judge-assignments/:assignmentId/assign-rounds', protect, isOrganizerOrAdmin, judgeManagementController.assignRoundsToJudge);
// Assign problem statements to a judge assignment
router.post('/judge-assignments/:assignmentId/assign-problem-statements', protect, isOrganizerOrAdmin, judgeManagementController.assignProblemStatementsToJudge);

// Set assignment mode for a round or problem statement
router.post('/hackathons/:hackathonId/:type/:index/assignment-mode', protect, isOrganizerOrAdmin, judgeManagementController.setAssignmentMode);

// Auto-distribute teams among judges
router.post('/hackathons/:hackathonId/:type/:index/auto-distribute', protect, isOrganizerOrAdmin, judgeManagementController.autoDistributeTeams);

// 🎯 Bulk Assign Submissions to Evaluators
router.post('/hackathons/:hackathonId/bulk-assign-submissions', protect, isOrganizerOrAdmin, judgeManagementController.bulkAssignSubmissionsToEvaluators);

// 🎯 Get All Evaluators with Status
router.get('/hackathons/:hackathonId/evaluators', protect, isOrganizerOrAdmin, judgeManagementController.getAllEvaluators);

// 🎯 Update Judge Status (Accept/Decline)
router.patch('/judge-assignments/:assignmentId/status', protect, judgeManagementController.updateJudgeStatus);

// 🎯 Get My Assigned Submissions (for judges)
router.get('/my-assignments', protect, judgeManagementController.getMyAssignedSubmissions);

// 🎯 Score a Submission (for judges)
router.post('/submissions/:submissionId/score', protect, judgeManagementController.scoreSubmission);

// 🎯 Update Submission Status (Shortlist/Reject)
router.patch('/submissions/:submissionId/status', protect, isOrganizerOrAdmin, judgeManagementController.updateSubmissionStatus);

// 🎯 Judging Criteria Management
router.get('/hackathons/:hackathonId/rounds/:roundIndex/judging-criteria', protect, judgeManagementController.getJudgingCriteria);
router.put('/hackathons/:hackathonId/rounds/:roundIndex/judging-criteria', protect, isOrganizerOrAdmin, judgeManagementController.updateJudgingCriteria);

// 🎯 Judge Availability and Permissions
router.get('/hackathons/:hackathonId/problem-statements/:problemStatementId/available-judges', protect, isOrganizerOrAdmin, judgeManagementController.getAvailableJudgesForProblemStatement);

// 🎯 Get Available Judges for Hackathon
router.get('/hackathons/:hackathonId/available-judges', protect, isOrganizerOrAdmin, judgeManagementController.getAvailableJudges);

// 🎯 Invite Judge to Hackathon
router.post('/hackathons/:hackathonId/invite-judge', protect, isOrganizerOrAdmin, judgeManagementController.inviteJudge);

// 🎯 Judge Assignment Details
router.get('/judge-assignments/:assignmentId', protect, judgeManagementController.getJudgeAssignmentDetails);

// 🎯 Judge Invitation Responses
router.post('/judge-assignments/:assignmentId/respond', protect, judgeManagementController.respondToInvitation);

// 🎯 Judge Dashboard
router.get('/judge/dashboard', protect, judgeManagementController.getJudgeDashboard);

module.exports = router; 