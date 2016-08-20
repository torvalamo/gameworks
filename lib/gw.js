const Hapi = require('hapi');

const server = new Hapi.server();
server.connection({
  host: 'localhost',
  post: 8000
});

const tpl = require('../pub/tpl/compile');
const order = ['scene']:

server.route({
  method: 'GET',
  path: '/',
  handler: function(req, res) {
    return res(tpl.index(order));
  }
});

server.start((err) => {
  if (err) throw err;
});