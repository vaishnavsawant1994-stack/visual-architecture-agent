import {describe,expect,it} from "vitest";
import {chromium} from "@playwright/test";
import type {DiagramIR} from "@visual-architecture/ir";
import {layoutDiagram} from "@visual-architecture/layout";
import {createSelfContainedHtml} from "@visual-architecture/viewer-runtime";

const ir:DiagramIR={version:"1.0",kind:"architecture",document:{title:"Browser G6"},nodes:[{id:"web",type:"external",label:"Web"},{id:"api",type:"runtime",label:"API Runtime"},{id:"db",type:"storage",label:"Database"}],relationships:[{id:"wa",source:"web",target:"api",type:"calls"},{id:"ad",source:"api",target:"db",type:"reads"}],boundaries:[{id:"trust",type:"trust",label:"Trust",nodeIds:["api","db"]}],evidence:[],presentation:{locale:"en"}};
const html=createSelfContainedHtml(ir,layoutDiagram(ir));
async function probe(width:number,height:number,hasTouch=false){
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width,height},hasTouch,isMobile:hasTouch});const page=await context.newPage();const errors:string[]=[];page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});page.on("pageerror",e=>errors.push(e.message));await page.setContent(html,{waitUntil:"load"});
 try{
  expect(await page.locator("#viewport").getAttribute("aria-label")).toBe("Interactive diagram");
  const before=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);await page.click('[data-action="zoom-in"]');const zoomed=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);expect(zoomed).not.toBe(before);
  await page.click('[data-action="fit"]');await page.click('[data-action="overview"]');expect(await page.locator("#overview").isVisible()).toBe(true);
  await page.fill("#search","database");expect(await page.locator('[data-node-id="db"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
  await page.click('[data-node-id="api"]');expect(await page.locator("#panel").isVisible()).toBe(true);expect(await page.locator("#panel").textContent()).toContain("API Runtime");
  await page.selectOption("#lens","storage");expect(await page.locator('[data-node-id="db"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
  await page.fill("#route-from","web");await page.fill("#route-to","db");await page.click('[data-action="route"]');expect(await page.locator('[data-node-id="api"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
  await page.click('[data-theme="light"]');expect(await page.locator("body").getAttribute("data-theme")).toBe("light");await page.click('[data-theme="presentation"]');expect(await page.locator("body").getAttribute("data-theme")).toBe("presentation");
  await page.evaluate(()=>{location.hash="#node=api&lens=runtime"});await page.waitForTimeout(20);expect(await page.locator("#panel").textContent()).toContain("API Runtime");
  const panBefore=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);const box=await page.locator("#viewport").boundingBox();if(box){await page.mouse.move(box.x+80,box.y+80);await page.mouse.down();await page.mouse.move(box.x+130,box.y+120);await page.mouse.up()}const panAfter=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);expect(panAfter).not.toBe(panBefore);
  if(hasTouch){const b=await page.locator("#viewport").boundingBox();if(b){const x=b.x+50,y=b.y+50;await page.dispatchEvent("#viewport","pointerdown",{pointerId:7,pointerType:"touch",clientX:x,clientY:y});await page.dispatchEvent("#viewport","pointermove",{pointerId:7,pointerType:"touch",clientX:x+35,clientY:y+25});await page.dispatchEvent("#viewport","pointerup",{pointerId:7,pointerType:"touch",clientX:x+35,clientY:y+25})}}
  expect(errors).toEqual([]);
 }finally{await browser.close()}
}
describe("G6 real Chromium viewer qualification",()=>{it("qualifies desktop interactions",async()=>probe(1440,900,false),30000);it("qualifies responsive mobile and touch interactions",async()=>probe(390,844,true),30000)});
