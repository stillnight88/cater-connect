import React, { useState, useEffect } from "react";
import { 
  Box, Container, Typography, Rating, Grid, Card, CardContent, 
  TextField, Button, Avatar, LinearProgress, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  CircularProgress, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { styled } from "@mui/system";
import { FaCheckCircle } from "react-icons/fa";
import axios from "axios";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  transition: 'box-shadow 0.2s',
  "&:hover": {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  padding: theme.spacing(2),
  background: '#fff'
}));

const FeedbackForm = ({ cateringServiceId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filterByRating, setFilterByRating] = useState("all");
  const [formData, setFormData] = useState({ rating: 0, comment: "" });
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    if (!cateringServiceId) return;
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/feedback/${cateringServiceId}`);
        setFeedbacks(response.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load reviews",
          severity: "error"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [cateringServiceId]);

  const calculateStats = () => {
    if (feedbacks.length === 0) return { average: 0, counts: [0, 0, 0, 0, 0] };
    const average = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / feedbacks.length;
    const counts = [5, 4, 3, 2, 1].map(rating => 
      feedbacks.filter(feedback => feedback.rating === rating).length
    );
    return { average, counts };
  };

  const stats = calculateStats();

  const getSortedAndFilteredFeedbacks = () => {
    const sorted = [...feedbacks].sort((a, b) => {
      if (sortBy === "latest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });
    return filterByRating === "all" 
      ? sorted 
      : sorted.filter(feedback => feedback.rating === parseInt(filterByRating));
  };

  const filteredFeedbacks = getSortedAndFilteredFeedbacks();

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rating || !formData.comment) {
      setSnackbar({
        open: true,
        message: "Rating and comment required",
        severity: "error"
      });
      return;
    }
    setOpenDialog(true);
  };

  const handleConfirmSubmission = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("Login required");
      
      await axios.post(
        "http://localhost:5000/api/feedback",
        { cateringServiceId, ...formData },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const response = await axios.get(`http://localhost:5000/api/feedback/${cateringServiceId}`);
      setFeedbacks(response.data);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: "Review submitted!",
        severity: "success"
      });
      setFormData({ rating: 0, comment: "" });
    } catch (error) {
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: error.message || "Submission failed",
        severity: "error"
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ fontWeight: 600, color: '#333', mb: 4 }}
      >
        Customer Reviews
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Rating Summary */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} textAlign="center">
                <Typography variant="h2" sx={{ fontWeight: 600, color: '#333' }}>
                  {stats.average.toFixed(1)}
                </Typography>
                <Rating value={stats.average} precision={0.1} readOnly size="large" />
                <Typography color="text.secondary">
                  {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {[5, 4, 3, 2, 1].map((rating, index) => {
                  const count = stats.counts[index];
                  const percentage = feedbacks.length ? (count / feedbacks.length) * 100 : 0;
                  return (
                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ minWidth: 40 }}>{rating} ★</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ flex: 1, mx: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography sx={{ minWidth: 40 }}>{percentage.toFixed(0)}%</Typography>
                    </Box>
                  );
                })}
              </Grid>
            </Grid>
          </Box>

          {/* Reviews and Form */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                  Reviews ({filteredFeedbacks.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small">
                    <InputLabel>Sort</InputLabel>
                    <Select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="latest">Latest</MenuItem>
                      <MenuItem value="highest">Highest</MenuItem>
                      <MenuItem value="lowest">Lowest</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Rating</InputLabel>
                    <Select 
                      value={filterByRating} 
                      onChange={(e) => setFilterByRating(e.target.value)}
                      sx={{ minWidth: 100 }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      {[5, 4, 3, 2, 1].map(r => (
                        <MenuItem key={r} value={r}>{r} ★</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {filteredFeedbacks.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No reviews found
                </Typography>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <StyledCard key={feedback._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2 }}>
                          {feedback.user?.name?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {feedback.user?.name || "Anonymous"}
                          </Typography>
                          <Rating value={feedback.rating} readOnly size="small" />
                        </Box>
                        {feedback.verified && (
                          <Chip
                            icon={<FaCheckCircle />}
                            label="Verified"
                            color="primary"
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ mb: 1 }}>{feedback.comment}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(feedback.date).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                ))
              )}
            </Grid>

            {/* Submit Review Form */}
            <Grid item xs={12} md={4}>
              <FormCard>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                    Write a Review
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Rating
                      value={formData.rating}
                      onChange={(e, value) => handleInputChange("rating", value)}
                      size="large"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Your Review"
                      multiline
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => handleInputChange("comment", e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ 
                        py: 1,
                        textTransform: 'none',
                        backgroundColor: '#1976d2',
                        '&:hover': { backgroundColor: '#1565c0' }
                      }}
                    >
                      Submit
                    </Button>
                  </form>
                </CardContent>
              </FormCard>
            </Grid>
          </Grid>
        </>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Review</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit this review?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmission} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FeedbackForm;