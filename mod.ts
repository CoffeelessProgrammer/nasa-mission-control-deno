import { log, Application, send } from "./deps.ts";

import api from "./api.ts";

const app = new Application();
const PORT = 8000;

app.use(async (ctx: any, next: any) => {
  await next();
  const duration = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url}: ${duration}`);
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
  await app.listen({
    port: PORT,
  });
}

// http://localhost:8000/index.html
// deno run --allow-net --allow-read mod.ts