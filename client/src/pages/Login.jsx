import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      console.log("Login Response:", data);

      if (!data.token) {
        console.error("Invalid login response: No token provided", data);
        alert("Login failed: No token provided by server.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else if (data.role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      alert("Login Failed: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Add this function to handle navigation to the register page
  const handleSignUpClick = () => {
    navigate("/register");
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', height: '100vh', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', p: 4, borderRadius: 2 }}>
        <Box 
          component="form" 
          onSubmit={handleLogin} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3 
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight="500" color="primary">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please enter your credentials to login
            </Typography>
          </Box>

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
              "Sign In"
            )}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Typography 
                component="span" 
                color="primary" 
                onClick={handleSignUpClick} // Add onClick handler
                sx={{ 
                  cursor: 'pointer', 
                  fontWeight: 'medium',
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Sign Up
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;