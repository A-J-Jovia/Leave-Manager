import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const approvedLeaves = [
  {
    id: 1,
    leaveType: 'Medical Leave',
    fromDate: '2026-03-12',
    toDate: '2026-03-14',
    status: 'Approved',
  },
  {
    id: 2,
    leaveType: 'Academic Leave',
    fromDate: '2026-03-22',
    toDate: '2026-03-23',
    status: 'Approved',
  },
];

function PostLeave() {
  const [selectedLeaveId, setSelectedLeaveId] = useState(String(approvedLeaves[0].id));
  const [returnDate, setReturnDate] = useState('');
  const [report, setReport] = useState('');

  const selectedLeave = approvedLeaves.find((leave) => String(leave.id) === selectedLeaveId);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <MainLayout>
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="section-label">Post Leave</p>
            <h1>Post Leave Update</h1>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card__header">
            <div>
              <p className="section-label">Approved Leave</p>
              <h3>Approved requests</h3>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th scope="col">Leave Type</th>
                  <th scope="col">From Date</th>
                  <th scope="col">To Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.leaveType}</td>
                    <td>{leave.fromDate}</td>
                    <td>{leave.toDate}</td>
                    <td>
                      <span className="status-pill status-pill--approved">{leave.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form className="content-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Select Approved Leave</span>
            <select
              value={selectedLeaveId}
              onChange={(event) => setSelectedLeaveId(event.target.value)}
            >
              {approvedLeaves.map((leave) => (
                <option key={leave.id} value={leave.id}>
                  {leave.leaveType} ({leave.fromDate} to {leave.toDate})
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Return Date</span>
            <input
              type="date"
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Optional Report</span>
            <textarea
              rows="4"
              placeholder="Add any optional post-leave report"
              value={report}
              onChange={(event) => setReport(event.target.value)}
            />
          </label>

          {selectedLeave ? (
            <p>
              Selected: {selectedLeave.leaveType} ({selectedLeave.fromDate} to {selectedLeave.toDate})
            </p>
          ) : null}

          <button type="submit" className="button button--primary">
            Submit Post Leave
          </button>
        </form>
      </section>
    </MainLayout>
  );
}

export default PostLeave;
