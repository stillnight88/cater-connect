// import React, { useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { TextField, Button, Rating, Box, Typography } from "@mui/material";

// const Feedback = () => {
//   const { cateringServiceId } = useParams(); // Get service ID from URL
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));
//       if (!user) {
//         setMessage("You must be logged in to submit feedback.");
//         return;
//       }
      
//       const response = await axios.post(
//         "http://localhost:5000/api/feedback",
//         { cateringServiceId, rating, comment },
//         { headers: { Authorization: `Bearer ${user.token}` } }
//       );
//       setMessage("Feedback submitted successfully!");
//       setRating(0);
//       setComment("");
//     } catch (error) {
//       setMessage(error.response?.data?.message || "Failed to submit feedback");
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
//       <Typography variant="h5" gutterBottom>
//         Submit Feedback
//       </Typography>
//       {message && <Typography color="error">{message}</Typography>}
//       <form onSubmit={handleSubmit}>
//         <Rating
//           name="rating"
//           value={rating}
//           onChange={(event, newValue) => setRating(newValue)}
//         />
//         <TextField
//           label="Comment"
//           fullWidth
//           multiline
//           rows={4}
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//           margin="normal"
//         />
//         <Button type="submit" variant="contained" color="primary" fullWidth>
//           Submit Feedback
//         </Button>
//       </form>
//     </Box>
//   );
// };

// export default Feedback;
