import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Grid } from "@mui/material";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubscribe = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await axios.post(
        `http://13.215.228.42:4001/api/add_email`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        alert("Subscription successful!");
        setEmail(""); // Clear the input after success
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1a2940",
        color: "white",
        py: 4,
        px: 2,
      }}
    >
      <Grid
        container
        spacing={3}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" component="h3" gutterBottom>
            AI Agents Hub
          </Typography>
          <Typography variant="body1" color="gray">
            Enter the world of collected list of 100+ AI agents.
          </Typography>
        </Grid>

        {/* Right Section */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Enter Your Email"
            variant="outlined"
            sx={{
              bgcolor: "white",
              borderRadius: 1,
            }}
            value={email}
            onChange={handleEmailChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubscribe}
            sx={{ whiteSpace: "nowrap" }}
          >
            Subscribe
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
