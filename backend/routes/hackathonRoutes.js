const express = require('express');
const router = express.Router();

const {
  createHackathon,
  getAllHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  updateApprovalStatus,
  getAllHackathonsRaw,
  getMyHackathons,
  sendCertificates,
  promoteHackathon // ✅ Import the new controller function
} = require('../controllers/hackathonController');


const {
  protect,
  isOrganizerOrAdmin,
  isAdmin
} = require('../middleware/authMiddleware');

// --- Core Hackathon Routes ---

// 🛡️ Create, Update, Delete (Organizer or Admin required)
router.post('/', protect, isOrganizerOrAdmin, createHackathon);
router.put('/:id', protect, isOrganizerOrAdmin, updateHackathon);
router.delete('/:id', protect, isOrganizerOrAdmin, deleteHackathon);

// ✨ Promote a Hackathon (Organizer or Admin required)
router.post('/:id/promote', protect, isOrganizerOrAdmin, promoteHackathon);

// --- Admin Routes ---

// 审批 (Approval)
router.patch('/:id/approval', protect, isAdmin, updateApprovalStatus);
router.get('/all', protect, isAdmin, getAllHackathonsRaw);

// 📊 Admin Dashboard Analytics
router.get('/admin/stats', protect, isAdmin, require('../controllers/hackathonController').getHackathonStats);
router.get('/admin/monthly-stats', protect, isAdmin, require('../controllers/hackathonController').getMonthlyHackathonStats);
router.get('/admin/category-breakdown', protect, isAdmin, require('../controllers/hackathonController').getCategoryBreakdown);
router.get('/admin/status-breakdown', protect, isAdmin, require('../controllers/hackathonController').getHackathonStatusBreakdown);


// --- Organizer-Specific Routes ---

// 📂 Get hackathons created by the logged-in organizer
router.get('/my', protect, getMyHackathons);

// 🏅 Mark round advancement
router.patch('/:id/round-advancement', protect, isOrganizerOrAdmin, require('../controllers/hackathonController').markRoundAdvancement);

// ✉️ Send certificates to participants
router.post('/:hackathonId/send-certificates', protect, isOrganizerOrAdmin, sendCertificates);


// --- Public Routes ---

// 🌐 Get all approved hackathons and a single hackathon by ID
router.get('/', getAllHackathons);
router.get('/:id', protect, getHackathonById);


module.exports = router;