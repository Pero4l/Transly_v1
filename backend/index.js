require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require("cors");
const socketConfig = require('./config/socket');
const db = require("./config/db");
const { User, DriverProfile, Shipment, Setting, Notification, Conversation, Message } = require('./models');

const app = express();
const server = http.createServer(app);
socketConfig.init(server);

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
}));
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipment');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');
const chatRoutes = require('./routes/chat');

app.use('/auth', authRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/admin', adminRoutes);
app.use('/notifications', notificationRoutes);
app.use('/chat', chatRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Transly API",
  }); 
});

// DB CONNECTION & Server Start
const PORT = process.env.PORT || 5000;

db.sync({ alter: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Database connected successfully and Server running on PORT:${PORT}`);
    });
  })
  .catch((e) => {
    console.error(`Database connection failed:`, e);
  });