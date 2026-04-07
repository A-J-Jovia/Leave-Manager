const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');

const router = express.Router();

router.post('/', authMiddleware, allowRoles('Student', 'Professor', 'HOD'), applyLeave);
router.get('/', authMiddleware, allowRoles('Professor', 'HOD', 'Principal'), getLeaves);
router.put('/:id', authMiddleware, allowRoles('Professor', 'HOD', 'Principal'), updateLeaveStatus);

module.exports = router;

