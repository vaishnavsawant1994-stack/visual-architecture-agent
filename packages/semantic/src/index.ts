import type { Diagnostic, DiagramIR, DiagramKind } from "@visual-architecture/ir";

export type SemanticEngine = { kind: DiagramKind; validate(ir: DiagramIR): Diagnostic[] };

const error=(code:string,subject:string,message:string):Diagnostic=>({stage:"semantic",code,severity:"error",subject,message});
const nodeTypes=(ir:DiagramIR)=>new Set(ir.nodes.map(n=>n.type));
const relationshipTypes=(ir:DiagramIR)=>new Set(ir.relationships.map(r=>r.type));

export const architectureEngine:SemanticEngine={
 kind:"architecture",
 validate(ir){
  const out:Diagnostic[]=[];
  if(ir.nodes.length===0) out.push(error("ARCHITECTURE_EMPTY","nodes","Architecture requires at least one component."));
  for(const b of ir.boundaries) for(const id of b.nodeIds??[]) if(!ir.nodes.some(n=>n.id===id)) out.push(error("ARCHITECTURE_BOUNDARY_NODE_MISSING",b.id,`Boundary references missing node "${id}".`));
  return out;
 }
};

export const workflowEngine:SemanticEngine={
 kind:"workflow",
 validate(ir){
  const out:Diagnostic[]=[];
  const allowed=new Set(["step","decision","start","end","lane","phase"]);
  for(const n of ir.nodes) if(!allowed.has(n.type)) out.push(error("WORKFLOW_NODE_TYPE_INVALID",n.id,`Workflow node type "${n.type}" is not valid.`));
  if(!nodeTypes(ir).has("start")) out.push(error("WORKFLOW_START_MISSING","nodes","Workflow requires a start node."));
  return out;
 }
};

export const sequenceEngine:SemanticEngine={
 kind:"sequence",
 validate(ir){
  const out:Diagnostic[]=[];
  const allowedRelations=new Set(["message","reply","async-message","create","destroy"]);
  for(const r of ir.relationships) if(!allowedRelations.has(r.type)) out.push(error("SEQUENCE_MESSAGE_TYPE_INVALID",r.id,`Sequence relationship type "${r.type}" is not valid.`));
  if(ir.nodes.length<2) out.push(error("SEQUENCE_PARTICIPANTS_INSUFFICIENT","nodes","Sequence requires at least two participants."));
  return out;
 }
};

export const dataFlowEngine:SemanticEngine={
 kind:"data-flow",
 validate(ir){
  const out:Diagnostic[]=[];
  const allowedNodes=new Set(["source","process","store","destination","stage"]);
  for(const n of ir.nodes) if(!allowedNodes.has(n.type)) out.push(error("DATA_FLOW_NODE_TYPE_INVALID",n.id,`Data-flow node type "${n.type}" is not valid.`));
  for(const r of ir.relationships) if(r.type!=="flow") out.push(error("DATA_FLOW_RELATION_TYPE_INVALID",r.id,"Data-flow relationships must use type flow."));
  return out;
 }
};

export const lifecycleEngine:SemanticEngine={
 kind:"lifecycle",
 validate(ir){
  const out:Diagnostic[]=[];
  const states=new Set(["START","ACTIVE","WAITING","RETRYING","FAILED","CANCELLED","COMPLETED"]);
  for(const n of ir.nodes) if(n.type!=="state" || typeof n.metadata?.state!=="string" || !states.has(n.metadata.state)) out.push(error("LIFECYCLE_STATE_INVALID",n.id,"Lifecycle nodes must be state nodes with a recognized metadata.state."));
  if(!ir.nodes.some(n=>n.metadata?.state==="START")) out.push(error("LIFECYCLE_START_MISSING","nodes","Lifecycle requires START."));
  return out;
 }
};

export const semanticEngines:Record<DiagramKind,SemanticEngine>={
 architecture:architectureEngine,workflow:workflowEngine,sequence:sequenceEngine,"data-flow":dataFlowEngine,lifecycle:lifecycleEngine
};

export function validateSemantics(ir:DiagramIR):Diagnostic[]{
 return semanticEngines[ir.kind].validate(ir);
}

export function compileSemanticGraph(ir:DiagramIR){
 const diagnostics=validateSemantics(ir);
 return {kind:ir.kind,nodes:ir.nodes,relationships:ir.relationships,boundaries:ir.boundaries,diagnostics,valid:!diagnostics.some(d=>d.severity==="error")};
}
