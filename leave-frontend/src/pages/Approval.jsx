import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

function Approval() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentRole = localStorage.getItem('role') || '';

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/pending-users');
        console.log('Approval pending users API response:', response.data);
        const rows = Array.isArray(response?.data?.users) ? response.data.users : [];
        setRequests(rows.map((row) => ({ ...row, status: 'Pending' })));
      } catch (apiError) {
        const message =
          apiError?.response?.data?.message || 'Failed to load pending approvals.';
        toast.error(message);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const visibleRequests = useMemo(() => {
    if (currentRole === 'Principal') {
      return requests.filter(
        (request) => ['HOD', 'Professor'].includes(request.role) && request.status === 'Pending'
      );
    }

    if (currentRole === 'HOD') {
      return requests.filter(
        (request) => request.role === 'Professor' && request.status === 'Pending'
      );
    }

    if (currentRole === 'Professor') {
      return requests.filter((request) => request.role === 'Student' && request.status === 'Pending');
    }

    return [];
  }, [currentRole, requests]);

  const handleAction = async (requestId, nextStatus) => {
    try {
      await api.put(`/auth/approval/${requestId}`, { status: nextStatus });
      setRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== requestId)
      );
      toast.success(`Request ${nextStatus.toLowerCase()} successfully.`);
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message || `Failed to ${nextStatus.toLowerCase()} request.`;
      toast.error(message);
    }
  };

  const title =
    currentRole === 'Principal'
      ? 'Pending HOD / Professor Requests'
      : currentRole === 'HOD'
        ? 'Pending Professor Requests'
        : currentRole === 'Professor'
          ? 'Pending Student Requests'
        : 'Approvals';

  return (
    <MainLayout>
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="section-label">Approvals</p>
            <h1>{title}</h1>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card__header">
            <div>
              <p className="section-label">Pending Users</p>
              <h3>Approval requests</h3>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && visibleRequests.length > 0 ? (
                  visibleRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.name}</td>
                      <td>{request.role}</td>
                      <td>
                        <span className={`status-pill status-pill--${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <div className="leave-actions-card__controls">
                          <button
                            type="button"
                            className="button"
                            onClick={() => handleAction(request.id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="button"
                            onClick={() => handleAction(request.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !loading ? (
                  <tr>
                    <td colSpan="4" className="leave-table__empty">
                      No pending requests available for your role.
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="4" className="leave-table__empty">
                      Loading pending requests...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Approval;
