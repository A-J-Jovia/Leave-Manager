import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const initialUsers = [
  { id: 1, name: 'Dr. Priya Nair', role: 'Principal', email: 'principal@college.edu' },
  { id: 2, name: 'Prof. Arjun Rao', role: 'HOD', email: 'hod.cs@college.edu' },
  { id: 3, name: 'Prof. Simran Kaur', role: 'Professor', email: 'simran@college.edu' },
];

const nextRoleByCreator = {
  Principal: 'HOD',
  HOD: 'Professor',
  Professor: 'Student',
};

function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const currentRole = localStorage.getItem('role') || '';
  const allowedRole = nextRoleByCreator[currentRole] || '';

  const canAddUser = Boolean(allowedRole);
  let helperText = 'You do not have permission to add users.';
  if (currentRole === 'Principal') helperText = 'Principal can add HOD.';
  if (currentRole === 'HOD') helperText = 'HOD can add Professors.';
  if (currentRole === 'Professor') helperText = 'Professor can add Students.';

  const handleAddUser = (event) => {
    event.preventDefault();
    if (!canAddUser || !name.trim() || !email.trim()) return;

    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        role: allowedRole,
      },
    ]);
    setName('');
    setEmail('');
  };

  return (
    <MainLayout>
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="section-label">User Management</p>
            <h1>Manage college users</h1>
          </div>
        </div>

        <form className="content-card form-grid" onSubmit={handleAddUser}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!canAddUser}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!canAddUser}
            />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={allowedRole || ''} disabled>
              <option value={allowedRole || ''}>{allowedRole || 'Not Allowed'}</option>
            </select>
          </label>
          <div className="field">
            <span>Access Rule</span>
            <input type="text" value={helperText} readOnly />
          </div>
          <button type="submit" className="button button--primary" disabled={!canAddUser}>
            Add User
          </button>
        </form>

        <div className="table-card">
          <div className="table-card__header">
            <div>
              <p className="section-label">Users</p>
              <h3>User list</h3>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Users;
