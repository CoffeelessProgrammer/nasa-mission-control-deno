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

app.use(async (ctx: any) => {
  const filePath = ctx.request.url.pathname;

  const fileWhitelist = [
    "/index.html",
    "/scripts/main.js",
    "/styles/main.css",
    "/images/favicon.png",
  ];

  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  }
});

if (import.meta.main) {
  log.info(`Starting server on port ${PORT}.....`);
  await app.listen({
    port: PORT
  });
}

// http://localhost:8000/index.html
// deno run --allow-net --allow-read --allow-write mod.ts