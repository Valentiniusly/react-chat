const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { formatMessage, getOldMessages } = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getUsersForStream,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

// current video streamers
const streamers = {};

io.on('connection', (socket) => {
  socket.on('leaveRoom', () => {
    const user = userLeave(socket.id);
    if (user) {
      socket.leave(user.room);
      io.to(user.room).emit(
        'message',
        formatMessage({
          username: user.username,
          room: user.room,
          text: `${user.username} has left the chat`,
          type: 'system',
        })
      );
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    } else {
      console.log('LeaveRoom went wrong');
    }
  });

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    if (user) {
      socket.join(user.room);

      socket.emit('oldMessages', getOldMessages(user.room));

      io.to(user.room).emit(
        'message',
        formatMessage({
          username: user.username,
          room: user.room,
          text: `${user.username} has joined the chat`,
          type: 'system',
        })
      );

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    } else {
      console.log('JoinRoom went wrong');
    }
  });

  socket.on('startStream', ({ id, room }) => {
    console.log('startStream');
    streamers[room] = id;
    const usersForStream = getUsersForStream({ id, room });
    socket.emit('usersForStream', usersForStream);
  });

  socket.on('stopStream', ({ id, room }) => {
    console.log('stop stream');
    if (id === streamers[room]) {
      io.to(room).emit('stopStream', streamers[room]);
      streamers[room] = undefined;
    }
  });

  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit(
      'message',
      formatMessage({
        username: user.username,
        room: user.room,
        text: msg,
        type: 'msg',
      })
    );
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      if (user.id === streamers[user.room]) {
        io.to(user.room).emit('stopStream', streamers[user.room]);
        streamers[user.room] = undefined;
      }
      io.to(user.room).emit(
        'message',
        formatMessage({
          username: user.username,
          room: user.room,
          text: `${user.username} has left the chat`,
          type: 'system',
        })
      );

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
