import { motion } from 'framer-motion';
import ProfileAvatar from './ProfileAvatar';

function ProfileCard({ profile, onEdit, onChangePicture }) {
  const {
    name,
    role,
    email,
    department,
    address,
    contactNumber,
    dateOfBirth,
    gender,
    bio,
    joinDate,
    profileImage,
  } = profile;

  const completion = [name, email, role, department, address, contactNumber, bio].filter(
    Boolean
  ).length;
  const completionPercent = Math.round((completion / 7) * 100);

  return (
    <motion.section
      className="profile-page-grid"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <article className="profile-hero-card">
        <div className="profile-hero-card__left">
          <ProfileAvatar
            name={name}
            src={profileImage}
            size={120}
            className="profile-avatar--large"
            onClick={onChangePicture}
            title="Change Profile Picture"
          />
          <div className="profile-hero-card__meta">
            <h2>{name}</h2>
            <p>{role}</p>
            <span>{email}</span>
            <small>{department}</small>
          </div>
        </div>
        <button type="button" className="button button--primary" onClick={onEdit}>
          Edit Profile
        </button>
      </article>

      <article className="content-card">
        <p className="section-label">Details</p>
        <div className="profile-details-grid">
          <div>
            <strong>House Address</strong>
            <p>{address || 'Not added'}</p>
          </div>
          <div>
            <strong>Contact Number</strong>
            <p>{contactNumber || 'Not added'}</p>
          </div>
          <div>
            <strong>Date of Birth</strong>
            <p>{dateOfBirth || 'Not added'}</p>
          </div>
          <div>
            <strong>Gender</strong>
            <p>{gender || 'Not added'}</p>
          </div>
        </div>
      </article>

      <article className="content-card">
        <p className="section-label">About</p>
        <p>{bio || 'Add a short bio to complete your profile.'}</p>
        <p>Join Date: {joinDate}</p>
        <div className="profile-completion">
          <span>Profile Completion</span>
          <strong>{completionPercent}%</strong>
        </div>
      </article>
    </motion.section>
  );
}

export default ProfileCard;
