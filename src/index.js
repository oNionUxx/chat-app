// CORE NODE MODULES
const http = require('http');
const path = require('path');

// NPM NODE MODULES
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const chalk = require('chalk');

// Imports
const { generateMessage, generateLocationMessage } = require('./utils/messages.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Define path for Express config
const publicDirectoryPath = path.join(__dirname, '../public');

//  Set static directory to serve
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log(chalk.yellow('New WebSocket connection!'));

  socket.emit('message', generateMessage('Welcome!'));
  socket.broadcast.emit('message', generateMessage('A new user has joined'));

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.emit('message', generateMessage(message));
    callback('Message delivered!');
  });

  // Event: display user location url
  socket.on('sendLocation', (coords, callback) => {
    const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
    io.emit('locationMessage', generateLocationMessage(url));
    callback();
  });

  // Event: 'disconnect'
  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left'));
  });
});

server.listen(PORT, () => {
  console.log(chalk.blueBright(`Server is up on port ${PORT}!`));
});
