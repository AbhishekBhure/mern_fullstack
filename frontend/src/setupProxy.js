const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      // target: "http://192.168.29.150:4000", //wi-fi
      // target: "http://192.168.39.200:4000",

      target: "http://192.168.43.200:4000", //mobile
      changeOrigin: true,
    })
  );
};
