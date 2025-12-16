import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  IconButton,
  InputAdornment,
  FormHelperText,
  LinearProgress,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  cursor: "pointer",
  transition: "opacity 0.3s",
  "&:hover": {
    opacity: 0.8,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: "32px auto",
  padding: "24px",
}));

const UserProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+1",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          setSnackbar({ open: true, message: "Please log in to view your profile", severity: "error" });
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const response = await axios.get("http://localhost:5000/api/auth/me", config);
        const userData = response.data;

        console.log("Fetched User Data:", userData); // Debug: Check the response

        setProfileData({
          fullName: userData.name || "",
          email: userData.email || "",
          phone: userData.phoneNumber || "",
          countryCode: "+1",
        });

        // Construct the full image URL if userData.image exists
        const imageUrl = userData.image
          ? `http://localhost:5000/${userData.image.replace(/\\/g, "/")}` // Adjust path based on backend
          : "https://images.unsplash.com/photo-1633332755192-727a05c4013d"; // Default fallback

        console.log("Setting avatarPreview to:", imageUrl); // Debug: Verify the URL
        setAvatarPreview(imageUrl);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbar({ open: true, message: "Error fetching user data", severity: "error" });
      }
    };

    fetchUserData();
  }, []);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: "File size must be less than 5MB" });
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setErrors({ ...errors, avatar: "Only JPG and PNG files are allowed" });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("New avatar preview:", reader.result); // Debug: Check the preview
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    return Object.values(requirements).every(Boolean);
  };

  const handlePasswordChange = (field) => (event) => {
    const value = event.target.value;
    setPasswords({ ...passwords, [field]: value });

    if (field === "new") {
      if (!validatePassword(value)) {
        setErrors({ ...errors, newPassword: "Password does not meet requirements" });
      } else {
        const newErrors = { ...errors };
        delete newErrors.newPassword;
        setErrors(newErrors);
      }
    }

    if (field === "confirm" && value !== passwords.new) {
      setErrors({ ...errors, confirmPassword: "Passwords do not match" });
    } else if (field === "confirm") {
      const newErrors = { ...errors };
      delete newErrors.confirmPassword;
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setSnackbar({ open: true, message: "Please log in to update your profile", severity: "error" });
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const formData = new FormData();
      formData.append("name", profileData.fullName);
      formData.append("email", profileData.email);
      formData.append("phoneNumber", profileData.countryCode + profileData.phone);
      if (passwords.new) formData.append("password", passwords.new);
      if (avatarFile) formData.append("image", avatarFile);

      const response = await axios.put("http://localhost:5000/api/auth/profile", formData, config);
      const updatedUser = response.data;

      // Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update avatarPreview with the new image URL if provided
      const newImageUrl = updatedUser.image
        ? `http://localhost:5000/${updatedUser.image.replace(/\\/g, "/")}`
        : avatarPreview;
      setAvatarPreview(newImageUrl);

      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
      setLoading(false);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Error updating profile", severity: "error" });
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = passwords.new;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 12) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*]/.test(password)) strength += 20;
    return strength;
  };

  return (
    <Box sx={{ padding: "24px" }}>
      <StyledCard elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Profile Settings
          </Typography>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <input
              accept="image/*"
              type="file"
              id="avatar-upload"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <label htmlFor="avatar-upload">
              <StyledAvatar src={avatarPreview} alt="Profile Picture" component="span" />
            </label>
            {errors.avatar && <FormHelperText error>{errors.avatar}</FormHelperText>}
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profileData.email}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Select
                      fullWidth
                      value={profileData.countryCode}
                      onChange={(e) => setProfileData({ ...profileData, countryCode: e.target.value })}
                    >
                      <MenuItem value="+1">+1</MenuItem>
                      <MenuItem value="+44">+44</MenuItem>
                      <MenuItem value="+91">+91</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPasswords.current ? "text" : "password"}
                  label="Current Password"
                  value={passwords.current}
                  onChange={handlePasswordChange("current")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        >
                          {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPasswords.new ? "text" : "password"}
                  label="New Password"
                  value={passwords.new}
                  onChange={handlePasswordChange("new")}
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <LinearProgress variant="determinate" value={getPasswordStrength()} sx={{ mt: 1 }} />
                <FormHelperText>Password strength: {getPasswordStrength()}%</FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type={showPasswords.confirm ? "text" : "password"}
                  label="Confirm New Password"
                  value={passwords.confirm}
                  onChange={handlePasswordChange("confirm")}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setProfileData({ fullName: "", email: "", phone: "", countryCode: "+1" });
                      setPasswords({ current: "", new: "", confirm: "" });
                      setErrors({});
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || Object.keys(errors).length > 0}
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </StyledCard>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;