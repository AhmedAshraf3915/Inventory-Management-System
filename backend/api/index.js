const jsonServer = require("json-server");
const path = require("path");
const server = jsonServer.create();

// Use an absolute path to the db.json file
const router = jsonServer.router(path.join(__dirname, "..", "data", "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Add a rewrite rule to handle the /api prefix
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1",
  }),
);

server.use(router);

module.exports = server;
