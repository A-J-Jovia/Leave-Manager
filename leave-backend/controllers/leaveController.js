const db = require('../config/db');

const dbPromise = db.promise();

const NEXT_APPROVER = {
  Student: 'Professor',
  Professor: 'HOD',
  HOD: 'Principal',
};

const applyLeave = async (req, res) => {
  try {
    const { reason, from_date, to_date } = req.body;
    const { id: userId, role } = req.user || {};

    if (!userId || !role) {
      return res.status(401).json({ message: 'Unauthorized. User context missing.' });
    }

    if (!reason || !from_date || !to_date) {
      return res.status(400).json({ message: 'Reason, from_date, and to_date are required.' });
    }

    if (to_date <= from_date) {
      return res.status(400).json({ message: 'to_date must be greater than from_date.' });
    }

    const approverRole = NEXT_APPROVER[role];
    if (!approverRole) {
      return res.status(403).json({ message: 'This role is not allowed to apply leave.' });
    }

    const [result] = await dbPromise.query(
      `INSERT INTO leaves (user_id, reason, from_date, to_date, status, approver_role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, reason.trim(), from_date, to_date, 'Pending', approverRole]
    );

    return res.status(201).json({
      message: `Leave applied successfully. Pending with ${approverRole}.`,
      leave: {
        id: result.insertId,
        user_id: userId,
        reason: reason.trim(),
        from_date,
        to_date,
        status: 'Pending',
        approver_role: approverRole,
      },
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getLeaves = async (req, res) => {
  try {
    const { role } = req.user || {};

    if (!role) {
      return res.status(401).json({ message: 'Unauthorized. User context missing.' });
    }

    let query = `
      SELECT
        l.id,
        l.user_id,
        u.name,
        u.email,
        u.role AS applicant_role,
        l.reason,
        l.from_date,
        l.to_date,
        l.status,
        l.approver_role,
        l.created_at
      FROM leaves l
      INNER JOIN users u ON u.id = l.user_id
    `;
    let params = [];

    if (role === 'Professor') {
      query += ' WHERE u.role = ?';
      params = ['Student'];
    } else if (role === 'HOD') {
      query += ' WHERE u.role = ?';
      params = ['Professor'];
    } else if (role !== 'Principal') {
      return res.status(403).json({ message: 'Forbidden. Access denied for this role.' });
    }

    query += ' ORDER BY l.created_at DESC';

    const [rows] = await dbPromise.query(query, params);
    return res.status(200).json({ leaves: rows });
  } catch (error) {
    console.error('Get leaves error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const leaveId = req.params.leaveId || req.params.id;
    const { status } = req.body;
    const { role } = req.user || {};

    if (!role) {
      return res.status(401).json({ message: 'Unauthorized. User context missing.' });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
    }

    const [leaves] = await dbPromise.query('SELECT * FROM leaves WHERE id = ?', [leaveId]);
    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const leave = leaves[0];

    if (leave.approver_role !== role) {
      return res.status(403).json({ message: 'Forbidden. Only assigned approver can update status.' });
    }

    const [result] = await dbPromise.query('UPDATE leaves SET status = ? WHERE id = ?', [
      status,
      leaveId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Unable to update leave status.' });
    }

    return res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully.`,
      leave: {
        id: Number(leaveId),
        status,
      },
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
