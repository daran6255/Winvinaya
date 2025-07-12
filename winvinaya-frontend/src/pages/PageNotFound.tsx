// src/pages/PageNotFound.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        height: "auto",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          maxHeight: "100%",
          overflow: "auto",
          p: { xs: 2, sm: 4 },
        }}
      >
        <ErrorOutlineIcon
          sx={{ fontSize: { xs: 80, sm: 120 }, color: "primary.main", mb: 2 }}
        />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          color="text.primary"
          sx={{ fontSize: { xs: "2rem", sm: "3rem" } }}
        >
          404 - Page Not Found
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          mb={4}
          sx={{ fontSize: { xs: "0.95rem", sm: "1.1rem" } }}
        >
          The page you are looking for does not exist or you don’t have
          permission to view it.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleGoHome}
        >
          Go Home
        </Button>
      </Box>
    </Box>
  );
};

export default PageNotFound;
