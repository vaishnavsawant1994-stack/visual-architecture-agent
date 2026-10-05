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
