import { Application, log } from "./deps.ts";

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

app.use((ctx: any) => {
    ctx.response.body = `
    {___     {__      {_         {__ __        {_       
    {_ {__   {__     {_ __     {__    {__     {_ __     
    {__ {__  {__    {_  {__     {__          {_  {__    
    {__  {__ {__   {__   {__      {__       {__   {__   
    {__   {_ {__  {______ {__        {__   {______ {__  
    {__    {_ __ {__       {__ {__    {__ {__       {__ 
    {__      {__{__         {__  {__ __  {__         {__
                    Mission Control API`;
});

if (import.meta.main) {
    await app.listen({
        port: PORT
    });
}

// http://localhost:8000
// deno run --allow-net mod.ts