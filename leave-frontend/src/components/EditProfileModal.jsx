function EditProfileModal({ isOpen, formData, onChange, onSave, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true">
      <div className="profile-modal">
        <h3>Edit Profile</h3>
        <form className="profile-modal__form" onSubmit={onSave}>
          <label className="field">
            <span>Name</span>
            <input name="name" value={formData.name} onChange={onChange} />
          </label>
          <label className="field">
            <span>Address</span>
            <input name="address" value={formData.address} onChange={onChange} />
          </label>
          <label className="field">
            <span>Contact Number</span>
            <input
              name="contactNumber"
              value={formData.contactNumber}
              onChange={onChange}
            />
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea name="bio" rows="4" value={formData.bio} onChange={onChange} />
          </label>
          <div className="profile-modal__actions">
            <button type="button" className="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="button button--primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
