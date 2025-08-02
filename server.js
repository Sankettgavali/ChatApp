const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://chatapp1-vq5f.onrender.com", "http://localhost:3000"]
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://chatapp1-vq5f.onrender.com", "http://localhost:3000"]
    : "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  console.log('Serving static files from:', path.join(__dirname, 'client/build'));
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const newUser = new User({ username, avatar });
    await newUser.save();
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.get('/api/messages/:sender/:receiver', async (req, res) => {
  try {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: sender, receiver: receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error saving message' });
  }
});

app.put('/api/users/:username/online', async (req, res) => {
  try {
    const { username } = req.params;
    const { isOnline } = req.body;
    await User.findOneAndUpdate(
      { username },
      { isOnline, lastSeen: new Date() }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user status' });
  }
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('userLogin', async (username) => {
    try {
      socket.username = username;
      connectedUsers.set(username, socket.id);
      
      // Update user status to online
      await User.findOneAndUpdate(
        { username },
        { isOnline: true, lastSeen: new Date() }
      );
      
      // Notify other users
      socket.broadcast.emit('userStatusChange', { username, isOnline: true });
    } catch (error) {
      console.error('Error in userLogin:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { sender, receiver, message } = data;
      const newMessage = new Message({ sender, receiver, message });
      await newMessage.save();
      
      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', {
          sender,
          receiver,
          message,
          timestamp: newMessage.timestamp
        });
      }
      
      // Send back to sender
      socket.emit('messageSent', {
        sender,
        receiver,
        message,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('typing', (data) => {
    const { sender, receiver } = data;
    const receiverSocketId = connectedUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { sender, receiver });
    }
  });

  socket.on('stopTyping', (data) => {
    const { sender, receiver } = data;
    const receiverSocketId = connectedUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStopTyping', { sender, receiver });
    }
  });

  socket.on('disconnect', async () => {
    if (socket.username) {
      connectedUsers.delete(socket.username);
      
      // Update user status to offline
      try {
        await User.findOneAndUpdate(
          { username: socket.username },
          { isOnline: false, lastSeen: new Date() }
        );
        
        // Notify other users
        socket.broadcast.emit('userStatusChange', { 
          username: socket.username, 
          isOnline: false 
        });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    }
    console.log('Client disconnected');
  });
});

// Serve React app for any non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 