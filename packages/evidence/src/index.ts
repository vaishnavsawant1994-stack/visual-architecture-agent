import type {Evidence,EvidenceClassification} from "@visual-architecture/ir";

export interface SourceRange{repository:string;commitSha:string;file:string;lineStart:number;lineEnd:number;blobSha:string;contentHash:string;excerpt?:string}
export interface Finding{id:string;kind:string;label:string;classification:EvidenceClassification;confidence:number;source:SourceRange;metadata?:Record<string,unknown>}

export function evidenceFromFinding(f:Finding,nodeId?:string,relationshipId?:string):Evidence{
 return{id:`evidence-${f.id}`,classification:f.classification,repository:f.source.repository,commitSha:f.source.commitSha,file:f.source.file,lineStart:f.source.lineStart,lineEnd:f.source.lineEnd,blobSha:f.source.blobSha,contentHash:f.source.contentHash,...(nodeId===undefined?{}:{nodeId}),...(relationshipId===undefined?{}:{relationshipId}),confidence:f.confidence,...(f.source.excerpt===undefined?{}:{excerpt:f.source.excerpt})};
}
export function validatePinnedEvidence(e:Evidence):string[]{
 const errors:string[]=[];
 if(!e.repository)errors.push("EVIDENCE_REPOSITORY_MISSING");
 if(!e.commitSha)errors.push("EVIDENCE_COMMIT_MISSING");
 if(!e.file)errors.push("EVIDENCE_FILE_MISSING");
 if(!e.blobSha)errors.push("EVIDENCE_BLOB_MISSING");
 if(!e.contentHash)errors.push("EVIDENCE_CONTENT_HASH_MISSING");
 if((e.lineStart??0)<1||(e.lineEnd??0)<(e.lineStart??1))errors.push("EVIDENCE_RANGE_INVALID");
 return errors;
}
export function assertClassification(value:string):EvidenceClassification{
 if(value==="VERIFIED"||value==="INFERRED"||value==="USER_SUPPLIED"||value==="UNKNOWN")return value;
 return "UNKNOWN";
}
