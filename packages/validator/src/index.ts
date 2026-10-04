import type { Diagnostic, DiagramIR, ValidationResult } from "@visual-architecture/ir";
import { schemaAcceptsShape } from "@visual-architecture/schemas";
import { validateSemantics } from "@visual-architecture/semantic";
import { layoutDiagram } from "@visual-architecture/layout";
import { renderDiagram, validateRenderResult } from "@visual-architecture/renderer";
import { exportHtml, validateExport } from "@visual-architecture/exporter";

const ROOT_KEYS=new Set(["version","kind","document","nodes","relationships","boundaries","evidence","presentation"]);

export function validateDiagramIR(input:unknown):ValidationResult {
  const diagnostics:Diagnostic[]=[];
  if(!schemaAcceptsShape(input)){
    diagnostics.push({stage:"schema",code:"SCHEMA_ROOT_INVALID",severity:"error",
      message:"Diagram IR must contain the complete required root shape.",
      fixes:["Provide version, kind, document, nodes, relationships, boundaries, evidence, and presentation."]});
    return {valid:false,diagnostics};
  }
  const value=input as Record<string,unknown>;
  const checkUnknown = (object:unknown, allowed:Set<string>, path:string) => {
    if (!object || typeof object !== "object" || Array.isArray(object)) return;
    for (const key of Object.keys(object as Record<string,unknown>)) {
      if (!allowed.has(key)) diagnostics.push({
        stage:"schema", code:"SCHEMA_UNKNOWN_FIELD", severity:"error", subject:key,
        path:`${path}.${key}`, message:`Unknown field "${key}" is not permitted at ${path}.`,
        fixes:["Remove the field or update the schema intentionally."]
      });
    }
  };
  checkUnknown(value, ROOT_KEYS, "$");
  if(value.version!=="1.0")
    diagnostics.push({stage:"schema",code:"SCHEMA_VERSION_UNSUPPORTED",severity:"error",subject:"version",
      message:"Only Typed IR version 1.0 is currently accepted."});
  if(!["architecture","workflow","sequence","data-flow","lifecycle"].includes(String(value.kind)))
    diagnostics.push({stage:"schema",code:"SCHEMA_KIND_INVALID",severity:"error",subject:"kind",
      message:"Diagram kind must be architecture, workflow, sequence, data-flow, or lifecycle."});

  const nodes=Array.isArray(value.nodes)?value.nodes:[], relationships=Array.isArray(value.relationships)?value.relationships:[];
  const nodeKeys=new Set(["id","type","label","description","evidenceIds","metadata"]);
  const relationshipKeys=new Set(["id","source","target","type","label","evidenceIds","metadata"]);
  const boundaryKeys=new Set(["id","type","label","nodeIds","boundaryIds","metadata"]);
  const evidenceKeys=new Set(["id","classification","repository","commitSha","file","lineStart","lineEnd","blobSha","contentHash","nodeId","relationshipId","confidence","excerpt"]);
  const presentationKeys=new Set(["preset","theme","reducedMotion","locale"]);
  checkUnknown(value.document,new Set(["title","description"]), "document");
  checkUnknown(value.presentation,presentationKeys,"presentation");
  if (Array.isArray(value.nodes)) for (let i=0;i<nodes.length;i++) checkUnknown(nodes[i],nodeKeys,`nodes[${i}]`);
  if (Array.isArray(value.relationships)) for (let i=0;i<relationships.length;i++) checkUnknown(relationships[i],relationshipKeys,`relationships[${i}]`);
  if (Array.isArray(value.boundaries)) for (let i=0;i<value.boundaries.length;i++) checkUnknown(value.boundaries[i],boundaryKeys,`boundaries[${i}]`);
  if (Array.isArray(value.evidence)) for (let i=0;i<value.evidence.length;i++) checkUnknown(value.evidence[i],evidenceKeys,`evidence[${i}]`);
  const nodeIds=new Set<string>(), relationshipIds=new Set<string>();
  for(const node of nodes){
    if(!node||typeof node!=="object"){diagnostics.push({stage:"schema",code:"NODE_INVALID",severity:"error",message:"Every node must be an object."});continue;}
    const n=node as Record<string,unknown>, id=typeof n.id==="string"?n.id:"";
    if(!id){diagnostics.push({stage:"schema",code:"NODE_ID_MISSING",severity:"error",message:"Every node must have a durable non-empty id."});continue;}
    if(nodeIds.has(id)) diagnostics.push({stage:"semantic",code:"NODE_ID_DUPLICATE",severity:"error",subject:id,message:`Node id "${id}" is duplicated.`});
    nodeIds.add(id);
  }
  for(const relationship of relationships){
    if(!relationship||typeof relationship!=="object"){diagnostics.push({stage:"schema",code:"RELATIONSHIP_INVALID",severity:"error",message:"Every relationship must be an object."});continue;}
    const r=relationship as Record<string,unknown>, id=typeof r.id==="string"?r.id:"", source=typeof r.source==="string"?r.source:"", target=typeof r.target==="string"?r.target:"";
    if(!id||!source||!target){diagnostics.push({stage:"schema",code:"RELATIONSHIP_FIELDS_MISSING",severity:"error",message:"Every relationship requires id, source, target, and type."});continue;}
    if(relationshipIds.has(id)) diagnostics.push({stage:"semantic",code:"RELATIONSHIP_ID_DUPLICATE",severity:"error",subject:id,message:`Relationship id "${id}" is duplicated.`});
    relationshipIds.add(id);
    if(!nodeIds.has(source)||!nodeIds.has(target))
      diagnostics.push({stage:"relationship",code:"RELATION_TARGET_MISSING",severity:"error",subject:id,
        message:`Relationship "${id}" references a missing source or target node.`,
        fixes:["Create the referenced node or correct the relationship endpoint."]});
  }
  const valid=diagnostics.every(d=>d.severity!=="error");
  return valid?{valid:true,diagnostics,normalized:input as DiagramIR}:{valid:false,diagnostics};
}

