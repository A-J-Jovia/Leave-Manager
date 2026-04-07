import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import LeaveTable from '../components/LeaveTable';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

const normalizeLeave = (leave) => ({
  id: leave.id,
  studentName: leave.studentName || leave.name || 'User',
  leaveType: leave.leaveType || 'Leave',
  fromDate: leave.fromDate || leave.from_date || '',
  toDate: leave.toDate || leave.to_date || '',
  status: leave.status || 'Pending',
  approverRole: leave.approverRole || leave.approver_role || '',
});

function Dashboard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/leaves');
        console.log('Dashboard leaves API response:', response.data);
        const rows = Array.isArray(response?.data?.leaves) ? response.data.leaves : [];
        setLeaves(rows.map(normalizeLeave));
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Failed to load dashboard data.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const total = leaves.length;
  const pending = leaves.filter((leave) => leave.status === 'Pending').length;
  const approved = leaves.filter((leave) => leave.status === 'Approved').length;
  const rejected = leaves.filter((leave) => leave.status === 'Rejected').length;

  const stats = useMemo(
    () => [
      { label: 'Total', value: total },
      { label: 'Pending', value: pending },
      { label: 'Approved', value: approved },
      { label: 'Rejected', value: rejected },
    ],
    [total, pending, approved, rejected]
  );

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
            <p className="section-label">Dashboard</p>
            <h1>Leave overview</h1>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((item) => (
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
        {loading ? <p>Loading dashboard data...</p> : null}
        {error ? <p className="form-message form-message--error">{error}</p> : null}

        <LeaveTable
          leaves={leaves}
          emptyMessage={loading ? 'Loading leave requests...' : 'No leave requests found'}
        />
      </motion.section>
    </MainLayout>
  );
}

export default Dashboard;
