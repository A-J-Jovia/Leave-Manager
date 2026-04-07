import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import LeaveTable from '../components/LeaveTable';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

const normalizeLeave = (leave) => ({
  id: leave.id,
  studentName: leave.studentName || leave.name || 'User',
  leaveType: leave.leaveType || 'Leave',
  fromDate: leave.fromDate || leave.from_date || '',
  toDate: leave.toDate || leave.to_date || '',
  reason: leave.reason || '',
  applicantRole: leave.applicantRole || leave.applicant_role || '',
  approverRole: leave.approverRole || leave.approver_role || '',
  status: leave.status || 'Pending',
});

function ManageLeaves() {
  const currentRole = localStorage.getItem('role') || '';
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaves = async ({ showErrorToast = true } = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/leaves');
      console.log('Manage leaves API response:', response.data);
      const rows = Array.isArray(response?.data?.leaves) ? response.data.leaves : [];
      setLeaves(rows.map(normalizeLeave));
      return true;
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Failed to load leave requests.';
      setError(message);
      if (showErrorToast) {
        toast.error(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleLeaves = useMemo(() => leaves, [leaves]);

  const statusSummary = useMemo(
    () =>
      visibleLeaves.reduce(
        (summary, leave) => {
          if (leave.status in summary) {
            summary[leave.status] += 1;
          }
          return summary;
        },
        { Pending: 0, Approved: 0, Rejected: 0 }
      ),
    [visibleLeaves]
  );

  const updateStatus = async (leaveId, nextStatus) => {
    try {
      await api.put(`/leaves/${leaveId}`, { status: nextStatus });

      const selectedLeave = leaves.find((leave) => leave.id === leaveId);
      await fetchLeaves({ showErrorToast: false });

      if (selectedLeave) {
        const action = nextStatus === 'Approved' ? 'approved' : 'rejected';
        toast.success(`${selectedLeave.studentName}'s leave ${action}.`);
      }
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Unable to update leave status.';
      toast.error(message);
    }
  };

  return (
    <MainLayout>
      <motion.section
        className="page-section"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="page-heading">
          <div>
            <p className="section-label">Leave Review</p>
            <h1>Manage leave requests</h1>
          </div>
        </div>

        <motion.div className="content-card" whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
          <p>
            {currentRole
              ? `Review leave requests pending with ${currentRole}.`
              : 'Select a role to view pending requests.'}
          </p>
          {loading ? <p>Loading leave requests...</p> : null}
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          <div className="stats-grid">
            {[
              { label: 'Pending', value: statusSummary.Pending },
              { label: 'Approved', value: statusSummary.Approved },
              { label: 'Rejected', value: statusSummary.Rejected },
            ].map((item) => (
              <motion.article
                key={item.label}
                className="stat-card"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </motion.article>
            ))}
          </div>
        </motion.div>

        <motion.div className="content-card" whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
          <p className="section-label">Status Actions</p>
          <div className="leave-actions-list">
            {visibleLeaves.map((leave) => (
              <motion.article
                key={leave.id}
                className="leave-actions-card"
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div>
                  <strong>{leave.studentName}</strong>
                  <p>
                    {leave.leaveType} | {leave.fromDate} to {leave.toDate}
                  </p>
                  <p>Reason: {leave.reason}</p>
                  <p>
                    Applicant Role: {leave.applicantRole} | Approver Role: {leave.approverRole}
                  </p>
                </div>
                <div className="leave-actions-card__controls">
                  <span className={`status-pill status-pill--${leave.status.toLowerCase()}`}>
                    {leave.status === 'Pending'
                      ? `Pending with ${leave.approverRole}`
                      : leave.status}
                  </span>
                  <motion.button
                    type="button"
                    className="button"
                    disabled={leave.status !== 'Pending'}
                    onClick={() => updateStatus(leave.id, 'Approved')}
                    whileHover={{ scale: leave.status !== 'Pending' ? 1 : 1.03 }}
                    whileTap={{ scale: leave.status !== 'Pending' ? 1 : 0.97 }}
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    type="button"
                    className="button"
                    disabled={leave.status !== 'Approved'}
                    onClick={() => updateStatus(leave.id, 'Rejected')}
                    whileHover={{ scale: leave.status !== 'Approved' ? 1 : 1.03 }}
                    whileTap={{ scale: leave.status !== 'Approved' ? 1 : 0.97 }}
                  >
                    Reject
                  </motion.button>
                </div>
              </motion.article>
            ))}
            {!loading && visibleLeaves.length === 0 ? (
              <p>No leave requests available for your approval level.</p>
            ) : null}
          </div>
        </motion.div>

        <LeaveTable
          leaves={visibleLeaves}
          emptyMessage={loading ? 'Loading leave requests...' : 'No leave requests found'}
        />
      </motion.section>
    </MainLayout>
  );
}

export default ManageLeaves;
