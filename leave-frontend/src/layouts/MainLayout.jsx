import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './layout.css';

function MainLayout({ children }) {
  const storedName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    localStorage.getItem('displayName');
  const displayName = storedName || 'User';

  return (
    <div className="lms-layout">
      <Sidebar />
      <div className="lms-layout__main">
        <Navbar />
        <main className="lms-layout__content">
          <section className="lms-welcome-card" aria-label="Welcome">
            <p>Welcome</p>
            <h2>{displayName}</h2>
          </section>
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
