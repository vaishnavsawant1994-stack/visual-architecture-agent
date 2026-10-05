import {describe,expect,it} from "vitest";
import {spawnSync} from "node:child_process";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const bin=resolve(dirname(fileURLToPath(import.meta.url)),"../src/bin.ts");
const run=(args:string[],cwd:string)=>spawnSync(process.execPath,["--experimental-strip-types",bin,...args],{cwd,encoding:"utf8",env:{...process.env,FAKE_API_KEY:"DO_NOT_LEAK_FAKE_SECRET"}});

describe("G12 public pipeline falsification",()=>{
 it("creates five semantically distinct models through the executable",async()=>{
  const dir=await mkdtemp(join(process.cwd(),".g12-"));
  try{
   const prompts:[string,string][]=[
    ["Show how authentication works in my SaaS","architecture"],
    ["Show the approval workflow","workflow"],
    ["Show the request sequence and message order","sequence"],
    ["Show the data flow lineage","data-flow"],
    ["Show the lifecycle state machine","lifecycle"]
   ];
   const kinds=new Set<string>();
   for(const [prompt,kind] of prompts){
    const created=run(["create",prompt],dir);
    expect(created.status,"create "+kind).toBe(0);
    const body=JSON.parse(created.stdout);
    expect(body.ir.kind).toBe(kind);
    expect(body.validation.valid).toBe(true);
    expect(body.layout.geometryHash).toEqual(expect.any(String));
    expect(body.artifact.svg).toContain("<svg");
    kinds.add(body.ir.kind);
    await writeFile(join(dir,kind+".json"),JSON.stringify(body.ir));
    const rendered=run(["render",kind+".json"],dir);
    expect(rendered.status,"render "+kind).toBe(0);
    const preview=run(["preview",kind+".json"],dir);
    expect(preview.status,"preview "+kind).toBe(0);
    expect(preview.stdout).toContain("<!doctype html>");
   }
   expect([...kinds].sort()).toEqual(["architecture","data-flow","lifecycle","sequence","workflow"]);
    const workflow=JSON.parse(run(["create","Show the approval workflow from draft submission through review and final approval"],dir).stdout).ir;
    expect(workflow.nodes.map((n:any)=>n.id)).toEqual(["start","draft","review","approval","end"]);
    expect(workflow.nodes.find((n:any)=>n.id==="review").type).toBe("decision");
    expect(workflow.relationships.some((r:any)=>r.source==="review"&&r.target==="draft"&&r.metadata?.mainPath!==true)).toBe(true);
    expect(workflow.relationships.filter((r:any)=>r.metadata?.mainPath===true).map((r:any)=>r.id)).toEqual(["start-draft","draft-review","review-approval","approval-end"]);
    const sequence=JSON.parse(run(["create","Show the message sequence between the user, API gateway, authentication service, session store, and application"],dir).stdout).ir;
    expect(sequence.nodes.map((n:any)=>n.label)).toEqual(["User","API Gateway","Authentication Service","Session Store","Application"]);
    expect(sequence.relationships.map((r:any)=>r.metadata.order)).toEqual([1,2,3,4,5,6]);
    expect(sequence.relationships.map((r:any)=>[r.source,r.target])).toEqual([["user","api-gateway"],["api-gateway","auth-service"],["auth-service","session-store"],["session-store","auth-service"],["auth-service","api-gateway"],["api-gateway","application"]]);
    const flow=JSON.parse(run(["create","Show how customer data flows from ingestion through validation, storage, processing, and reporting"],dir).stdout).ir;
    expect(flow.nodes.map((n:any)=>[n.id,n.type])).toEqual([["customer","source"],["ingestion","stage"],["validation","process"],["storage","store"],["processing","processor"],["reporting","destination"]]);
    expect(flow.relationships.map((r:any)=>[r.source,r.target,r.type])).toEqual([["customer","ingestion","flow"],["ingestion","validation","flow"],["validation","storage","flow"],["storage","processing","flow"],["processing","reporting","flow"]]);
    const life=JSON.parse(run(["create","Show the lifecycle of an order from creation through payment, fulfillment, delivery, and completion"],dir).stdout).ir;
    expect(life.nodes.map((n:any)=>[n.id,n.label,n.metadata.state])).toEqual([["created","Created","START"],["payment","Payment","ACTIVE"],["fulfillment","Fulfillment","WAITING"],["delivery","Delivery","ACTIVE"],["completed","Completed","COMPLETED"]]);
    expect(life.relationships.map((r:any)=>[r.source,r.target,r.type])).toEqual([["created","payment","transition"],["payment","fulfillment","transition"],["fulfillment","delivery","transition"],["delivery","completed","transition"]]);
    expect(life.relationships.some((r:any)=>r.source==="completed")).toBe(false);
    const varied=JSON.parse(run(["create","Map the process from drafting a request through review, rework if needed, approval and completion"],dir).stdout).ir;
    expect(varied.kind).toBe("workflow");
    expect(varied.nodes.map((n:any)=>n.id)).toEqual(["start","draft","review","approval","end"]);
    expect(varied.relationships.some((r:any)=>r.source==="review"&&r.target==="draft")).toBe(true);
  }finally{await rm(dir,{recursive:true,force:true})}
 });
 it("analyzes a repository through the executable and keeps evidence pinned and untrusted",async()=>{
  const dir=await mkdtemp(join(process.cwd(),".g12-"));
  try{
   await writeFile(join(dir,"snapshot.json"),JSON.stringify({repository:"fixture/repo",commitSha:"deadbeef",files:[{path:"src/index.ts",blobSha:"blob1",contentHash:"hash1",content:'import x from "./x"; const password="DO_NOT_LEAK_FAKE_SECRET"; globalThis.__G12_PWNED=true;'},{path:"src/x.ts",blobSha:"blob2",contentHash:"hash2",content:"export default 1"}]}));
   const analyzed=run(["analyze","snapshot.json"],dir);
   expect(analyzed.status).toBe(0);
   expect(analyzed.stdout).not.toContain("DO_NOT_LEAK_FAKE_SECRET");
   expect((globalThis as any).__G12_PWNED).toBeUndefined();
   const body=JSON.parse(analyzed.stdout);
   expect(body.ok).toBe(true);
   expect(body.ir.kind).toBe("architecture");
   expect(body.ir.evidence.every((e:any)=>e.repository==="fixture/repo"&&e.commitSha==="deadbeef"&&e.blobSha&&e.contentHash&&e.classification)).toBe(true);
   expect(body.ir.evidence.some((e:any)=>e.classification==="VERIFIED")).toBe(true);
   expect(body.ir.evidence.some((e:any)=>e.classification==="INFERRED")).toBe(true);
  }finally{await rm(dir,{recursive:true,force:true})}
 });
});
