import { useState, useEffect } from "react";
import { Card, CardContent, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import axios from "axios";

const FeedbackList = ({ cateringServiceId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [filterByRating, setFilterByRating] = useState("all");

  useEffect(() => {
    if (!cateringServiceId) return; // 🚨 Prevent API call if ID is missing
  
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/feedback/${cateringServiceId}`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFeedbacks();
  }, [cateringServiceId, sortBy, filterByRating]);

  // Sort feedback based on user selection
  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (sortBy === "latest") return new Date(b.date) - new Date(a.date);
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    return 0;
  });

  // Filter feedback based on rating selection
  const filteredFeedbacks = filterByRating === "all" 
    ? sortedFeedbacks 
    : sortedFeedbacks.filter(feedback => feedback.rating === parseInt(filterByRating));

  if (loading) return <CircularProgress />;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Customer Reviews</Typography>

        {/* Sorting & Filtering Controls */}
        <FormControl sx={{ mr: 2, minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="latest">Latest Reviews</MenuItem>
            <MenuItem value="highest">Highest Rating</MenuItem>
            <MenuItem value="lowest">Lowest Rating</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter By Rating</InputLabel>
          <Select value={filterByRating} onChange={(e) => setFilterByRating(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="5">5 ⭐</MenuItem>
            <MenuItem value="4">4 ⭐</MenuItem>
            <MenuItem value="3">3 ⭐</MenuItem>
            <MenuItem value="2">2 ⭐</MenuItem>
            <MenuItem value="1">1 ⭐</MenuItem>
          </Select>
        </FormControl>

        {/* Display Filtered & Sorted Feedback */}
        {filteredFeedbacks.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No feedback available.</Typography>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <Card key={feedback._id} sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1"><strong>{feedback.user.name}</strong></Typography>
                <Typography variant="body2">⭐ {feedback.rating} / 5</Typography>
                <Typography variant="body1">{feedback.comment}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackList;
