import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { NEXT_APPROVER, ROLES } from '../constants/roles';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

const [, HOD, PROFESSOR, STUDENT] = ROLES;

function ApplyLeave() {
  const applicantRole = localStorage.getItem('role') || '';
  const approverRole = NEXT_APPROVER[applicantRole] || '';
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [noOfDays, setNoOfDays] = useState(1);
  const [reason, setReason] = useState('');
  const [onDate, setOnDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status] = useState('Pending');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitted(false);

    const singleDay = noOfDays === 1;
    const startDate = singleDay ? onDate : fromDate;

    if (!reason.trim() || !startDate) {
      const message = singleDay
        ? 'Please fill reason and select on date.'
        : 'Please fill reason and from date.';
      setError(message);
      toast.error(message);
      return;
    }

    if (!approverRole) {
      const message = `Leave apply is available for ${STUDENT}, ${PROFESSOR}, and ${HOD} roles.`;
      setError(message);
      toast.error(message);
      return;
    }

    if (noOfDays > 1) {
      if (!toDate) {
        const message = 'Please select to date for multi-day leave.';
        setError(message);
        toast.error(message);
        return;
      }

      if (toDate <= startDate) {
        const message = 'To Date must be greater than From Date.';
        setError(message);
        toast.error(message);
        return;
      }
    }

    try {
      const response = await api.post('/leaves', {
        reason: reason.trim(),
        from_date: startDate,
        to_date: noOfDays > 1 ? toDate : startDate,
      });
      console.log('Apply leave API response:', response.data);

      setError('');
      setIsSubmitted(true);
      setLeaveType('Sick Leave');
      setNoOfDays(1);
      setReason('');
      setOnDate('');
      setFromDate('');
      setToDate('');
      toast.success(`Leave request submitted. Pending with ${approverRole}`);
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message || 'Unable to submit leave request.';
      setError(message);
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
            <p className="section-label">Student Leave</p>
            <h1>Apply Leave</h1>
          </div>
        </div>

        <motion.form
          className="content-card"
          onSubmit={handleSubmit}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          <label className="field">
            <span>Leave Type</span>
            <select value={leaveType} onChange={(event) => setLeaveType(event.target.value)}>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Academic Leave">Academic Leave</option>
            </select>
          </label>
          <label className="field">
            <span>No. of Days</span>
            <input
              type="number"
              min="1"
              value={noOfDays}
              onChange={(event) => {
                const days = Math.max(1, Number(event.target.value) || 1);
                setNoOfDays(days);
                setError('');
                if (days === 1) {
                  setFromDate('');
                  setToDate('');
                } else {
                  setOnDate('');
                }
              }}
            />
          </label>
          <label className="field">
            <span>Reason</span>
            <textarea
              rows="4"
              placeholder="Enter leave reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          {noOfDays === 1 ? (
            <label className="field">
              <span>On</span>
              <input
                type="date"
                value={onDate}
                onChange={(event) => setOnDate(event.target.value)}
              />
            </label>
          ) : (
            <label className="field">
              <span>From Date</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>
          )}
          {noOfDays > 1 ? (
            <label className="field">
              <span>To Date</span>
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
          ) : null}
          <label className="field">
            <span>Status</span>
            <input type="text" value={status} readOnly />
          </label>
          <label className="field">
            <span>Next Approver</span>
            <input type="text" value={approverRole || 'N/A'} readOnly />
          </label>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {isSubmitted ? (
            <p className="form-message form-message--success">
              Leave request submitted with status: Pending with {approverRole}
            </p>
          ) : null}
          <motion.button
            type="submit"
            className="button button--primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Submit Leave Request
          </motion.button>
        </motion.form>
      </motion.section>
    </MainLayout>
  );
}

export default ApplyLeave;
