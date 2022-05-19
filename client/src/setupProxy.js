const { createProxyMiddleware } = require("http-proxy-middleware");
const morgan = require("morgan");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/cookie", {
      target: "http://localhost:3001",
      secure: false,
    })
  );
  app.use(
    createProxyMiddleware("/list", {
      target: "http://localhost:3001",
      secure: false,
    })
  );
  app.use(
    createProxyMiddleware("/create", {
      target: "http://localhost:3001",
      secure: false,
    })
  );
  app.use(
    createProxyMiddleware("/ws/", {
      target: "ws://localhost:3001",
      changeOrigin: true,
      ws: true,
      secure: false,
    })
  );
  app.use(morgan("tiny"));
};
