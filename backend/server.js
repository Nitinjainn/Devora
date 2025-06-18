require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");
const mongoose = require("mongoose");
const app = express();

// Import route files
const hackathonRoutes = require('./routes/hackathonRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const teamInviteRoutes = require('./routes/teamInviteRoutes');
const submissionHistoryRoutes = require('./routes/submissionHistoryRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoomRoutes = require('./routes/chatRoomRoutes');          // ✅ NEW
const messageRoutes = require('./routes/messageRoutes');            // ✅ NEW

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Mount API routes
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-invites', teamInviteRoutes);
app.use('/api/submissions', submissionHistoryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatrooms', chatRoomRoutes);     // ✅ NEW
app.use('/api/messages', messageRoutes);       // ✅ NEW

// MongoDB URI and port
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URL;

// Connect DB first, then start server
mongoose.connect(uri)
  .then(() => {
    console.log("✅ DB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
  });
