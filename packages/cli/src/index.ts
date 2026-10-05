import type {DiagramIR} from "@visual-architecture/ir";
import {validatePipeline} from "@visual-architecture/validator";
import {layoutDiagram} from "@visual-architecture/layout";
import {renderDiagram} from "@visual-architecture/renderer";
import {createSelfContainedHtml} from "@visual-architecture/viewer-runtime";
import {exportDiagram,exportHtml,exportSvg,validateExport,type ExportArtifact,type ExportFormat,type Rasterizer} from "@visual-architecture/exporter";
import {analyzeRepository,analysisToArchitectureIR,type RepositorySnapshot} from "@visual-architecture/analyzer";
import {verifyHtmlStructure} from "@visual-architecture/browser-verifier";
import {deliverAtomic,type DeliveryStore} from "@visual-architecture/delivery";

export const COMMANDS=["doctor","guide","create","analyze","validate","inspect","render","preview","deliver","compare","export","verify","examples"] as const;
export type Command=typeof COMMANDS[number];
export interface CommandContext{ir?:DiagramIR;snapshot?:RepositorySnapshot;before?:DiagramIR;after?:DiagramIR;format?:ExportFormat;rasterizer?:Rasterizer;deliveryStore?:DeliveryStore;deliveryKey?:string;candidate?:ExportArtifact;intent?:string}
const stable=(v:unknown)=>JSON.stringify(v,Object.keys(v as any??{}).sort());
const changed=<T extends {id:string}>(a:T[],b:T[])=>{const am=new Map(a.map(x=>[x.id,x])),bm=new Map(b.map(x=>[x.id,x]));return [...bm.keys()].filter(k=>am.has(k)&&JSON.stringify(am.get(k))!==JSON.stringify(bm.get(k)))};
export function compareIR(before:DiagramIR,after:DiagramIR){
 const bn=new Map(before.nodes.map(n=>[n.id,n])),an=new Map(after.nodes.map(n=>[n.id,n])),br=new Map(before.relationships.map(r=>[r.id,r])),ar=new Map(after.relationships.map(r=>[r.id,r])),bb=new Map(before.boundaries.map(x=>[x.id,x])),ab=new Map(after.boundaries.map(x=>[x.id,x])),be=new Map(before.evidence.map(x=>[x.id,x])),ae=new Map(after.evidence.map(x=>[x.id,x]));
 return{before:{nodes:before.nodes.length,relationships:before.relationships.length,boundaries:before.boundaries.length,evidence:before.evidence.length},delta:{addedNodes:[...an.keys()].filter(k=>!bn.has(k)),removedNodes:[...bn.keys()].filter(k=>!an.has(k)),changedNodes:changed(before.nodes,after.nodes),addedRelationships:[...ar.keys()].filter(k=>!br.has(k)),removedRelationships:[...br.keys()].filter(k=>!ar.has(k)),changedRelationships:changed(before.relationships,after.relationships),addedBoundaries:[...ab.keys()].filter(k=>!bb.has(k)),removedBoundaries:[...bb.keys()].filter(k=>!ab.has(k)),changedBoundaries:changed(before.boundaries,after.boundaries),addedEvidence:[...ae.keys()].filter(k=>!be.has(k)),removedEvidence:[...be.keys()].filter(k=>!ae.has(k)),changedEvidence:changed(before.evidence,after.evidence)},after:{nodes:after.nodes.length,relationships:after.relationships.length,boundaries:after.boundaries.length,evidence:after.evidence.length}};
}
export function createFromIntent(intent:string):DiagramIR{
 const text=intent.trim();if(!text)throw new Error("INTENT_REQUIRED");
 const lower=text.toLowerCase(),auth=/auth|login|identity/.test(lower);
 return{version:"1.0",kind:"architecture",document:{title:text},nodes:auth?[{id:"user",type:"external",label:"User"},{id:"auth-service",type:"runtime",label:"Authentication Service"},{id:"session-store",type:"store",label:"Session Store"}]:[{id:"input",type:"external",label:"Input"},{id:"application",type:"runtime",label:"Application"}],relationships:auth?[{id:"user-auth",source:"user",target:"auth-service",type:"calls"},{id:"auth-session",source:"auth-service",target:"session-store",type:"writes"}]:[{id:"input-application",source:"input",target:"application",type:"calls"}],boundaries:[],evidence:[],presentation:{}};
}
export const EXAMPLES=[{name:"minimal-architecture",document:createFromIntent("Show application architecture")}];
export async function runCommand(command:Command,c:CommandContext={}):Promise<unknown>{switch(command){
 case"doctor":return{ok:true,required:{node:true,core:true},optional:{rasterizer:!!c.rasterizer},commands:[...COMMANDS]};
 case"guide":return{pipeline:"Input → Analysis → Typed IR → Validation → Layout → SVG → Interactive Viewer → Verification → Self-contained HTML",commands:[...COMMANDS],security:"Repositories are read-only untrusted data and repository-authored code is never executed."};
 case"create":{const ir=createFromIntent(c.intent??"");const validation=validatePipeline(ir);if(!validation.valid)throw new Error("CREATE_VALIDATION_FAILED:"+validation.diagnostics.filter(d=>d.severity==="error").map(d=>d.code).join(","));const layout=layoutDiagram(ir);return{ir,validation,layout,artifact:renderDiagram(ir,layout)}}
 case"analyze":if(!c.snapshot)throw Error("SNAPSHOT_REQUIRED");{const a=analyzeRepository(c.snapshot);if(a.diagnostics.some(d=>d.severity==="error"))return{ok:false,analysis:a};return{ok:true,analysis:a,ir:analysisToArchitectureIR(c.snapshot,a)}}
 case"validate":if(!c.ir)throw Error("IR_REQUIRED");return validatePipeline(c.ir);
 case"inspect":if(!c.ir)throw Error("IR_REQUIRED");return{kind:c.ir.kind,nodes:c.ir.nodes.length,relationships:c.ir.relationships.length,boundaries:c.ir.boundaries.length,evidence:c.ir.evidence.length,title:c.ir.document.title};
 case"render":if(!c.ir)throw Error("IR_REQUIRED");{const v=validatePipeline(c.ir);if(!v.valid)throw Error("IR_INVALID");return renderDiagram(c.ir,layoutDiagram(c.ir))}
 case"preview":if(!c.ir)throw Error("IR_REQUIRED");{const v=validatePipeline(c.ir);if(!v.valid)throw Error("IR_INVALID");return createSelfContainedHtml(c.ir,layoutDiagram(c.ir))}
 case"deliver":if(!c.ir||!c.deliveryStore)throw Error("IR_DELIVERY_STORE_REQUIRED");{const v=validatePipeline(c.ir);if(!v.valid)throw Error("IR_INVALID");const candidate=c.candidate??exportHtml(c.ir,layoutDiagram(c.ir));return deliverAtomic(c.deliveryKey??"default",c.ir,candidate,c.deliveryStore)}
 case"compare":if(!c.before||!c.after)throw Error("BEFORE_AFTER_REQUIRED");return compareIR(c.before,c.after);
 case"export":if(!c.ir)throw Error("IR_REQUIRED");{const format=c.format??"html";return exportDiagram({format,document:c.ir,layout:layoutDiagram(c.ir),...(c.rasterizer?{rasterizer:c.rasterizer}:{})})}
 case"verify":if(!c.ir)throw Error("IR_REQUIRED");{const a=exportHtml(c.ir,layoutDiagram(c.ir));return{artifactErrors:validateExport(a),structure:verifyHtmlStructure(new TextDecoder().decode(a.bytes))}}
 case"examples":return EXAMPLES.map(x=>({name:x.name,kind:x.document.kind,valid:validatePipeline(x.document).valid}));
 default:throw Error("COMMAND_UNKNOWN");
}}
