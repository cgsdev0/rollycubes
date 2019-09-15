// @ts-ignore
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/cookie', { target: 'http://localhost:3001', secure: false }));
  app.use(proxy('/create', { target: 'http://localhost:3001', secure: false }));
  app.use(proxy('/ws', { target: 'ws://localhost:3001', ws: true, secure: false }));
};

