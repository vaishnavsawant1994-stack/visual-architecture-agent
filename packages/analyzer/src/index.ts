import type {DiagramIR,DiagramNode,DiagramRelationship,EvidenceClassification} from "@visual-architecture/ir";
import {evidenceFromFinding,canonicalEvidence,type Finding,type SourceRange} from "@visual-architecture/evidence";

export interface RepositoryFile{path:string;content:string;blobSha:string;contentHash:string;symlinkTarget?:string;generated?:boolean;vendored?:boolean}
export interface RepositorySnapshot{repository:string;commitSha:string;files:RepositoryFile[];root?:string}
export interface AnalyzerDiagnostic{code:string;severity:"error"|"warning";file?:string;message:string}
export interface DependencyRecord{name:string;scope:"runtime"|"development"|"workspace";file:string}
export interface ProjectBoundary{id:string;root:string;manifest?:string}
export interface Analysis{languages:string[];dependencies:string[];dependencyRecords:DependencyRecord[];projects:ProjectBoundary[];entryPoints:Finding[];modules:Finding[];runtime:Finding[];security:Finding[];relationships:Finding[];diagnostics:AnalyzerDiagnostic[];findings:Finding[]}

const extLanguage:Record<string,string>={".ts":"TypeScript",".tsx":"TypeScript",".js":"JavaScript",".jsx":"JavaScript",".py":"Python",".go":"Go",".rs":"Rust",".java":"Java"};
const IGNORE=/(^|\/)(node_modules|vendor|dist|build|coverage|\.cache|target)(\/|$)/;
const MAX_FILES=5000,MAX_BYTES=1_000_000,MAX_DEPTH=40;
const safeId=(s:string)=>s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||"module";
const lines=(s:string)=>s.replace(/\r\n/g,"\n").split("\n");
const lineOf=(content:string,needle:string)=>{const ls=lines(content);const i=ls.findIndex(x=>x.includes(needle));return i<0?1:i+1};
const source=(s:RepositorySnapshot,f:RepositoryFile,lineStart:number,lineEnd=lineStart):SourceRange=>({repository:s.repository,commitSha:s.commitSha,file:f.path,lineStart,lineEnd,blobSha:f.blobSha,contentHash:f.contentHash,excerpt:lines(f.content).slice(lineStart-1,lineEnd).join("\n").slice(0,300)});
const finding=(s:RepositorySnapshot,f:RepositoryFile,id:string,kind:string,label:string,classification:EvidenceClassification,confidence:number,line=1,metadata?:Record<string,unknown>):Finding=>({id,kind,label,classification,confidence,source:source(s,f,line),...(metadata?{metadata}:{})});
const stripComments=(c:string)=>c.replace(/\/\*[\s\S]*?\*\//g,"").replace(/(^|\s)\/\/.*$/gm,"$1").replace(/^\s*#.*$/gm,"");
const redact=(s:string)=>s.replace(/((?:api[_-]?key|token|password|secret|private[_-]?key)\s*[:=]\s*)[^\s,;"']+/gi,"$1[REDACTED]").replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/gi,"$1[REDACTED]@");
const pathUnsafe=(p:string)=>p.startsWith("/")||p.startsWith("\\")||p.split("/").some(x=>x==="..")||p.split("/").length>MAX_DEPTH;
const ignored=(f:RepositoryFile)=>f.generated||f.vendored||IGNORE.test(f.path);
const importSignals=(c:string)=>[...c.matchAll(/(?:import\s+(?:[^"'\n]+?\s+from\s+)?|require\s*\()\s*["']([^"']+)["']/g)].map(m=>({name:m[1]!,index:m.index??0}));
const manifestRoot=(p:string)=>p.includes("/")?p.slice(0,p.lastIndexOf("/")):".";

export function assertReadOnlySnapshot(snapshot:RepositorySnapshot):string[]{const errors:string[]=[];if(!snapshot.repository)errors.push("REPOSITORY_MISSING");if(!snapshot.commitSha)errors.push("COMMIT_SHA_MISSING");if(snapshot.files.length>MAX_FILES)errors.push("FILE_LIMIT_EXCEEDED");for(const f of snapshot.files){if(pathUnsafe(f.path)||f.symlinkTarget&&pathUnsafe(f.symlinkTarget))errors.push("FILESYSTEM_ESCAPE");if(!f.blobSha||!f.contentHash)errors.push("FILE_IDENTITY_MISSING");if(f.content.length>MAX_BYTES)errors.push("FILE_SIZE_LIMIT_EXCEEDED");}return [...new Set(errors)];}

export function analyzeRepository(snapshot:RepositorySnapshot):Analysis{
 const diagnostics:AnalyzerDiagnostic[]=assertReadOnlySnapshot(snapshot).map(code=>({code,severity:"error",message:code}));
 const languages=new Set<string>(),deps:DependencyRecord[]=[],projects:ProjectBoundary[]=[],entryPoints:Finding[]=[],modules:Finding[]=[],runtime:Finding[]=[],security:Finding[]=[],relationships:Finding[]=[];
 const usable=[...snapshot.files].filter(f=>!ignored(f)&&!pathUnsafe(f.path)&&f.content.length<=MAX_BYTES).sort((a,b)=>a.path.localeCompare(b.path));
 const knownPaths=new Set(usable.map(f=>f.path.replace(/\.[^.\/]+$/,"")));
 for(const f of usable){
  const ext=Object.keys(extLanguage).find(e=>f.path.endsWith(e));if(ext)languages.add(extLanguage[ext]!);
  if(f.path.endsWith("package.json")){projects.push({id:`project-${safeId(manifestRoot(f.path))}`,root:manifestRoot(f.path),manifest:f.path});try{const p=JSON.parse(f.content);for(const [scope,obj] of [["runtime",p.dependencies],["development",p.devDependencies],["workspace",p.peerDependencies]] as const)for(const name of Object.keys(obj??{}))deps.push({name,scope,file:f.path})}catch{diagnostics.push({code:"MALFORMED_MANIFEST",severity:"error",file:f.path,message:"package.json is not valid JSON"})}}
  if(/(^|\/)(pyproject\.toml|go\.mod|Cargo\.toml|pom\.xml)$/.test(f.path))projects.push({id:`project-${safeId(manifestRoot(f.path))}`,root:manifestRoot(f.path),manifest:f.path});
  if(/(^|\/)(main|index|server|app|cli|worker)\.(ts|tsx|js|jsx|py|go|rs|java)$/.test(f.path)){const token=f.path.split("/").pop()!;entryPoints.push(finding(snapshot,f,`entry-${safeId(f.path)}`,"entrypoint",f.path,"INFERRED",.75,lineOf(f.content,token.split(".")[0]!),{reason:"conventional-entrypoint-name"}))}
  if((/(^|\/)src\//.test(f.path)||ext)&&ext)modules.push(finding(snapshot,f,`module-${safeId(f.path)}`,"module",f.path,"VERIFIED",1,1,{reason:"source-file"}));
  const c=stripComments(f.content),safe=redact(c);
  for(const im of importSignals(c)){const ln=lines(c.slice(0,im.index)).length;const internal=im.name.startsWith(".")||im.name.startsWith("@/");relationships.push(finding(snapshot,f,`import-${safeId(f.path)}-${safeId(im.name)}`,"relationship",`${f.path} imports ${im.name}`,"VERIFIED",1,ln,{relationType:"imports",target:im.name,internal,resolved:internal?[...knownPaths].some(p=>p.endsWith(im.name.replace(/^\.\//,""))):true}))}
  const signals:[RegExp,string,string,number][]=[[/\b(fetch\s*\(|axios\.|createServer\s*\(|listen\s*\()/,"runtime","configured network/runtime interaction",.8],[/\b(prisma\.|new\s+PrismaClient|pg\.Pool|postgres\s*\(|sqlite|mongodb|redis)\b/i,"storage","configured storage/data client",.85],[/\b(authenticate|authorize|jwt\.verify|session\s*\(|rbac|permission)\b/i,"security","authentication/authorization control",.8],[/\b(openai\.|anthropic\.|gemini\.|embedding\s*\()/i,"external","configured AI/provider integration",.8]];
  for(const [re,kind,label,confidence] of signals){const m=safe.match(re);if(m){const ln=lineOf(safe,m[0]);const item=finding(snapshot,f,`${kind}-${safeId(f.path)}-${ln}`,kind,label,"INFERRED",confidence,ln,{reason:`${kind}-static-signal`});(kind==="security"?security:runtime).push(item)}}
  if(/\.(env|pem|key)$/.test(f.path))diagnostics.push({code:"SENSITIVE_FILE_REDACTED",severity:"warning",file:f.path,message:"Sensitive file excluded from evidence excerpts"});
 }
 for(const f of usable)if(!Object.values(extLanguage).some(l=>languages.has(l))&&/\.[a-z0-9]+$/i.test(f.path)&&!/(json|md|yml|yaml|toml|lock)$/.test(f.path))diagnostics.push({code:"UNSUPPORTED_LANGUAGE",severity:"warning",file:f.path,message:"Source language is not supported"});
 const all=[...entryPoints,...modules,...runtime,...security,...relationships].sort((a,b)=>a.id.localeCompare(b.id));
 return{languages:[...languages].sort(),dependencies:[...new Set(deps.map(d=>d.name))].sort(),dependencyRecords:deps.sort((a,b)=>[a.file,a.scope,a.name].join(":").localeCompare([b.file,b.scope,b.name].join(":"))),projects:projects.sort((a,b)=>a.root.localeCompare(b.root)),entryPoints,modules,runtime,security,relationships,diagnostics:diagnostics.sort((a,b)=>[a.code,a.file??""].join(":").localeCompare([b.code,b.file??""].join(":"))),findings:all};
}

export function analysisToArchitectureIR(snapshot:RepositorySnapshot,a:Analysis):DiagramIR{
 const claims=[...a.entryPoints,...a.runtime,...a.security];const seen=new Set<string>();const nodes:DiagramNode[]=[];
 for(const f of claims.sort((x,y)=>x.id.localeCompare(y.id))){const id=safeId(f.id);if(seen.has(id))continue;seen.add(id);nodes.push({id,type:f.kind==="security"?"trust":f.kind,label:f.label,evidenceIds:[`evidence-${f.id}`],metadata:{classification:f.classification,confidence:f.confidence}})}
 const relationships:DiagramRelationship[]=[];const evidence=a.findings.map(f=>evidenceFromFinding(f,safeId(f.id)));
 // Only emit architecture edges when the analyzer has relationship evidence; never synthesize first-node associations.
 for(const f of a.relationships){const src=nodes.find(n=>f.label.startsWith((f.source.file)+" "));const targetName=String(f.metadata?.target??"");const target=nodes.find(n=>n.label.includes(targetName));if(src&&target){const id=`rel-${safeId(f.id)}`;relationships.push({id,source:src.id,target:target.id,type:String(f.metadata?.relationType??"references"),evidenceIds:[`evidence-${f.id}`],metadata:{classification:f.classification,confidence:f.confidence}});const e=evidence.find(x=>x.id===`evidence-${f.id}`);if(e)e.relationshipId=id}}
 return{version:"1.0",kind:"architecture",document:{title:`Repository architecture: ${snapshot.repository}`,description:`Revision ${snapshot.commitSha}`},nodes,relationships,boundaries:[],evidence:canonicalEvidence(evidence),presentation:{}};
}
