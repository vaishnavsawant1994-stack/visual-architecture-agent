import type {DiagramIR,DiagramNode,DiagramRelationship,EvidenceClassification} from "@visual-architecture/ir";
import {evidenceFromFinding,type Finding,type SourceRange} from "@visual-architecture/evidence";

export interface RepositoryFile{path:string;content:string;blobSha:string;contentHash:string}
export interface RepositorySnapshot{repository:string;commitSha:string;files:RepositoryFile[]}
export interface Analysis{languages:string[];dependencies:string[];entryPoints:Finding[];modules:Finding[];runtime:Finding[];security:Finding[];findings:Finding[]}

const extLanguage:Record<string,string>={".ts":"TypeScript",".tsx":"TypeScript",".js":"JavaScript",".jsx":"JavaScript",".py":"Python",".go":"Go",".rs":"Rust",".java":"Java",".kt":"Kotlin",".rb":"Ruby",".php":"PHP",".cs":"C#"};
const source=(s:RepositorySnapshot,f:RepositoryFile,lineStart=1,lineEnd=1):SourceRange=>({repository:s.repository,commitSha:s.commitSha,file:f.path,lineStart,lineEnd,blobSha:f.blobSha,contentHash:f.contentHash,excerpt:f.content.split("\n").slice(lineStart-1,lineEnd).join("\n").slice(0,300)});
const finding=(s:RepositorySnapshot,f:RepositoryFile,id:string,kind:string,label:string,classification:EvidenceClassification,confidence:number,metadata?:Record<string,unknown>):Finding=>({id,kind,label,classification,confidence,source:source(s,f),metadata});
const safeId=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||"module";

export function analyzeRepository(snapshot:RepositorySnapshot):Analysis{
 const languages=new Set<string>(),dependencies=new Set<string>();const entryPoints:Finding[]=[],modules:Finding[]=[],runtime:Finding[]=[],security:Finding[]=[];
 for(const f of snapshot.files){
  const ext=Object.keys(extLanguage).find(e=>f.path.endsWith(e));if(ext)languages.add(extLanguage[ext]!);
  if(f.path.endsWith("package.json")){try{const p=JSON.parse(f.content);for(const k of Object.keys({...p.dependencies,...p.devDependencies}))dependencies.add(k)}catch{}}
  if(/(^|\/)(main|index|server|app|cli)\.(ts|tsx|js|jsx|py|go|rs|java)$/.test(f.path))entryPoints.push(finding(snapshot,f,`entry-${safeId(f.path)}`,"entrypoint",f.path,"VERIFIED",1));
  if(/(^|\/)src\//.test(f.path)&&ext)modules.push(finding(snapshot,f,`module-${safeId(f.path)}`,"module",f.path,"VERIFIED",.95));
  const c=f.content;
  if(/\b(fetch|axios|http\.|https\.|createServer|listen\()/.test(c))runtime.push(finding(snapshot,f,`runtime-${safeId(f.path)}`,"runtime","Network/runtime interaction","INFERRED",.7,{signal:"network"}));
  if(/\b(postgres|postgresql|prisma|sqlite|mongodb|redis)\b/i.test(c))runtime.push(finding(snapshot,f,`storage-${safeId(f.path)}`,"storage","Persistent data dependency","INFERRED",.75,{signal:"storage"}));
  if(/\b(auth|oauth|jwt|session|permission|authorize|rbac|csrf|cors)\b/i.test(c))security.push(finding(snapshot,f,`security-${safeId(f.path)}`,"security","Authentication/authorization boundary","INFERRED",.7,{signal:"trust-boundary"}));
  if(/\b(openai|anthropic|gemini|llm|embedding|vector)\b/i.test(c))runtime.push(finding(snapshot,f,`ai-${safeId(f.path)}`,"ai","AI/model integration","INFERRED",.7,{signal:"ai"}));
 }
 const findings=[...entryPoints,...modules,...runtime,...security];return{languages:[...languages].sort(),dependencies:[...dependencies].sort(),entryPoints,modules,runtime,security,findings};
}

export function analysisToArchitectureIR(snapshot:RepositorySnapshot,a:Analysis):DiagramIR{
 const selected=[...a.entryPoints,...a.runtime,...a.security];const seen=new Set<string>();const nodes:DiagramNode[]=[];
 for(const f of selected){const id=safeId(f.id);if(seen.has(id))continue;seen.add(id);nodes.push({id,type:f.kind==="security"?"trust":f.kind,label:f.label,evidenceIds:[`evidence-${f.id}`],metadata:{classification:f.classification,confidence:f.confidence}})}
 const relationships:DiagramRelationship[]=[];const first=nodes[0];if(first)for(const n of nodes.slice(1))relationships.push({id:`${first.id}-to-${n.id}`,source:first.id,target:n.id,type:"inferred-association",metadata:{classification:"INFERRED",confidence:.4}});
 const evidence=selected.map(f=>evidenceFromFinding(f,safeId(f.id)));
 return{version:"1.0",kind:"architecture",document:{title:`Repository architecture: ${snapshot.repository}`,description:`Revision ${snapshot.commitSha}`},nodes,relationships,boundaries:a.security.length?[{id:"trust-boundary",type:"trust",label:"Detected trust boundary",nodeIds:nodes.filter(n=>n.type==="trust").map(n=>n.id)}]:[],evidence,presentation:{}};
}

export function assertReadOnlySnapshot(snapshot:RepositorySnapshot):string[]{const errors:string[]=[];if(!snapshot.repository)errors.push("REPOSITORY_MISSING");if(!snapshot.commitSha)errors.push("COMMIT_SHA_MISSING");for(const f of snapshot.files){if(f.path.startsWith("/")||f.path.includes("../"))errors.push("FILESYSTEM_ESCAPE");if(!f.blobSha||!f.contentHash)errors.push("FILE_IDENTITY_MISSING");}return errors;}
