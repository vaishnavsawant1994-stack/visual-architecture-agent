import type {DiagramIR} from "@visual-architecture/ir";import {validateDiagramIR} from "@visual-architecture/validator";import {layoutDiagram} from "@visual-architecture/layout";import {renderDiagram} from "@visual-architecture/renderer";import {createSelfContainedHtml} from "@visual-architecture/viewer-runtime";import {exportHtml,exportSvg,validateExport} from "@visual-architecture/exporter";import {analyzeRepository,analysisToArchitectureIR,type RepositorySnapshot} from "@visual-architecture/analyzer";import {verifyHtmlStructure} from "@visual-architecture/browser-verifier";
export const COMMANDS=["doctor","guide","create","analyze","validate","inspect","render","preview","deliver","compare","export","verify","examples"] as const;export type Command=typeof COMMANDS[number];
export interface CommandContext{ir?:DiagramIR;snapshot?:RepositorySnapshot;before?:DiagramIR;after?:DiagramIR;format?:"html"|"svg"}
export function compareIR(before:DiagramIR,after:DiagramIR){const bn=new Map(before.nodes.map(n=>[n.id,n])),an=new Map(after.nodes.map(n=>[n.id,n])),br=new Map(before.relationships.map(r=>[r.id,r])),ar=new Map(after.relationships.map(r=>[r.id,r]));return{before:{nodes:before.nodes.length,relationships:before.relationships.length},delta:{addedNodes:[...an.keys()].filter(k=>!bn.has(k)),removedNodes:[...bn.keys()].filter(k=>!an.has(k)),addedRelationships:[...ar.keys()].filter(k=>!br.has(k)),removedRelationships:[...br.keys()].filter(k=>!ar.has(k))},after:{nodes:after.nodes.length,relationships:after.relationships.length}}}
export async function runCommand(command:Command,c:CommandContext={}):Promise<unknown>{switch(command){
 case"doctor":return{ok:true,commands:[...COMMANDS]};
 case"guide":return{pipeline:"Input → Analysis → Typed IR → Validation → Layout → SVG → Interactive Viewer → Verification → Self-contained HTML"};
 case"create":return{version:"1.0",kind:"architecture",document:{title:"Untitled"},nodes:[],relationships:[],boundaries:[],evidence:[],presentation:{}} satisfies DiagramIR;
 case"analyze":if(!c.snapshot)throw Error("SNAPSHOT_REQUIRED");{const a=analyzeRepository(c.snapshot);return analysisToArchitectureIR(c.snapshot,a)}
 case"validate":if(!c.ir)throw Error("IR_REQUIRED");return validateDiagramIR(c.ir);
 case"inspect":if(!c.ir)throw Error("IR_REQUIRED");return{kind:c.ir.kind,nodes:c.ir.nodes.length,relationships:c.ir.relationships.length,evidence:c.ir.evidence.length};
 case"render":if(!c.ir)throw Error("IR_REQUIRED");return renderDiagram(c.ir,layoutDiagram(c.ir));
 case"preview":if(!c.ir)throw Error("IR_REQUIRED");return createSelfContainedHtml(c.ir,layoutDiagram(c.ir));
 case"deliver":if(!c.ir)throw Error("IR_REQUIRED");{const a=exportHtml(c.ir,layoutDiagram(c.ir));return{artifact:a,errors:validateExport(a)}}
 case"compare":if(!c.before||!c.after)throw Error("BEFORE_AFTER_REQUIRED");return compareIR(c.before,c.after);
 case"export":if(!c.ir)throw Error("IR_REQUIRED");return c.format==="svg"?exportSvg(c.ir,layoutDiagram(c.ir)):exportHtml(c.ir,layoutDiagram(c.ir));
 case"verify":if(!c.ir)throw Error("IR_REQUIRED");return verifyHtmlStructure(createSelfContainedHtml(c.ir,layoutDiagram(c.ir)));
 case"examples":return[{name:"minimal-architecture",kind:"architecture"}];
 default:throw Error("COMMAND_UNKNOWN");
}}
