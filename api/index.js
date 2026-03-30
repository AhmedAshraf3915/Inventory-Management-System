const jsonServer = require("json-server");
const path = require("path");
const server = jsonServer.create();

const dbPath = path.resolve(__dirname, "../backend/data/db.json");
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.rewriter({ "/api/*": "/$1" }));
server.use(router);

module.exports = server;
