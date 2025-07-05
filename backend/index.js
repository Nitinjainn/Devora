require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const MongoStore = require("connect-mongo");
const socketHandler = require("./config/socket");

// Passport strategies
require("./config/passport");

// Routes
const cloudinaryUploadRoutes = require("./routes/cloudinaryUploadRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");

const app = express();

// ✅ CORS setup
app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true,
}));

// ✅ JSON + URL encoded parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware (MongoDB session store)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax", // secure if same origin
    secure: false,   // set to true in production (with HTTPS)
  },
}));

// ✅ Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// ✅ API Routes
app.use("/api/hackathons", require("./routes/hackathonRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/team-invites", require("./routes/teamInviteRoutes"));
app.use("/api/submissions", require("./routes/submissionHistoryRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/scores", require("./routes/scoreRoutes"));
app.use("/api/badges", require("./routes/badgeRoutes"));
app.use("/api/chatrooms", require("./routes/chatRoomRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/uploads", cloudinaryUploadRoutes);
app.use("/api/registration", require("./routes/hackathonRegistrationRoutes"));
app.use("/api/organizations", require("./routes/organizationRoutes"));
app.use("/api/articles", require("./routes/articleRoutes")); // ✅ includes like route
app.use("/api/newsletter", newsletterRoutes);
app.use('/api/submission-form',require("./routes/submissionFormRoutes"));

// ✅ User routes (including 2FA) - mount 2FA first to avoid conflicts
app.use('/api/users/2fa', require('./routes/2fa'));
app.use("/api/users", require("./routes/userRoutes"));

// ✅ Server + Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

socketHandler(io); // WebSocket logic

// ✅ MongoDB + Start server
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("✅ MongoDB connected");
    
    // Remove unique index on {name, hackathon} in teams collection if it exists
    try {
      const indexes = await mongoose.connection.db.collection('teams').indexes();
      const hasUniqueTeamNameIndex = indexes.some(
        idx => idx.name === 'name_1_hackathon_1' && idx.unique
      );
      if (hasUniqueTeamNameIndex) {
        console.log('🔄 Dropping unique index on {name, hackathon} in teams collection...');
        await mongoose.connection.db.collection('teams').dropIndex('name_1_hackathon_1');
        console.log('✅ Unique index dropped successfully.');
      } else {
        console.log('ℹ️  No unique index on {name, hackathon} found in teams collection.');
      }
    } catch (err) {
      console.error('⚠️  Error checking/dropping index:', err.message);
    }
    
    server.listen(PORT, () => {
      console.log(`🚀 Server + Socket.IO running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