export interface PipelineValidationResult extends ValidationResult { stages:Record<string,{valid:boolean;diagnostics:Diagnostic[]}>; deliveryEligible:boolean }
const durable=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validatePipeline(input:unknown):PipelineValidationResult{
 const base=validateDiagramIR(input),stages:PipelineValidationResult["stages"]={schema:{valid:base.valid,diagnostics:[...base.diagnostics]}};
 if(!base.valid||!base.normalized)return{...base,stages,deliveryEligible:false};
 const ir=base.normalized,idDiagnostics:Diagnostic[]=[];
 const ids=[...ir.nodes.map(n=>({id:n.id,path:"nodes"})),...ir.relationships.map(r=>({id:r.id,path:"relationships"})),...ir.boundaries.map(b=>({id:b.id,path:"boundaries"})),...ir.evidence.map(e=>({id:e.id,path:"evidence"}))];
 for(const x of ids)if(!durable.test(x.id))idDiagnostics.push({stage:"id",code:"DURABLE_ID_INVALID",severity:"error",subject:x.id,path:x.path,message:"IDs must use lowercase durable kebab-case.",fixes:["rename-id"]});
 stages.id={valid:!idDiagnostics.length,diagnostics:idDiagnostics};
 const ref:Diagnostic[]=[];
 const evidenceIds=new Set(ir.evidence.map(e=>e.id)),boundaryIds=new Set(ir.boundaries.map(b=>b.id)),nodeIds=new Set(ir.nodes.map(n=>n.id));
 for(const n of ir.nodes)for(const e of n.evidenceIds??[])if(!evidenceIds.has(e))ref.push({stage:"relationship",code:"EVIDENCE_REFERENCE_MISSING",severity:"error",subject:n.id,message:"Node references missing evidence.",context:{evidenceId:e}});
 for(const r of ir.relationships)for(const e of r.evidenceIds??[])if(!evidenceIds.has(e))ref.push({stage:"relationship",code:"EVIDENCE_REFERENCE_MISSING",severity:"error",subject:r.id,message:"Relationship references missing evidence.",context:{evidenceId:e}});
 for(const b of ir.boundaries){for(const n of b.nodeIds??[])if(!nodeIds.has(n))ref.push({stage:"relationship",code:"BOUNDARY_NODE_MISSING",severity:"error",subject:b.id,message:"Boundary references missing node.",context:{nodeId:n}});for(const nested of b.boundaryIds??[])if(!boundaryIds.has(nested)||nested===b.id)ref.push({stage:"relationship",code:"BOUNDARY_REFERENCE_INVALID",severity:"error",subject:b.id,message:"Boundary references missing/self boundary.",context:{boundaryId:nested}})}
 stages.relationship={valid:!ref.length,diagnostics:ref};
 const model=validateSemantics(ir).map(d=>({...d,stage:"model" as const}));stages.model={valid:!model.some(d=>d.severity==="error"),diagnostics:model};
 const graph:Diagnostic[]=[];const adjacency=new Map(ir.nodes.map(n=>[n.id,[] as string[]]));for(const r of ir.relationships)adjacency.get(r.source)?.push(r.target);
 if(ir.nodes.length&&ir.kind!=="architecture"){const reached=new Set<string>(),q=[ir.nodes[0]!.id];while(q.length){const n=q.shift()!;if(reached.has(n))continue;reached.add(n);q.push(...(adjacency.get(n)??[]))}if(reached.size<ir.nodes.length)graph.push({stage:"graph",code:"GRAPH_DISCONNECTED",severity:"warning",message:"Graph contains nodes not reachable from the first authored node."})}
 stages.graph={valid:!graph.some(d=>d.severity==="error"),diagnostics:graph};
 let layoutDiagnostics:Diagnostic[]=[],svgDiagnostics:Diagnostic[]=[],artifactDiagnostics:Diagnostic[]=[];
 try{const layout=layoutDiagram(ir);if(!(layout.width>0&&layout.height>0)||layout.nodes.some(n=>![n.x,n.y,n.width,n.height].every(Number.isFinite)))layoutDiagnostics.push({stage:"layout",code:"LAYOUT_INVALID",severity:"error",message:"Layout produced invalid geometry."});const rendered=renderDiagram(ir,layout);svgDiagnostics=validateRenderResult(rendered,ir.kind,layout.geometryHash).map(code=>({stage:"svg",code,severity:"error",message:code}));const artifact=exportHtml(ir,layout);artifactDiagnostics=validateExport(artifact).map(code=>({stage:"artifact",code,severity:"error",message:code}));}catch(error){layoutDiagnostics.push({stage:"layout",code:"LAYOUT_EXCEPTION",severity:"error",message:error instanceof Error?error.message:"Layout failed safely."})}
 stages.layout={valid:!layoutDiagnostics.length,diagnostics:layoutDiagnostics};stages.svg={valid:!svgDiagnostics.length,diagnostics:svgDiagnostics};stages.artifact={valid:!artifactDiagnostics.length,diagnostics:artifactDiagnostics};
 const all=Object.values(stages).flatMap(s=>s.diagnostics),deliveryEligible=!all.some(d=>d.severity==="error");stages.delivery={valid:deliveryEligible,diagnostics:deliveryEligible?[]:[{stage:"delivery",code:"DELIVERY_INELIGIBLE",severity:"error",message:"Candidate failed one or more qualification stages."}]};
 return{valid:deliveryEligible,diagnostics:[...all,...stages.delivery.diagnostics],normalized:deliveryEligible?ir:undefined,stages,deliveryEligible};
}
