import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  Avatar,
  Stack,
  Grid,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Restaurant as RestaurantIcon,
  Feedback as FeedbackIcon,
  Person as PersonIcon
} from "@mui/icons-material";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user.token;

      if (!token) {
        setError("Please log in to view feedback");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedbacks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching feedbacks:", error.response?.data?.message);
      setError(error.response?.data?.message || "Failed to load feedback");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user.token;

      if (!token) {
        setError("Please log in to delete feedback");
        return;
      }

      await axios.delete(`http://localhost:5000/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
    } catch (error) {
      console.error("Error deleting feedback:", error.response?.data?.message);
      setError(error.response?.data?.message || "Failed to delete feedback");
    }
  };

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "success.main";
    if (rating >= 3) return "warning.main";
    return "error.main";
  };

  const getInitial = (name) => {
    return name && typeof name === 'string' ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <Box sx={{ 
      py: 4, 
      px: { xs: 2, sm: 3, md: 4 },
      maxWidth: '100%',
      bgcolor: theme.palette.background.default
    }}>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          maxWidth: 1200,
          mx: 'auto'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FeedbackIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="600">
              Feedback Dashboard
            </Typography>
          </Box>
          <Tooltip title="Refresh feedbacks">
            <IconButton 
              color="inherit" 
              onClick={fetchFeedbacks} 
              disabled={loading}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  transform: 'rotate(180deg)',
                  transition: 'transform 0.5s'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : (
            <>
              {/* Rating summary */}
              <Card 
                elevation={0} 
                sx={{ 
                  mb: 4, 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} md={3}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 3,
                          height: '100%',
                          bgcolor: theme.palette.background.paper,
                          borderRadius: 2,
                          boxShadow: 2
                        }}
                      >
                        <Typography variant="overline" color="text.secondary">
                          Average Rating
                        </Typography>
                        <Typography 
                          variant="h2" 
                          fontWeight="bold" 
                          color={getRatingColor(parseFloat(calculateAverageRating()))}
                          sx={{ my: 1 }}
                        >
                          {calculateAverageRating()}
                        </Typography>
                        <Box 
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            p: 0.75,
                            px: 1.5,
                            borderRadius: 10,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                          }}
                        >
                          <CommentIcon fontSize="small" />
                          <Typography variant="body2" fontWeight="medium">
                            {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={8} md={9}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1,
                          height: '100%',
                          justifyContent: 'center',
                          p: { xs: 1, sm: 2 }
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                          Rating Distribution
                        </Typography>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = feedbacks.filter(f => Math.round(f.rating) === star).length;
                          const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                          
                          return (
                            <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ minWidth: 16 }}>{star}</Typography>
                              <Box 
                                sx={{ 
                                  height: 10, 
                                  flexGrow: 1, 
                                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                  borderRadius: 10,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    width: `${percentage}%`, 
                                    height: '100%', 
                                    bgcolor: getRatingColor(star),
                                    transition: 'width 0.8s ease',
                                    borderRadius: 10
                                  }} 
                                />
                              </Box>
                              <Box sx={{ 
                                minWidth: 40, 
                                textAlign: 'right', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5 
                              }}>
                                <Typography variant="body2">{count}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ({percentage.toFixed(0)}%)
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ mb: 4 }} />

              {/* Feedback list */}
              {feedbacks.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                }}>
                  <CommentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Feedback Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer reviews will appear here once they're submitted.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {feedbacks.map((feedback) => (
                    <Grid item xs={12} key={feedback._id}>
                      <Card 
                        elevation={1} 
                        sx={{ 
                          borderRadius: 2,
                          position: 'relative',
                          overflow: 'visible',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: isMobile ? 0 : 16,
                            left: isMobile ? 0 : -8,
                            width: isMobile ? '100%' : 8,
                            height: isMobile ? 8 : 'calc(100% - 32px)',
                            backgroundColor: getRatingColor(feedback.rating || 0),
                            borderRadius: isMobile ? '8px 8px 0 0' : '4px 0 0 4px'
                          }
                        }}
                      >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Box sx={{ 
                            display: "flex", 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: "space-between", 
                            alignItems: isMobile ? "stretch" : "flex-start",
                            gap: 2
                          }}>
                            <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: theme.palette.primary.main, 
                                  width: 50, 
                                  height: 50,
                                  boxShadow: 2
                                }}
                              >
                                {getInitial(feedback.user?.name)}
                              </Avatar>
                              
                              <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {feedback.user?.name || "Anonymous User"}
                                </Typography>
                                
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 0.5,
                                    bgcolor: `${getRatingColor(feedback.rating || 0)}20`,
                                    color: getRatingColor(feedback.rating || 0),
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontWeight: 'medium'
                                  }}>
                                    <Typography variant="body2" fontWeight="bold">
                                      {feedback.rating || 0}
                                    </Typography>
                                    <Typography variant="caption">/ 5</Typography>
                                  </Box>
                                  
                                  <Chip 
                                    label={formatDate(feedback.createdAt)} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ 
                                      height: 24, 
                                      fontSize: '0.75rem',
                                      bgcolor: theme.palette.background.paper
                                    }}
                                    icon={<PersonIcon fontSize="small" />}
                                  />

                                  {feedback.cateringService?.name && (
                                    <Chip 
                                      icon={<RestaurantIcon fontSize="small" />}
                                      label={feedback.cateringService.name}
                                      size="small"
                                      sx={{ 
                                        height: 24, 
                                        fontSize: '0.75rem',
                                        bgcolor: theme.palette.background.paper
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            
                            <Tooltip title="Delete feedback">
                              <IconButton 
                                color="error" 
                                onClick={() => handleDelete(feedback._id)}
                                size="small"
                                sx={{ 
                                  alignSelf: isMobile ? 'flex-end' : 'center',
                                  bgcolor: 'error.lighter',
                                  '&:hover': {
                                    bgcolor: 'error.light'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Paper 
                            elevation={0} 
                            sx={{ 
                              mt: 3,
                              p: 2.5,
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                              borderRadius: 2,
                              borderLeft: `4px solid ${getRatingColor(feedback.rating || 0)}20`,
                              fontStyle: feedback.comment ? 'normal' : 'italic'
                            }}
                          >
                            <Typography variant="body1">
                              {feedback.comment || "No comment provided."}
                            </Typography>
                          </Paper>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminFeedback;