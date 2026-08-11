import React from "react";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { Container, Typography, TextField, Button } from "@mui/material";
// import dotenv from "dotenv";
// dotenv.config();

// const BACKEND_URL = 'http://localhost:3000';

const App = () => {
  const socket = useMemo(() => io("http://localhost:3000"), []);

  const [message, setMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", message);
    setMessage("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });
    socket.on("welcome", (message) => {
      console.log("Message from server", message);
    });
  }, [socket]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h1" component="div" gutterBottom>
        Chatbot
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="outlined-basic"
          label="Outlined"
          variant="outlined"
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </form>
    </Container>
  );
};

export default App;
