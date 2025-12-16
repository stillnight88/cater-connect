import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar
} from "@mui/material";
import { 
  Email, 
  Lock, 
  Person, 
  Phone, 
  Store, 
  CloudUpload,
  Visibility, 
  VisibilityOff 
} from "@mui/icons-material";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cateringService, setCateringService] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const isManagerRegistration = location.pathname === "/register-manager";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phoneNumber", phoneNumber);
      if (isManagerRegistration) {
        formData.append("cateringService", cateringService);
      }
      if (image) {
        formData.append("image", image);
      }

      const endpoint = isManagerRegistration 
        ? "http://localhost:5000/api/auth/register-manager" 
        : "http://localhost:5000/api/auth/register";

      const { data } = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Auto-login after registration
      localStorage.setItem("user", JSON.stringify(data));
      alert("Registration successful! You are now logged in.");
      if (data.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Registration Failed", error.response?.data?.message || error.message);
      alert("Registration failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', py: 4 }}>
      <Paper elevation={3} sx={{ width: '100%', p: 4, borderRadius: 2 }}>
        <Box 
          component="form" 
          onSubmit={handleRegister} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2.5 
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="500" color="primary">
              {isManagerRegistration ? "Manager Registration" : "Create Account"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please fill in the details to register
            </Typography>
          </Box>

          {/* Profile Image Upload */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
            <Avatar
              src={imagePreview}
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 2,
                border: '1px solid #e0e0e0'
              }}
            />
            <input
              accept="image/*"
              type="file"
              id="image-upload"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload">
              <Button 
                variant="outlined" 
                component="span"
                startIcon={<CloudUpload />}
                sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Upload Profile Photo
              </Button>
            </label>
          </Box>

          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="action" />
                </InputAdornment>
              ),
            }}
          />

        

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            disabled={isLoading}
            sx={{ 
              mt: 2, 
              py: 1.5,
              textTransform: 'none',
              borderRadius: 1.5,
              position: 'relative'
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" sx={{ position: 'absolute' }} />
            ) : (
              "Create Account"
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Typography 
                component="span" 
                color="primary" 
                onClick={() => navigate("/login")}
                sx={{ 
                  cursor: 'pointer', 
                  fontWeight: 'medium',
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Sign In
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;