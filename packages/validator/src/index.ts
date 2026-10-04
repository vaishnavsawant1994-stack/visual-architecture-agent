import type { Diagnostic, DiagramIR, ValidationResult } from "@visual-architecture/ir";
import { schemaAcceptsShape } from "@visual-architecture/schemas";

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
