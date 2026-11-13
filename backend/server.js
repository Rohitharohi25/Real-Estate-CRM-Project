require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const leadRoutes = require('./routes/leadRoutes');
const dealRoutes = require('./routes/dealRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const planRoutes = require('./routes/planRoutes');
const accountRoutes = require('./routes/accountRoutes');
const companyRoutes = require('./routes/companyRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io for real-time notifications.
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
});

io.on('connection', (socket) => {
  // Each client joins a room keyed by their userId so we can target notifications.
  socket.on('join', (userId) => {
    if (userId) socket.join(userId);
  });
});

app.set('io', io); // controllers can access via req.app.get('io').to(userId).emit(...)

// --- Security middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(mongoSanitize()); // strips $ and . from request data to prevent NoSQL injection
app.use(xss()); // sanitizes user input from malicious HTML/JS
app.use('/api', apiLimiter);

// --- Core middleware ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// --- Static file serving for uploaded avatars/attachments ---
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ success: true, message: 'ProCRM API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/companies', companyRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ProCRM API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Surface unhandled rejections instead of crashing silently.
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = { app, server, io };
