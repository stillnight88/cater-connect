import { Container, Typography } from "@mui/material";

const Unauthorized = () => {
  return (
    <Container style={{ textAlign: "center", marginTop: 50 }}>
      <Typography variant="h4" color="error">Access Denied!</Typography>
      <Typography variant="body1">You do not have permission to view this page.</Typography>
    </Container>
  );
};

export default Unauthorized;
