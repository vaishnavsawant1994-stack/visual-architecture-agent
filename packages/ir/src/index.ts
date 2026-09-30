export const IR_VERSION = "1.0" as const;
export const DIAGRAM_KINDS = ["architecture","workflow","sequence","data-flow","lifecycle"] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];
export type EvidenceClassification = "VERIFIED"|"INFERRED"|"USER_SUPPLIED"|"UNKNOWN";

export interface Evidence {
  id:string; classification:EvidenceClassification; repository?:string; commitSha?:string;
  file?:string; lineStart?:number; lineEnd?:number; blobSha?:string; contentHash?:string;
  nodeId?:string; relationshipId?:string; confidence?:number; excerpt?:string;
}
export interface DiagramDocument { title:string; description?:string; }
export interface DiagramNode { id:string; type:string; label:string; description?:string; evidenceIds?:string[]; metadata?:Record<string,unknown>; }
export interface DiagramRelationship { id:string; source:string; target:string; type:string; label?:string; evidenceIds?:string[]; metadata?:Record<string,unknown>; }
export interface DiagramBoundary { id:string; type:string; label:string; nodeIds?:string[]; boundaryIds?:string[]; metadata?:Record<string,unknown>; }
export interface Presentation {
  preset?:"classic"|"signal"|"blueprint"|"editorial"; theme?:"dark"|"light"|"presentation";
  reducedMotion?:boolean; locale?:"en"|"hi"|"mr"|"zh"|"ja"|"es"|string;
}
export interface DiagramIR {
  version:typeof IR_VERSION; kind:DiagramKind; document:DiagramDocument; nodes:DiagramNode[];
  relationships:DiagramRelationship[]; boundaries:DiagramBoundary[]; evidence:Evidence[]; presentation:Presentation;
}
export type DiagnosticSeverity = "error"|"warning";
export type DiagnosticStage = "schema"|"semantic"|"relationship"|"graph"|"layout"|"svg"|"artifact";
export interface Diagnostic {
  stage:DiagnosticStage; code:string; severity:DiagnosticSeverity; subject?:string;
  message:string; fixes?:string[]; path?:string;
}
export interface ValidationResult { valid:boolean; diagnostics:Diagnostic[]; normalized?:DiagramIR; }
export function isDiagramKind(value:unknown):value is DiagramKind {
  return typeof value==="string" && (DIAGRAM_KINDS as readonly string[]).includes(value);
}
