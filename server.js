const path = require("path");
const jsonServer = require("json-server");
const sendError = require("./utils/send-error");
const createValidationMiddleware = require("./middleware/validation");

const app = jsonServer.create();
const dbFile = path.join(__dirname, "db.json");
const publicDir = path.join(__dirname, "public");
const router = jsonServer.router(dbFile);
const port = Number(process.env.PORT) || 4000;

app.disable("x-powered-by");

// /!\ Bind the router db to the app
app.db = router.db;

const validationMiddleware = createValidationMiddleware({ router, sendError });

const middlewares = jsonServer.defaults({
  static: publicDir,
});

app.use(middlewares);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

app.use(jsonServer.bodyParser);
app.use(validationMiddleware);
app.use((req, res, next) => {
  const originalJsonp = res.jsonp.bind(res);

  res.jsonp = (body) => {
    if (
      res.statusCode === 404 &&
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      Object.keys(body).length === 0
    ) {
      return sendError(
        res,
        404,
        "NOT_FOUND",
        `No route matches ${req.method} ${req.originalUrl}.`,
      );
    }

    return originalJsonp(body);
  };

  next();
});
app.use(router);

app.use((req, res) => {
  sendError(
    res,
    404,
    "NOT_FOUND",
    `No route matches ${req.method} ${req.originalUrl}.`,
  );
});

app.use((err, _req, res, _next) => {
  console.error(err);
  sendError(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "Something went wrong on the server.",
  );
});

app.listen(port, () => {
  console.log("Server is ready for requests on port " + port);
});

module.exports = app;
