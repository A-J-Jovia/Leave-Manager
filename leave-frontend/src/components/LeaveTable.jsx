import { motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';

const tableColumns = ['Student', 'Leave Type', 'From Date', 'To Date', 'Status', 'Flow'];
const statusSteps = ['Pending', 'Approved', 'Rejected'];

function LeaveTable({
  leaves = [],
  sectionLabel = 'Recent Requests',
  title = 'Leave requests',
  emptyMessage = 'No leave requests found',
}) {
  const getStepClassName = (currentStatus, step) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    const stepIndex = statusSteps.indexOf(step);
    return stepIndex <= currentIndex ? 'status-step status-step--active' : 'status-step';
  };

  return (
    <motion.div
      className="table-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ scale: 1.003 }}
    >
      <div className="table-card__header">
        <div>
          <p className="section-label">{sectionLabel}</p>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="leave-table">
          <thead>
            <tr>
              {tableColumns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => {
                const statusLabel =
                  leave.status === 'Pending' && leave.approverRole
                    ? `Pending with ${leave.approverRole}`
                    : leave.status;

                return (
                  <tr key={leave.id}>
                    <td>{leave.studentName}</td>
                    <td>{leave.leaveType}</td>
                    <td>{leave.fromDate || leave.startDate}</td>
                    <td>{leave.toDate || leave.endDate}</td>
                    <td>
                      <span
                        className={`status-pill status-pill--${leave.status.toLowerCase()}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className="status-flow" aria-label={`Status flow ${leave.status}`}>
                        {statusSteps.map((step) => (
                          <span key={`${leave.id}-${step}`} className={getStepClassName(leave.status, step)}>
                            {step}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={tableColumns.length} className="leave-table__empty">
                  <div className="empty-state empty-state--table">
                    <FiInbox className="empty-state__icon" aria-hidden="true" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default LeaveTable;
