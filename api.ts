import { Router } from "./deps.ts";

import * as planets from "./models/planets.ts";
import * as launches from "./models/launches.ts";

const router = new Router();

router.get("/", (ctx: any) => {
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

router.get("/planets", (ctx: any) => {
  // throw new Error("Sample error");
  // ctx.throw(400, "Sorry, planets aren't available -_-'");
  ctx.response.body = planets.getAllPlanets();
});

router.get("/launches", (ctx: any) => {
  ctx.response.body = launches.getAllLaunches();
});

router.get("/launches/:launch_id", (ctx: any) => {
  if (ctx.params?.launch_id) {
    const launch = launches.getLaunchById(Number(ctx.params.launch_id));

    if (launch) {
      ctx.response.body = launch;
    } else {
      ctx.throw(400, "Launch doesn't exist");
    }
  }
});

export default router;