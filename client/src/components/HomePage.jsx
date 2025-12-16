// import React from "react";
// import { Container, Typography, Box, Button } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const HomePage = () => {
//   const navigate = useNavigate();

//   return (
//     <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
//       <Box sx={{ py: 4 }}>
//         <Typography variant="h2" component="h1" gutterBottom color="primary">
//           Welcome to CaterConnect
//         </Typography>
//         <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
//           Connecting you with the best catering services for every occasion.
//         </Typography>
//         <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
//           <Button
//             variant="contained"
//             size="large"
//             onClick={() => navigate("/login")}
//             sx={{ px: 4, py: 1.5 }}
//           >
//             Sign In
//           </Button>
//           <Button
//             variant="outlined"
//             size="large"
//             onClick={() => navigate("/register")}
//             sx={{ px: 4, py: 1.5 }}
//           >
//             Sign Up
//           </Button>
//         </Box>
//       </Box>
//     </Container>
//   );
// };

// export default HomePage;