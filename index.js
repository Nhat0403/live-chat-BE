require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Chatroom = require('./models/Chatroom');

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const userRoutes = require('./routes/user');
const chatroomsRoutes = require('./routes/chatrooms');
const { auth } = require('./middlewares.js/auth');
app.use('/users', userRoutes);
app.use('/chatrooms', auth, chatroomsRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose.connect(process.env.MONGO_URI);

const server = app.listen(PORT, () => console.log('listening on port ' + PORT));

const io = require('socket.io')(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use(async(socket, next) => {
  try {
    const token = socket.handshake.query.token;
    console.log('token');
    console.log(token);
    const payload = await jwt.verify(token, process.env.YOUR_SECRET_KEY);
    console.log(payload);
    socket.userId = payload.id;
    next();
  } catch(err) {
    console.log(err);
  };
});

io.on('connection', (socket) => {
  console.log('connected: ' + socket.userId);

  socket.on('disconnect', () => {
    console.log('disconnected: ' + socket.userId);
  });

  socket.on('joinRoom', ({ chatroomId, userId }) => {
    socket.join(chatroomId);
    console.log('User ' + userId + ' joined room ' + chatroomId);
  });

  socket.on('leaveRoom', ({ chatroomId, userId }) => {
    socket.leave(chatroomId);
    console.log('User ' + userId + ' left room ' + chatroomId);
  });

  socket.on('send_message', async({ chatroomId, message }) => {
    console.log('message');
    console.log(message);
    if(message.trim().length > 0) {
      const user = await User.findOne({ _id: socket.userId });
      console.log(user);
      await Chatroom.findByIdAndUpdate(
        chatroomId, 
        {
          $push: 
          {
            content: 
            {
              userId: socket.userId,
              username: user.name,
              message: message
            }
          }
        }
      );
      const chatroom = await Chatroom.findById(chatroomId);
      io.to(chatroomId).emit('receive_message', { chatroom: chatroom });
    };
  });
});