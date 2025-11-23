import { useState, useRef, useEffect } from "react";
import { User, Camera, Lock, Upload, X, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUserRoleDisplay } from "../utils/helper";
import { request } from "../utils/request";
import api from "../utils/api";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.photo || null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  // Update profileImage when user changes
  useEffect(() => {
    const photoUrl = user?.photo_url || user?.profile?.image_url || null;
    setProfileImage(photoUrl);
  }, [user]);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      name: user?.name || user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user, resetProfile]);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm();

  const password = watch("password");

  const onSubmitProfile = async (data) => {
    setIsLoading(true);
    setSuccessMessage("");
    setUploadError("");



    try {
      const response = await request.put('/profile', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address
      });

      if (response.success) {
        // Create updated user object
        const updatedUser = {
          ...user,
          ...data,
          full_name: data.name
        };

        // If response includes full user object, use it
        if (response.data) {
          Object.assign(updatedUser, response.data);
          if (response.data.profile) {
            updatedUser.profile = {
              ...updatedUser.profile,
              ...response.data.profile
            };
          }
        }

        updateUser(updatedUser);
        setSuccessMessage("Profile updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setUploadError(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setUploadError(error.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setIsLoading(true);
    setSuccessMessage("");
    setUploadError("");

    try {
      const response = await request.put('/profile/password', {
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation
      });

      if (response.success) {
        resetPassword();
        setSuccessMessage("Password updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setUploadError(response.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      setUploadError(error.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setUploadError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!fileInputRef.current?.files[0]) return;

    setIsLoading(true);
    setUploadError("");
    setSuccessMessage("");

    try {
      // Temporary: Simulate photo upload with preview image
      // Update profile image immediately with the preview
      if (imagePreview) {
        // Update local profile image state
        setProfileImage(imagePreview);

        // Update user context with new photo URL
        const updatedUser = {
          ...user,
          photo_url: imagePreview,
          image_url: imagePreview,
          profile: {
            ...user.profile,
            image_url: imagePreview
          }
        };

        // Update user in context (this will update sidebar/header automatically)
        updateUser(updatedUser);

        setSuccessMessage("Photo updated successfully! (Demo mode - changes are temporary)");
        setImagePreview(null);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setUploadError("Please select a photo first");
      }
      return;

      // Original code (commented out until API is ready)
      /*
      const formData = new FormData();
      formData.append('photo', fileInputRef.current.files[0]);

      const response = await api.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Create updated user object with photo URL
        const updatedUser = {
          ...user,
          photo_url: response.data.photo_url,
          profile: {
            ...user.profile,
            image: response.data.user?.profile?.image || null,
            image_url: response.data.photo_url
          }
        };
        
        // If response includes full user object, use it
        if (response.data.user) {
          Object.assign(updatedUser, response.data.user);
          if (response.data.user.profile) {
            updatedUser.profile = {
              ...updatedUser.profile,
              ...response.data.user.profile,
              image_url: response.data.photo_url
            };
          }
        }
        
        updateUser(updatedUser);
        setProfileImage(response.data.photo_url);
        setImagePreview(null);
        setSuccessMessage("Photo uploaded successfully!");

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setUploadError(response.data.message || "Failed to upload photo");
      }
      */
    } catch (error) {
      console.error("Photo upload error:", error);
      setUploadError("Photo upload feature is not yet implemented on the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setImagePreview(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return;

    setIsLoading(true);
    setUploadError("");
    setSuccessMessage("");

    try {
      // Temporary: Simulate photo removal
      // Update local profile image state
      setProfileImage(null);

      // Update user context to remove photo
      const updatedUser = {
        ...user,
        photo_url: null,
        image_url: null,
        profile: {
          ...user.profile,
          image_url: null
        }
      };

      // Update user in context (this will update sidebar/header automatically)
      updateUser(updatedUser);

      setSuccessMessage("Photo removed successfully! (Demo mode - changes are temporary)");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;

      // Original code (commented out until API is ready)
      /*
      const response = await api.delete('/profile/photo');

      if (response.data.success) {
        // Create updated user object without photo
        const updatedUser = {
          ...user,
          photo_url: null,
          profile: {
            ...user.profile,
            image: null,
            image_url: null
          }
        };
        
        // If response includes full user object, use it
        if (response.data.user) {
          Object.assign(updatedUser, response.data.user);
          if (response.data.user.profile) {
            updatedUser.profile = {
              ...updatedUser.profile,
              ...response.data.user.profile
            };
          }
        }
        
        updateUser(updatedUser);
        setProfileImage(null);
        setSuccessMessage("Photo removed successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setUploadError(response.data.message || "Failed to remove photo");
      }
      */
    } catch (error) {
      console.error("Photo removal error:", error);
      setUploadError("Photo removal feature is not yet implemented on the backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "profile"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "password"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-800">{uploadError}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profileImage || user?.photo_url || user?.profile?.image_url ? (
                      <img
                        src={profileImage || user?.photo_url || user?.profile?.image_url}
                        alt={user?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-primary-600 flex items-center justify-center ${imagePreview || profileImage || user?.photo_url || user?.profile?.image_url ? "hidden" : ""
                        }`}
                    >
                      <User className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="absolute -top-2 -right-2">
                      <button
                        onClick={handleCancelUpload}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {user?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getUserRoleDisplay(user?.type)}
                  </p>

                  {imagePreview ? (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={handleUploadPhoto}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelUpload}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={handlePhotoClick}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </button>

                      {(profileImage || user?.photo_url || user?.profile?.image_url) && (
                        <button
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 rounded-md text-sm hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </button>
                      )}
                    </div>
                  )}


                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <form
                onSubmit={handleSubmitProfile(onSubmitProfile)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      {...registerProfile("name", {
                        required: "Name is required",
                      })}
                      type="text"
                      className="input"
                    />
                    {profileErrors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      {...registerProfile("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      className="input"
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      {...registerProfile("phone")}
                      type="tel"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <input
                      value={getUserRoleDisplay(user?.type)}
                      type="text"
                      className="input bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    {...registerProfile("address")}
                    rows={3}
                    className="input"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="max-w-md">
              <div className="mb-6">
                <Lock className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Change Password
                </h3>
                <p className="text-sm text-gray-500">
                  Ensure your account is using a long, random password to stay
                  secure.
                </p>
              </div>

              <form
                onSubmit={handleSubmitPassword(onSubmitPassword)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    {...registerPassword("current_password", {
                      required: "Current password is required",
                    })}
                    type="password"
                    className="input"
                  />
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    {...registerPassword("password", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type="password"
                    className="input"
                  />
                  {passwordErrors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    {...registerPassword("password_confirmation", {
                      required: "Please confirm your new password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    type="password"
                    className="input"
                  />
                  {passwordErrors.password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
