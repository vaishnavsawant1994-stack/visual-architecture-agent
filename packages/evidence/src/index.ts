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
 if(typeof e.confidence==="number"&&(e.confidence<0||e.confidence>1))errors.push("EVIDENCE_CONFIDENCE_INVALID");
 return errors;
}
export function assertClassification(value:string):EvidenceClassification{
 if(value==="VERIFIED"||value==="INFERRED"||value==="USER_SUPPLIED"||value==="UNKNOWN")return value;
 return "UNKNOWN";
}
export function canonicalEvidence(items:Evidence[]):Evidence[]{return [...items].sort((a,b)=>[a.repository,a.commitSha,a.file,a.lineStart,a.id].join(":").localeCompare([b.repository,b.commitSha,b.file,b.lineStart,b.id].join(":")))}
export function verifyEvidenceAgainstContent(e:Evidence,content:string,hash:(s:string)=>string):string[]{
 const errors=validatePinnedEvidence(e);if(errors.length)return errors;
 const lines=content.replace(/\r\n/g,"\n").split("\n");const start=e.lineStart!,end=e.lineEnd!;
 if(end>lines.length)return["EVIDENCE_RANGE_OUT_OF_BOUNDS"];
 const excerpt=lines.slice(start-1,end).join("\n");
 if(e.excerpt!==undefined&&excerpt.slice(0,300)!==e.excerpt)return["EVIDENCE_EXCERPT_MISMATCH"];
 if(hash(content)!==e.contentHash)return["EVIDENCE_CONTENT_HASH_MISMATCH"];
 return[];
}
