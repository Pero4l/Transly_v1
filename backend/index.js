require('dotenv').config();
const express = require('express');
const http = require('http');
const compression = require('compression');
const helmet = require('helmet');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redisClient = require('./config/redis');
const socketConfig = require('./config/socket');
const db = require("./config/db");

const app = express();
const server = http.createServer(app);

// OVERRIDE: Prevent 502 Bad Gateway drops on Render (AWS proxies expect >60s idle keep-alives)
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

socketConfig.init(server);

// Ensure proxy support for Render HTTPS
app.set('trust proxy', 1);

// Session configuration for Redis-based state management
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'transly_secret_key_2026',
  resave: true, // Force session to be saved back to the session store
  rolling: true, // Force a session identifier cookie to be set on every response
  cookie: {
    secure: true, 
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'none'
  },
  proxy: true,
  saveUninitialized: false 
}));


// Middleware
app.use(helmet()); 
app.use(compression()); // Native GZIP payload compression for faster speeds
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET || 'transly_secret_key_2026'));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin or is a Vercel subdomain
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      origin.includes('localhost:');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
const paymentRoutes = require('./routes/payment');

app.use('/auth', authRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/admin', adminRoutes);
app.use('/notifications', notificationRoutes);
app.use('/chat', chatRoutes);
app.use('/payment', paymentRoutes);

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