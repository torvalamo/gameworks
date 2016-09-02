/**
 * Config
 */
const port = 80;
const title = 'My Game Name';

/**
 * Start server
 */
const http = require('http');
const express = require('express');

const app = express();
const io = require('socket.io')();

const server = http.createServer(app);
io.attach(server);

server.listen(80, () => console.log(`Server listening at port ${port}`));

/**
 * Routing
 */
const lib = require('./lib');

io.on('connection', lib.socket);

app.get('/', (req, res) => {
  lib.ui.index(title, data => res.send(data));
});

app.get('/gameworks.js', (req, res) => {
  res.type('application/javascript');
  lib.ui.main(data => res.send(data));
});

app.get('/elements.js', (req, res) => {
  res.type('application/javascript');
  lib.ui.scripts(data => res.send(data));
});

app.get('/elements.css', (req, res) => {
  res.type('text/css');
  lib.ui.styles(data => res.send(data));
});

const opts = {
  index: false,
  dotfile: 'ignore'
};

app.use('/assets', express.static('app/assets', opts));

app.use('/client', express.static('app/client', opts));