import {describe,expect,it} from "vitest";import {analysisToArchitectureIR,analyzeRepository,assertReadOnlySnapshot,type RepositorySnapshot} from "../src/index";
const snap:RepositorySnapshot={repository:"acme/app",commitSha:"deadbeef",files:[
{path:"src/server.ts",content:'import express from "express"; const auth=true; fetch("https://api.example");',blobSha:"b1",contentHash:"h1"},
{path:"src/db.ts",content:"const engine = 'postgres';",blobSha:"b2",contentHash:"h2"},
{path:"package.json",content:'{"dependencies":{"express":"1.0.0"}}',blobSha:"b3",contentHash:"h3"}
]};
describe("G7 repository intelligence",()=>{
 it("accepts a pinned read-only snapshot",()=>expect(assertReadOnlySnapshot(snap)).toEqual([]));
 it("rejects filesystem escape and missing identity",()=>expect(assertReadOnlySnapshot({...snap,files:[{path:"../secret",content:"",blobSha:"",contentHash:""}]})).toEqual(expect.arrayContaining(["FILESYSTEM_ESCAPE","FILE_IDENTITY_MISSING"])));
 it("detects languages dependencies and entrypoints without executing code",()=>{const a=analyzeRepository(snap);expect(a.languages).toContain("TypeScript");expect(a.dependencies).toContain("express");expect(a.entryPoints.map(x=>x.label)).toContain("src/server.ts");});
 it("keeps heuristic runtime and security claims INFERRED",()=>{const a=analyzeRepository(snap);expect([...a.runtime,...a.security].every(x=>x.classification==="INFERRED")).toBe(true);});
 it("generates revision-pinned architecture IR",()=>{const ir=analysisToArchitectureIR(snap,analyzeRepository(snap));expect(ir.kind).toBe("architecture");expect(ir.document.description).toContain("deadbeef");expect(ir.evidence.every(e=>e.commitSha==="deadbeef"&&e.blobSha&&e.contentHash)).toBe(true);});
 it("does not promote inferred relationships to verified",()=>{const ir=analysisToArchitectureIR(snap,analyzeRepository(snap));expect(ir.relationships.every(r=>r.metadata?.classification==="INFERRED")).toBe(true);});
});