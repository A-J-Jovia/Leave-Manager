function ProfileAvatar({
  name = 'User',
  src = '',
  size = 44,
  className = '',
  onClick,
  title,
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  if (onClick) {
    return (
      <button
        type="button"
        className={`profile-avatar ${className}`.trim()}
        style={avatarStyle}
        onClick={onClick}
        title={title}
        aria-label={title || 'Profile avatar'}
      >
        {src ? (
          <img src={src} alt={name} className="profile-avatar__img" />
        ) : (
          <span className="profile-avatar__initials">{initials}</span>
        )}
      </button>
    );
  }

  return (
    <span
      className={`profile-avatar ${className}`.trim()}
      style={avatarStyle}
      title={title}
      aria-label={title || 'Profile avatar'}
      role="img"
    >
      {src ? (
        <img src={src} alt={name} className="profile-avatar__img" />
      ) : (
        <span className="profile-avatar__initials">{initials}</span>
      )}
    </span>
  );
}

export default ProfileAvatar;
