import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Rating, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  CircularProgress, 
  Alert, 
  Button,
  Avatar,
  Chip,
  Container,
  Paper,
  useTheme,
  Grid
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CommentIcon from "@mui/icons-material/Comment";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const ViewFeedback = () => {
  const { cateringServiceId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceName, setServiceName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user || !user.token) {
      setError("Please log in to view feedback");
      setLoading(false);
      return;
    }

    // Check if cateringServiceId is valid
    if (!cateringServiceId || cateringServiceId === "undefined" || cateringServiceId === "" || cateringServiceId === ":cateringServiceId") {
      const storedId = localStorage.getItem("currentCateringServiceId");
      if (storedId) {
        navigate(`/feedback/${storedId}`, { replace: true });
        return;
      }
      setError("Please select a valid catering service. Navigate from a specific service page.");
      setLoading(false);
      return;
    }

    localStorage.setItem("currentCateringServiceId", cateringServiceId);

    const fetchData = async () => {
      try {
        const authHeader = { Authorization: `Bearer ${user.token}` };
        
        const serviceResponse = await axios.get(
          `http://localhost:5000/api/catering-services/${cateringServiceId}`,
          { headers: authHeader }
        );
        
        if (serviceResponse.data && serviceResponse.data.name) {
          setServiceName(serviceResponse.data.name);
        }
        
        const feedbackResponse = await axios.get(
          `http://localhost:5000/api/feedback/${cateringServiceId}`,
          { headers: authHeader }
        );
        
        setFeedbacks(feedbackResponse.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401) {
          setError("You are not authorized to view this information");
        } else if (error.response?.status === 404) {
          setError("Catering service not found");
        } else {
          setError(error.response?.data?.message || "Failed to load feedback");
        }
        
        setLoading(false);
      }
    };

    fetchData();
  }, [cateringServiceId, navigate]);

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  const handleGoBack = () => {
    navigate(`/manager/catering-services`);
  };

  // Get random pastel color for avatar
  const getAvatarColor = (name) => {
    const colors = [
      '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9',
      '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9'
    ];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === "Anonymous User") return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 1,
          bgcolor: "#fff"
        }}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 500,
            }}
          >
            {serviceName ? `${serviceName}` : "Service Feedback"}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            size="small"
          >
            Back
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        ) : (
          <>
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: "#f8f9fa",
              borderRadius: 1,
              border: "1px solid #e0e0e0"
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Average Rating:
                    </Typography>
                    <Rating 
                      value={parseFloat(calculateAverageRating())} 
                      precision={0.1} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
                      {calculateAverageRating()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                    <CommentIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {feedbacks.length === 0 ? (
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: "#f8f9fa",
                  borderRadius: 1,
                  textAlign: "center",
                  border: "1px solid #e0e0e0"
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No feedback available for this service yet.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {feedbacks.map((feedback, index) => (
                  <Card 
                    key={feedback._id || index} 
                    sx={{ 
                      mb: 0,
                      border: "1px solid #e0e0e0",
                      boxShadow: "none",
                      borderRadius: 1
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            flexWrap: "wrap",
                            mb: 1
                          }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: getAvatarColor(feedback.user?.name),
                                  mr: 1,
                                  width: 32,
                                  height: 32
                                }}
                              >
                                {getInitials(feedback.user?.name)}
                              </Avatar>
                              <Typography variant="subtitle2">
                                {feedback.user?.name || "Anonymous User"}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(feedback.createdAt)}
                              </Typography>
                              <Rating 
                                value={feedback.rating || 0} 
                                readOnly 
                                size="small"
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                          <Box sx={{ pt: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: feedback.comment ? "text.primary" : "text.secondary",
                                fontStyle: feedback.comment ? 'normal' : 'italic'
                              }}
                            >
                              {feedback.comment || "No comment provided."}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ViewFeedback;