const fs = require("node:fs");
const path = require("node:path");
const url = require("node:url");

const { createRequestHandler } = require("@remix-run/express");
const { broadcastDevReady, installGlobals } = require("@remix-run/node");
const compression = require("compression");
const express = require("express");
const morgan = require("morgan");
const sourceMapSupport = require("source-map-support");
const mongoose = require("mongoose");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");
const { schema } = require("./app/graphql/schema.server");
const { resolver } = require("./app/graphql/resolver.server");

sourceMapSupport.install();
installGlobals();

/** @typedef {import('@remix-run/node').ServerBuild} ServerBuild */

const BUILD_PATH = path.resolve("build/index.js");
const VERSION_PATH = path.resolve("build/version.txt");

reimportServer().then(async (initialBuild) => {
  const remixHandler =
    process.env.NODE_ENV === "development"
      ? await createDevRequestHandler(initialBuild)
      : createRequestHandler({
          build: initialBuild,
          mode: initialBuild.mode,
        });
  
  const app = express();
  app.use(cors());
  app.use(compression());
  
  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");
  
  // Remix fingerprints its assets so we can cache forever.
  app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
  );
  
  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("public", { maxAge: "1h" }));
  app.use(express.json());
  
  app.use(morgan("tiny"));
  
  app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
  }))

  app.all("*", remixHandler);

  const port = process.env.PORT || 3000;
  const dbConnectionString = 'mongodb://localhost:27017/tapita_training';
  mongoose.set('debug', true);
  mongoose.set('debug', { color: true });
  mongoose.connect(dbConnectionString).then(result => {
    console.log('Connect to mongodb successfully');
    app.listen(port, async () => {
      console.log(`Express server listening on port ${port}`);
    
      if (process.env.NODE_ENV === "development") {
        broadcastDevReady(initialBuild);
      }
    });
  }).catch(err => {
    console.log('Error occured when connect to mongodb: ', err.message);
  })
});

/**
 * @returns {Promise<ServerBuild>}
 */
async function reimportServer() {
  const stat = fs.statSync(BUILD_PATH);

  // convert build path to URL for Windows compatibility with dynamic `import`
  const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  // use a timestamp query parameter to bust the import cache
  return import(BUILD_URL + "?t=" + stat.mtimeMs);
}

/**
 * @param {ServerBuild} initialBuild
 * @returns {Promise<import('@remix-run/express').RequestHandler>}
 */
async function createDevRequestHandler(initialBuild) {
  let build = initialBuild;
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();
    // 2. tell Remix that this app server is now up-to-date and ready
    broadcastDevReady(build);
  }
  const chokidar = await import("chokidar");
  chokidar
    .watch(VERSION_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
