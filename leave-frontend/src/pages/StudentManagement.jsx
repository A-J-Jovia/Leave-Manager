import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const initialStudents = [
  { id: 1, name: 'Ananya Sharma', email: 'ananya@college.edu' },
  { id: 2, name: 'Ritvik Rao', email: 'ritvik@college.edu' },
];

function StudentManagement() {
  const role = localStorage.getItem('role') || '';
  const [students, setStudents] = useState(initialStudents);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleAddStudent = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }

    setStudents((currentStudents) => [
      ...currentStudents,
      {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
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
            <p className="section-label">Student Management</p>
            <h1>Manage students</h1>
          </div>
        </div>

        {role !== 'Professor' ? (
          <div className="content-card">
            <p>Only Professor role can access this page.</p>
          </div>
        ) : (
          <>
            <form className="content-card form-grid" onSubmit={handleAddStudent}>
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Enter student name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  placeholder="Enter student email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <button type="submit" className="button button--primary">
                Add Student
              </button>
            </form>

            <div className="table-card">
              <div className="table-card__header">
                <div>
                  <p className="section-label">Students</p>
                  <h3>Student list</h3>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}

export default StudentManagement;
