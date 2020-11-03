// CORE NODE MODULES
const http = require('http');
const path = require('path');

// NPM NODE MODULES
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const chalk = require('chalk');

// IMPORTS
const { generateMessage, generateLocationMessage } = require('./utils/messages.js');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Define path for Express config
const publicDirectoryPath = path.join(__dirname, '../public');

// Set static directory to serve
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log(chalk.yellow('New WebSocket connection!'));

  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback('Message delivered!');
  });

  // Event: display user location url
  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url));
    callback();
  });

  // Event: user disconnect from server
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
    }
  });
});

server.listen(PORT, () => {
  console.log(chalk.blueBright(`Server is up on port ${PORT}!`));
});
