import { useEffect, useMemo, useState } from 'react';
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
  status: leave.status || 'Pending',
  approverRole: leave.approverRole || leave.approver_role || '',
});

function LeaveHistory() {
  const [historyLeaves, setHistoryLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/leaves');
        console.log('Leave history API response:', response.data);
        const rows = Array.isArray(response?.data?.leaves) ? response.data.leaves : [];
        setHistoryLeaves(rows.map(normalizeLeave));
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Failed to load leave history.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredLeaves = useMemo(() => {
    return historyLeaves.filter((leave) => {
      const matchesStatus = status === 'All' ? true : leave.status === status;
      const matchesFrom = fromDate ? leave.fromDate >= fromDate : true;
      const matchesTo = toDate ? leave.toDate <= toDate : true;
      return matchesStatus && matchesFrom && matchesTo;
    });
  }, [historyLeaves, status, fromDate, toDate]);

  return (
    <MainLayout>
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="section-label">History</p>
            <h1>Leave History</h1>
          </div>
        </div>

        <div className="content-card form-grid">
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </label>

          <label className="field">
            <span>From Date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </label>

          <label className="field">
            <span>To Date</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </label>
        </div>

        <LeaveTable
          leaves={filteredLeaves}
          sectionLabel="Past Requests"
          title="Leave history"
          emptyMessage={loading ? 'Loading leave history...' : 'No leave history found for selected filters.'}
        />
        {error ? <p className="form-message form-message--error">{error}</p> : null}
      </section>
    </MainLayout>
  );
}

export default LeaveHistory;
