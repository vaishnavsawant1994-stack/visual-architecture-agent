import type {DiagramIR} from "@visual-architecture/ir";

export interface Point{x:number;y:number}
export interface NodeGeometry{id:string;x:number;y:number;width:number;height:number}
export interface EdgeGeometry{id:string;points:Point[]}
export interface LayoutResult{nodes:NodeGeometry[];edges:EdgeGeometry[];width:number;height:number;geometryHash:string}

const WIDTH=180,HEIGHT=72,GAP_X=80,GAP_Y=56,PADDING=48,COLUMNS=4;

function stableHash(value:string):string{
 let h=2166136261;
 for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}
 return (h>>>0).toString(16).padStart(8,"0");
}

export function layoutDiagram(ir:DiagramIR):LayoutResult{
 const ordered=[...ir.nodes].sort((a,b)=>a.id.localeCompare(b.id));
 const nodes=ordered.map((node,index)=>{
  const column=index%COLUMNS,row=Math.floor(index/COLUMNS);
  return{id:node.id,x:PADDING+column*(WIDTH+GAP_X),y:PADDING+row*(HEIGHT+GAP_Y),width:WIDTH,height:HEIGHT};
 });
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const edges=[...ir.relationships].sort((a,b)=>a.id.localeCompare(b.id)).flatMap(rel=>{
  const s=byId.get(rel.source),t=byId.get(rel.target);
  if(!s||!t)return[];
  const start={x:s.x+s.width,y:s.y+s.height/2},end={x:t.x,y:t.y+t.height/2};
  const midX=(start.x+end.x)/2;
  return[{id:rel.id,points:[start,{x:midX,y:start.y},{x:midX,y:end.y},end]}];
 });
 const rows=Math.max(1,Math.ceil(nodes.length/COLUMNS));
 const cols=Math.max(1,Math.min(COLUMNS,nodes.length));
 const width=PADDING*2+cols*WIDTH+Math.max(0,cols-1)*GAP_X;
 const height=PADDING*2+rows*HEIGHT+Math.max(0,rows-1)*GAP_Y;
 const canonical=JSON.stringify({nodes,edges,width,height});
 return{nodes,edges,width,height,geometryHash:stableHash(canonical)};
}
