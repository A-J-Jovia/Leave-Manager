import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiBellOff, FiChevronDown, FiEdit2, FiImage, FiLogOut, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';
import api from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userName = localStorage.getItem('userName') || 'User';
  const profileImage = localStorage.getItem('profileImage') || '';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/leaves');
        const rows = Array.isArray(response?.data?.leaves) ? response.data.leaves : [];
        console.log('Navbar notifications API response:', response.data);
        const mapped = rows.slice(0, 5).map((leave) => {
          const name = leave.name || leave.studentName || 'User';
          const status = leave.status || 'Pending';
          return {
            id: leave.id,
            message:
              status === 'Pending'
                ? `${name}'s leave is pending`
                : `${name}'s leave was ${String(status).toLowerCase()}`,
          };
        });
        setNotifications(mapped);
      } catch (_error) {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('profileData');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('openProfileEdit');
    localStorage.removeItem('openProfileImagePicker');
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate('/', { replace: true });
  };

  const handleViewProfile = () => {
    setIsProfileOpen(false);
    navigate('/profile');
  };

  const handleEditProfile = () => {
    localStorage.setItem('openProfileEdit', '1');
    setIsProfileOpen(false);
    navigate('/profile');
  };

  const handleChangePicture = () => {
    localStorage.setItem('openProfileImagePicker', '1');
    setIsProfileOpen(false);
    navigate('/profile');
  };

  return (
    <header className="lms-navbar">
      <h1 className="lms-navbar__title">Leave Management System</h1>
      <div className="lms-navbar__actions">
        <div className="lms-navbar__notify">
          <motion.button
            type="button"
            className="lms-navbar__bell"
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Notifications"
            aria-expanded={isOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiBell className="lms-navbar__bell-icon" />
            <span className="lms-navbar__bell-count">{notifications.length}</span>
          </motion.button>
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                className="lms-navbar__dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <p className="lms-navbar__dropdown-title">Notifications</p>
                {notifications.length > 0 ? (
                  <ul className="lms-navbar__dropdown-list">
                    {notifications.map((item) => (
                      <li key={item.id}>{item.message}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state empty-state--dropdown">
                    <FiBellOff className="empty-state__icon" aria-hidden="true" />
                    <p>No notifications</p>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <div className="lms-navbar__profile">
          <motion.button
            type="button"
            className="lms-navbar__profile-trigger"
            onClick={() => setIsProfileOpen((current) => !current)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ProfileAvatar name={userName} src={profileImage} size={34} className="profile-avatar--sm" />
            <span>{userName}</span>
            <FiChevronDown />
          </motion.button>

          <AnimatePresence>
            {isProfileOpen ? (
              <motion.div
                className="lms-navbar__profile-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <button type="button" onClick={handleViewProfile}>
                  <FiUser /> View Profile
                </button>
                <button type="button" onClick={handleEditProfile}>
                  <FiEdit2 /> Edit Profile
                </button>
                <button type="button" onClick={handleChangePicture}>
                  <FiImage /> Change Profile Picture
                </button>
                <button type="button" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
