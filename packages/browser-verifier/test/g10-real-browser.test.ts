import {describe,expect,it} from "vitest";
import {chromium} from "@playwright/test";
import type {DiagramIR,DiagramKind} from "@visual-architecture/ir";
import {layoutDiagram} from "@visual-architecture/layout";
import {createSelfContainedHtml} from "@visual-architecture/viewer-runtime";
import {hashBytes} from "@visual-architecture/exporter";

const kinds:DiagramKind[]=["architecture","workflow","sequence","data-flow","lifecycle"];
function fixture(kind:DiagramKind):DiagramIR{
 const types:Record<DiagramKind,[string,string,string]>={
  architecture:["external","runtime","storage"],workflow:["start","task","end"],sequence:["participant","participant","participant"],"data-flow":["source","process","destination"],lifecycle:["START","ACTIVE","COMPLETED"]
 };
 const t=types[kind];
 return{version:"1.0",kind,document:{title:`G10 ${kind}`},nodes:[
  {id:"a",type:t[0],label:`${kind} Alpha`,metadata:{order:0,lane:"primary"}},
  {id:"b",type:t[1],label:`${kind} Beta`,metadata:{order:1,lane:"primary",storage:true}},
  {id:"c",type:t[2],label:`${kind} Gamma`,metadata:{order:2,lane:"secondary"}}
 ],relationships:[{id:"ab",source:"a",target:"b",type:kind==="sequence"?"message":"flow",label:"A to B",metadata:{order:0}},{id:"bc",source:"b",target:"c",type:kind==="lifecycle"?"transition":"flow",label:"B to C",metadata:{order:1}}],boundaries:kind==="architecture"?[{id:"trust",type:"trust",label:"Trust",nodeIds:["b","c"]}]:[],evidence:[],presentation:{locale:"en"}};
}
const viewports=[["desktop",1440,900,false],["laptop",1280,720,false],["tablet",820,1180,true],["mobile-portrait",390,844,true],["mobile-landscape",844,390,true]] as const;
async function click(page:any,sel:string){await page.locator(sel).first().evaluate((e:any)=>e.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true})))}
describe("G10 real Chromium + accessibility qualification",()=>{
 for(const kind of kinds)it(`qualifies ${kind} with real interactions, deep links and screenshot evidence`,async()=>{
  const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:"reduce"}),page=await context.newPage(),errors:string[]=[];
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});page.on("pageerror",e=>errors.push(e.message));
  try{await page.setContent(createSelfContainedHtml(fixture(kind),layoutDiagram(fixture(kind))),{waitUntil:"load"});
   expect(await page.locator("#canvas > svg").count()).toBe(1);
   expect(await page.locator("#toolbar").getAttribute("aria-label")).toBeTruthy();expect(await page.locator("#viewport").getAttribute("aria-label")).toBe("Interactive diagram");
   const before=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);await click(page,'[data-action="zoom-in"]');expect(await page.locator("#canvas").evaluate((e:any)=>e.style.transform)).not.toBe(before);
   await click(page,'[data-action="fit"]');await click(page,'[data-action="reset"]');await click(page,'[data-action="overview"]');expect(await page.locator("#overview").isVisible()).toBe(true);
   await page.fill("#search","beta");expect(await page.locator('[data-node-id="b"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
   await click(page,'[data-node-id="b"]');expect(await page.locator("#panel").isVisible()).toBe(true);
   await click(page,'[data-relation-id="ab"]');expect(await page.locator("#panel").textContent()).toContain("a → b");
   await click(page,'[data-node-id="b"]');await click(page,'[data-reach="upstream"]');expect(await page.locator('[data-node-id="a"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
   await click(page,'[data-node-id="b"]');await click(page,'[data-reach="downstream"]');expect(await page.locator('[data-node-id="c"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
   await page.fill("#route-from","a");await page.fill("#route-to","c");await click(page,'[data-action="route"]');expect(await page.locator('[data-node-id="b"]').evaluate((e:any)=>e.classList.contains("highlight"))).toBe(true);
   await page.selectOption("#lens","storage");await click(page,'[data-theme="light"]');expect(await page.locator("body").getAttribute("data-theme")).toBe("light");await click(page,'[data-theme="dark"]');await click(page,'[data-theme="presentation"]');
   await page.evaluate(()=>{location.hash="#node=b&route=a:c&lens=storage&relation=ab"});await page.waitForTimeout(25);expect(await page.locator("#panel").textContent()).toContain("Beta");
   expect(await page.evaluate(()=>document.documentElement.dataset.reducedMotion)).toBe("true");
   const shot=await page.screenshot({fullPage:true});expect(shot.length).toBeGreaterThan(1000);expect(hashBytes(new Uint8Array(shot))).toMatch(/^[0-9a-f]{8}$/);
   expect(errors).toEqual([]);
  }finally{await browser.close()}
 },30000);

 it("qualifies desktop/laptop/tablet/mobile portrait/mobile landscape and touch pan",async()=>{
  for(const [name,width,height,touch] of viewports){const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,reducedMotion:"reduce"}),page=await context.newPage();try{
   await page.setContent(createSelfContainedHtml(fixture("architecture"),layoutDiagram(fixture("architecture"))));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect(await page.locator("#toolbar").boundingBox()).toBeTruthy();expect(await page.locator("#viewport").boundingBox()).toBeTruthy();
   if(touch){const b=await page.locator("#viewport").boundingBox();const before=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);if(b){await page.dispatchEvent("#viewport","pointerdown",{pointerId:9,pointerType:"touch",clientX:b.x+40,clientY:b.y+40});await page.dispatchEvent("#viewport","pointermove",{pointerId:9,pointerType:"touch",clientX:b.x+80,clientY:b.y+70});await page.dispatchEvent("#viewport","pointerup",{pointerId:9,pointerType:"touch",clientX:b.x+80,clientY:b.y+70})}expect(await page.locator("#canvas").evaluate((e:any)=>e.style.transform),name).not.toBe(before)}
   expect((await page.screenshot()).length,name).toBeGreaterThan(1000);
  }finally{await browser.close()}}
 },60000);

 it("proves keyboard-only focus order, activation, visible focus and reduced-motion CSS",async()=>{
  const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:"reduce"});try{await page.setContent(createSelfContainedHtml(fixture("architecture"),layoutDiagram(fixture("architecture"))));
   const seen:string[]=[];for(let i=0;i<6;i++){await page.keyboard.press("Tab");seen.push(await page.evaluate(()=>{const e=document.activeElement as HTMLElement;return e.getAttribute("data-action")||e.id||e.tagName}))}expect(seen.slice(0,4)).toEqual(["zoom-in","zoom-out","fit","reset"]);
   const focused=await page.evaluate(()=>{const e=document.activeElement as HTMLElement,s=getComputedStyle(e);return s.outlineStyle!=="none"&&s.outlineWidth!=="0px"});expect(focused).toBe(true);
   await page.locator('[data-action="zoom-in"]').focus();const before=await page.locator("#canvas").evaluate((e:any)=>e.style.transform);await page.keyboard.press("Enter");expect(await page.locator("#canvas").evaluate((e:any)=>e.style.transform)).not.toBe(before);
   expect(await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);expect(await page.evaluate(()=>document.documentElement.dataset.reducedMotion)).toBe("true");
   expect(await page.locator('[data-relation-id="ab"]').getAttribute("data-relation-kind")).toBeTruthy();
  }finally{await browser.close()}
 },30000);
});
