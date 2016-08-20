const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000
});

const ui = require('./lib/ui');
const elements = ['scene'];

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    console.log('Request: /');
    ui.index(elements, data => {
      console.log('index callback');
      reply(data);
    });
  }
});

server.start((err) => {
  if (err) throw err;
  console.log('Server running.')
});