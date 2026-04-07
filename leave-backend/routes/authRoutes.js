const express = require('express');
const {
  register: registerUser,
  login: loginUser,
  getPendingUsers,
  updateUserApproval,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/pending-users', authMiddleware, allowRoles('Principal', 'HOD', 'Professor'), getPendingUsers);
router.put('/approval/:id', authMiddleware, allowRoles('Principal', 'HOD', 'Professor'), updateUserApproval);

module.exports = router;
