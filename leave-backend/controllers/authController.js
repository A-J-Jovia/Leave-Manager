const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const dbPromise = db.promise();

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    const allowedRoles = ['Principal', 'HOD', 'Professor', 'Student'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await dbPromise.query('SELECT id FROM users WHERE email = ?', [
      normalizedEmail,
    ]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isApproved = role === 'Principal';

    const [result] = await dbPromise.query(
      `INSERT INTO users (name, email, password, role, isApproved)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), normalizedEmail, hashedPassword, role, isApproved]
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role,
        isApproved,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await dbPromise.query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is not approved yet.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: Boolean(user.isApproved),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getPendingUsers = async (req, res) => {
  try {
    const requesterRole = req.user?.role;

    let targetRoles = [];
    if (requesterRole === 'Principal') {
      targetRoles = ['HOD', 'Professor'];
    } else if (requesterRole === 'HOD') {
      targetRoles = ['Professor'];
    } else if (requesterRole === 'Professor') {
      targetRoles = ['Student'];
    } else {
      return res.status(403).json({ message: 'Forbidden. Access denied for this role.' });
    }

    const [users] = await dbPromise.query(
      `SELECT id, name, email, role, isApproved
       FROM users
       WHERE role IN (?) AND isApproved = ?
       ORDER BY id DESC`,
      [targetRoles, false]
    );

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Get pending users error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateUserApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const requesterRole = req.user?.role;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
    }

    const [rows] = await dbPromise.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];
    const isPrincipalApprovingHODOrProfessor =
      requesterRole === 'Principal' && ['HOD', 'Professor'].includes(user.role);
    const isHODApprovingProfessor = requesterRole === 'HOD' && user.role === 'Professor';
    const isProfessorApprovingStudent = requesterRole === 'Professor' && user.role === 'Student';

    if (
      !isPrincipalApprovingHODOrProfessor &&
      !isHODApprovingProfessor &&
      !isProfessorApprovingStudent
    ) {
      return res.status(403).json({ message: 'Forbidden. Invalid approval hierarchy.' });
    }

    if (status === 'Approved') {
      await dbPromise.query('UPDATE users SET isApproved = ? WHERE id = ?', [true, id]);
    } else {
      await dbPromise.query('DELETE FROM users WHERE id = ? AND isApproved = ?', [id, false]);
    }

    return res.status(200).json({ message: `User ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error('Update approval error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  register,
  login,
  getPendingUsers,
  updateUserApproval,
};
