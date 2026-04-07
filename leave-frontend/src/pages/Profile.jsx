import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import EditProfileModal from '../components/EditProfileModal';
import ProfileCard from '../components/ProfileCard';
import MainLayout from '../layouts/MainLayout';

const sanitizeProfileForStorage = (profile) => {
  const { profileImage: _profileImage, ...rest } = profile;
  return rest;
};

const readStoredProfile = () => {
  try {
    const raw = localStorage.getItem('profileData');
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_error) {
    return false;
  }
};

function Profile() {
  const role = localStorage.getItem('role') || 'Student';
  const email = localStorage.getItem('currentUserEmail') || 'user@college.edu';
  const profileImage = localStorage.getItem('profileImage') || '';
  const initialProfile = {
    name: localStorage.getItem('userName') || 'College User',
    role,
    email,
    department: 'Computer Science',
    address: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    joinDate: '2026-01-10',
    profileImage,
  };

  const storedProfile = readStoredProfile();
  const [profile, setProfile] = useState({
    ...initialProfile,
    ...(storedProfile || {}),
    profileImage,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const legacyProfile = readStoredProfile();
    if (legacyProfile?.profileImage && !localStorage.getItem('profileImage')) {
      safeSetStorage('profileImage', legacyProfile.profileImage);
      safeSetStorage(
        'profileData',
        JSON.stringify(sanitizeProfileForStorage({ ...legacyProfile, profileImage: '' }))
      );
    }

    if (localStorage.getItem('openProfileEdit') === '1') {
      setIsEditOpen(true);
      localStorage.removeItem('openProfileEdit');
    }

    if (localStorage.getItem('openProfileImagePicker') === '1') {
      localStorage.removeItem('openProfileImagePicker');
      setTimeout(() => {
        if (fileInputRef.current) fileInputRef.current.click();
      }, 0);
    }
  }, []);

  const handleEditOpen = () => {
    setFormData(profile);
    setIsEditOpen(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEditSave = (event) => {
    event.preventDefault();
    const nextProfile = { ...profile, ...formData };
    setProfile(nextProfile);
    safeSetStorage('profileData', JSON.stringify(sanitizeProfileForStorage(nextProfile)));
    safeSetStorage('userName', nextProfile.name);
    setIsEditOpen(false);
    toast.success('Profile updated successfully.');
  };

  const handleImagePick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rawImage = String(reader.result || '');
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 320;
        const maxStorageChars = 180000;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const compressedImage = canvas.toDataURL('image/jpeg', 0.72);
        const nextProfile = { ...profile, profileImage: compressedImage };
        setProfile(nextProfile);
        setImageError('');

        if (compressedImage.length > maxStorageChars) {
          const message = 'Image is too large for browser storage. Please upload a smaller image.';
          setImageError(message);
          toast.error(message);
          return;
        }

        const savedImage = safeSetStorage('profileImage', compressedImage);
        const savedProfile = safeSetStorage(
          'profileData',
          JSON.stringify(sanitizeProfileForStorage(nextProfile))
        );

        if (!savedImage || !savedProfile) {
          localStorage.removeItem('profileImage');
          const message = 'Image is too large for browser storage. Please upload a smaller image.';
          setImageError(message);
          toast.error(message);
          return;
        }

        toast.success('Profile picture updated.');
      };
      image.src = rawImage;
    };
    reader.readAsDataURL(file);
  };

  return (
    <MainLayout>
      <section className="page-section">
        <div className="page-heading">
          <div>
            <p className="section-label">Profile</p>
            <h1>My Profile</h1>
          </div>
        </div>

        <ProfileCard
          profile={profile}
          onEdit={handleEditOpen}
          onChangePicture={handleImagePick}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="profile-file-input"
          onChange={handleImageChange}
        />

        {imageError ? <p className="form-message form-message--error">{imageError}</p> : null}

        <EditProfileModal
          isOpen={isEditOpen}
          formData={formData}
          onChange={handleEditChange}
          onSave={handleEditSave}
          onCancel={() => setIsEditOpen(false)}
        />
      </section>
    </MainLayout>
  );
}

export default Profile;
