import { log, Application, send } from "./deps.ts";

import api from "./api.ts";

// ------------------ Logger Setup ------------------
await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO"),

    file: new log.handlers.FileHandler("INFO", {
      filename: "./log.txt",
      formatter: "{datetime} {levelName} {msg}",
    }),
  },

  loggers: {
    default: {
      level: "INFO",
      handlers: ["console", "file"],
    },

    debugger: {
      level: "DEBUG",
      handlers: ["console"]
    },

    custom: {
      level: "INFO",
      handlers: ["console", "file"],
    },

    errorlog: {
      level: "WARNING",
      handlers: ["console", "file"],
    }
  },
});

// ------------------ Application ------------------
const app = new Application();
const PORT = 8000;

const errorlogger = log.getLogger("errorlog");

app.addEventListener("error", (event: any) => {
  errorlogger.error(event.error);
});

app.use(async (ctx: any, next: any) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = "Internal server error";
    throw err;
  }
});

app.use(async (ctx: any, next: any) => {
  await next();
  const duration = ctx.response.headers.get("X-Response-Time");
  log.info(`${ctx.request.method} ${ctx.request.url}: ${duration}`);
});

app.use(async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const delta = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${delta}ms`);
});

app.use(api.routes());
app.use(api.allowedMethods());

// Files allowed to be served by API
app.use(async (ctx: any) => {
  const filePath = ctx.request.url.pathname;

  const fileWhitelist = [
    "/index.html",
    "/scripts/main.js",
    "/styles/main.css",
    "/images/favicon.png",
    "/videos/pexels-rotating-earth.mp4"
  ];

  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  }
});

// If mod.ts is run as root of program, set app to listen on specified port.
if (import.meta.main) {
  log.info(`Starting server on port ${PORT}.....`);
  await app.listen({
    port: PORT
  });
}

// Dev Local Cache:
//   deno cache --reload --lock-write --lock=lock.json src/deps.ts
//   deno cache --reload --lock-write --lock=test_lock.json src/test_deps.ts

// ---------------------- Program Usage ----------------------
//   deno cache --reload --lock=lock.json src/deps.ts
//   deno cache --reload --lock=test_lock.json src/test_deps.ts
//   deno test --allow-read --lock=test_lock.json
//   deno run --allow-net --allow-read --allow-write --lock=lock.json src/mod.ts
//   http://localhost:8000/index.html