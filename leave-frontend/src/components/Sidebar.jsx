import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const roleNavigation = {
  Principal: [
    { label: 'Manage Leaves', to: '/manage' },
    { label: 'Approvals', to: '/approval' },
  ],
  HOD: [
    { label: 'Apply Leave', to: '/apply' },
    { label: 'Manage Leaves', to: '/manage' },
  ],
  Professor: [
    { label: 'Apply Leave', to: '/apply' },
    { label: 'Manage Leaves', to: '/manage' },
    { label: 'Approvals', to: '/approval' },
    { label: 'Student Management', to: '/students' },
  ],
  Student: [{ label: 'Apply Leave', to: '/apply' }],
};

function Sidebar() {
  const role = localStorage.getItem('role') || '';
  const navigationItems = [
    { label: 'Dashboard', to: '/dashboard' },
    ...(roleNavigation[role] || []),
  ];

  return (
    <motion.aside
      className="lms-sidebar"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="lms-sidebar__brand">Leave System</div>
      <nav className="lms-sidebar__nav" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'lms-sidebar__link lms-sidebar__link--active'
                : 'lms-sidebar__link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}

export default Sidebar;
