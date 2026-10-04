import type {DiagramIR} from "@visual-architecture/ir";
import type {LayoutResult} from "@visual-architecture/layout";
import {renderDiagram} from "@visual-architecture/renderer";

export type ViewerTheme="dark"|"light"|"presentation";
export type ReachDirection="upstream"|"downstream"|"both";
export type Lens="security"|"data"|"storage"|"ai"|"external"|"infrastructure"|"runtime"|"trust";
export interface ViewerState{nodeId?:string;relationId?:string;route?:[string,string];lens?:Lens;theme:ViewerTheme;zoom:number;panX:number;panY:number;reducedMotion:boolean}
export const DEFAULT_STATE:ViewerState={theme:"dark",zoom:1,panX:0,panY:0,reducedMotion:false};

const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export function zoom(state:ViewerState,factor:number):ViewerState{return{...state,zoom:clamp(state.zoom*factor,.25,4)}}
export function pan(state:ViewerState,dx:number,dy:number):ViewerState{return{...state,panX:state.panX+dx,panY:state.panY+dy}}
export function reset(state:ViewerState):ViewerState{return{...state,zoom:1,panX:0,panY:0}}
export function fit(viewW:number,viewH:number,layout:LayoutResult,state:ViewerState):ViewerState{
 const z=clamp(Math.min(viewW/layout.width,viewH/layout.height)*.94,.25,4);
 return{...state,zoom:z,panX:(viewW-layout.width*z)/2,panY:(viewH-layout.height*z)/2};
}
export function search(ir:DiagramIR,query:string):string[]{
 const q=query.trim().toLocaleLowerCase(); if(!q)return[];
 return ir.nodes.filter(n=>[n.id,n.label,n.type,n.description??""].some(v=>v.toLocaleLowerCase().includes(q))).map(n=>n.id);
}
export function focus(ir:DiagramIR,nodeId:string){return{
 node:ir.nodes.find(n=>n.id===nodeId),
 incoming:ir.relationships.filter(r=>r.target===nodeId),
 outgoing:ir.relationships.filter(r=>r.source===nodeId),
 evidence:ir.evidence.filter(e=>e.nodeId===nodeId||ir.relationships.some(r=>(r.source===nodeId||r.target===nodeId)&&e.relationshipId===r.id)),
 boundaries:ir.boundaries.filter(b=>b.nodeIds?.includes(nodeId))
}}
export function reach(ir:DiagramIR,start:string,direction:ReachDirection="both"):string[]{
 const seen=new Set([start]),queue=[start];
 while(queue.length){const id=queue.shift()!;for(const r of ir.relationships){
  const next=direction!=="upstream"&&r.source===id?r.target:direction!=="downstream"&&r.target===id?r.source:undefined;
  if(next&&!seen.has(next)){seen.add(next);queue.push(next);}
 }}return[...seen];
}
export function route(ir:DiagramIR,from:string,to:string):string[]{
 if(from===to)return[from];const queue=[[from]],seen=new Set([from]);
 while(queue.length){const path=queue.shift()!,last=path[path.length-1]!;for(const r of ir.relationships.filter(r=>r.source===last)){
  if(r.target===to)return[...path,to];if(!seen.has(r.target)){seen.add(r.target);queue.push([...path,r.target]);}
 }}return[];
}
export function inspectRelationship(ir:DiagramIR,id:string){const relation=ir.relationships.find(r=>r.id===id);return relation?{relation,evidence:ir.evidence.filter(e=>e.relationshipId===id)}:undefined}
export function applyLens(ir:DiagramIR,lens:Lens):string[]{const q=lens.toLowerCase();return ir.nodes.filter(n=>n.type.toLowerCase().includes(q)||n.label.toLowerCase().includes(q)||JSON.stringify(n.metadata??{}).toLowerCase().includes(q)).map(n=>n.id)}
export function parseDeepLink(hash:string,state:ViewerState=DEFAULT_STATE):ViewerState{
 const p=new URLSearchParams(hash.replace(/^#/,"").replaceAll(":","="));const next={...state};
 const node=p.get("node"),relation=p.get("relation"),lens=p.get("lens"),r=p.get("route");
 if(node)next.nodeId=node;if(relation)next.relationId=relation;if(lens)next.lens=lens as Lens;if(r){const [a,b]=r.split(",");if(a&&b)next.route=[a,b];}
 return next;
}
export function serializeDeepLink(state:ViewerState):string{
 const p=new URLSearchParams();if(state.nodeId)p.set("node",state.nodeId);if(state.relationId)p.set("relation",state.relationId);if(state.route)p.set("route",state.route.join(","));if(state.lens)p.set("lens",state.lens);return p.size?`#${p.toString()}`:"";
}
const escapeScript=(s:string)=>s.replaceAll("</script>","<\\/script>");
export function createSelfContainedHtml(ir:DiagramIR,layout:LayoutResult,state:ViewerState=DEFAULT_STATE):string{
 const svg=renderDiagram(ir,layout).svg;
 const data=escapeScript(JSON.stringify({ir,state}));
 return `<!doctype html><html lang="${ir.presentation.locale??"en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${ir.document.title.replaceAll("<","&lt;")}</title><style>:root{color-scheme:dark light}body{margin:0;font:14px system-ui;background:#111;color:#eee}body[data-theme="light"]{background:#fff;color:#111}#toolbar{display:flex;gap:8px;padding:8px;position:sticky;top:0}button,input{font:inherit}button:focus-visible,input:focus-visible{outline:2px solid currentColor;outline-offset:2px}#viewport{overflow:hidden;height:calc(100vh - 52px)}#canvas{transform-origin:0 0}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}</style></head><body data-theme="${state.theme}"><nav id="toolbar" aria-label="Diagram controls"><button data-action="zoom-in" aria-label="Zoom in">+</button><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="fit">Fit</button><button data-action="reset">Reset</button><input id="search" type="search" aria-label="Search diagram" placeholder="Search"></nav><main id="viewport" tabindex="0" aria-label="Interactive diagram"><div id="canvas">${svg}</div></main><script type="application/json" id="viewer-data">${data}</script><script>(function(){const vp=document.getElementById("viewport"),c=document.getElementById("canvas");let z=1,x=0,y=0;function draw(){c.style.transform="translate("+x+"px,"+y+"px) scale("+z+")"}document.querySelector("[data-action=zoom-in]").onclick=()=>{z=Math.min(4,z*1.2);draw()};document.querySelector("[data-action=zoom-out]").onclick=()=>{z=Math.max(.25,z/1.2);draw()};document.querySelector("[data-action=reset]").onclick=()=>{z=1;x=0;y=0;draw()};vp.addEventListener("keydown",e=>{if(e.key==="+"){z=Math.min(4,z*1.2);draw()}if(e.key==="-"){z=Math.max(.25,z/1.2);draw()}if(e.key==="0"){z=1;x=0;y=0;draw()}});})();</script></body></html>`;
}
