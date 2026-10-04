import type {DiagramIR,DiagramKind} from "@visual-architecture/ir";
import type {LayoutResult,NodeGeometry} from "@visual-architecture/layout";

export interface RenderResult{kind:DiagramKind;svg:string;geometryHash:string}
const esc=(v:string)=>v.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const node=(g:NodeGeometry,label:string,shape:"rect"|"round"|"pill"|"store"|"state")=>{
 const rx=shape==="pill"?g.height/2:shape==="round"||shape==="state"?12:4;
 const extra=shape==="store"?` data-shape="store"`:"";
 return `<g id="node-${esc(g.id)}" data-node-id="${esc(g.id)}" data-shape="${shape}"><rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" rx="${rx}"${extra}/><text x="${g.x+g.width/2}" y="${g.y+g.height/2}" text-anchor="middle" dominant-baseline="middle">${esc(label)}</text></g>`;
};
const edge=(id:string,points:{x:number;y:number}[],kind:string)=>`<polyline id="relation-${esc(id)}" data-relation-id="${esc(id)}" data-relation-kind="${esc(kind)}" points="${points.map(p=>`${p.x},${p.y}`).join(" ")}" fill="none" marker-end="url(#arrow)"/>`;
const frame=(ir:DiagramIR,layout:LayoutResult,body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="diagram-title diagram-desc" data-diagram-kind="${ir.kind}" data-geometry-hash="${layout.geometryHash}"><title id="diagram-title">${esc(ir.document.title)}</title><desc id="diagram-desc">${esc(ir.document.description??`${ir.kind} diagram`)}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z"/></marker></defs>${body}</svg>`;

type Renderer=(ir:DiagramIR,layout:LayoutResult)=>RenderResult;
const render=(shape:(ir:DiagramIR,nodeId:string)=>"rect"|"round"|"pill"|"store"|"state",relationKind:(type:string)=>string):Renderer=>(ir,layout)=>{
 const byId=new Map(ir.nodes.map(n=>[n.id,n]));
 const edges=layout.edges.map(g=>edge(g.id,g.points,relationKind(ir.relationships.find(r=>r.id===g.id)?.type??"relation"))).join("");
 const nodes=layout.nodes.map(g=>node(g,byId.get(g.id)?.label??g.id,shape(ir,g.id))).join("");
 return{kind:ir.kind,svg:frame(ir,layout,edges+nodes),geometryHash:layout.geometryHash};
};

export const architectureRenderer=render((ir,id)=>ir.nodes.find(n=>n.id===id)?.type==="store"?"store":"round",t=>t);
export const workflowRenderer=render((ir,id)=>ir.nodes.find(n=>n.id===id)?.type==="decision"?"pill":"round",t=>`workflow-${t}`);
export const sequenceRenderer=render(()=>"pill",t=>`message-${t}`);
export const dataFlowRenderer=render((ir,id)=>ir.nodes.find(n=>n.id===id)?.type==="store"?"store":"round",t=>`data-${t}`);
export const lifecycleRenderer=render(()=>"state",t=>`transition-${t}`);

export const renderers:Record<DiagramKind,Renderer>={
 architecture:architectureRenderer,workflow:workflowRenderer,sequence:sequenceRenderer,"data-flow":dataFlowRenderer,lifecycle:lifecycleRenderer
};
export function renderDiagram(ir:DiagramIR,layout:LayoutResult):RenderResult{return renderers[ir.kind](ir,layout);}

export function validateSvg(svg:string):string[]{
 const errors:string[]=[];
 if(!svg.startsWith("<svg")||!svg.endsWith("</svg>"))errors.push("SVG_ROOT_INVALID");
 if(/<script\b/i.test(svg))errors.push("SVG_SCRIPT_FORBIDDEN");
 if(/\son[a-z]+\s*=/i.test(svg))errors.push("SVG_EVENT_HANDLER_FORBIDDEN");
 if(/javascript:/i.test(svg))errors.push("SVG_UNSAFE_URL");
 return errors;
}
