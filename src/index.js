// CORE NODE MODULES
const http = require('http');
const path = require('path');

// NPM NODE MODULES
const express = require('express');
const socketio = require('socket.io');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

// Define path for Express config
const publicDirectoryPath = path.join(__dirname, '../public');

//  Set static directory to serve
app.use(express.static(publicDirectoryPath));

io.on('connection', () => {
  console.log(chalk.yellow('New WebSocket connection!'));
});

server.listen(PORT, () => {
  console.log(chalk.blueBright(`Server is up on port ${PORT}!`));
});
