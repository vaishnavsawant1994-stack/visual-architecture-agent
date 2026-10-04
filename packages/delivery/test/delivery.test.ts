import {describe,expect,it} from "vitest";
import type {ExportArtifact} from "@visual-architecture/exporter";
import {hashBytes} from "@visual-architecture/exporter";
import {deliverAtomic,MemoryDeliveryStore,specificationHash} from "../src/index";

const make=(text:string):ExportArtifact=>{const bytes=new TextEncoder().encode(text);return{format:"html",mimeType:"text/html",bytes,hash:hashBytes(bytes),geometryHash:"geo"}};

describe("G9 atomic delivery",()=>{
 it("promotes a valid candidate atomically",async()=>{const s=new MemoryDeliveryStore(),a=make("<!doctype html><svg></svg>");const r=await deliverAtomic("preview",{v:1},a,s);expect(r.accepted).toBe(true);expect((await s.readGood("preview"))?.hash).toBe(a.hash)});
 it("qualifies the required V1 -> invalid V2 -> valid V3 last-known-good sequence",async()=>{
  const s=new MemoryDeliveryStore(),v1=make("<!doctype html><svg><title>v1</title></svg>"),bad=make("broken"),v3=make("<!doctype html><svg><title>v3</title></svg>");
  const r1=await deliverAtomic("preview",{v:1},v1,s);expect(r1.accepted).toBe(true);expect((await s.readGood("preview"))?.hash).toBe(v1.hash);
  const r2=await deliverAtomic("preview",{v:2},bad,s);expect(r2.accepted).toBe(false);expect(r2.previousArtifactHash).toBe(v1.hash);expect((await s.readGood("preview"))?.hash).toBe(v1.hash);expect(s.candidate.has("preview")).toBe(false);
  const r3=await deliverAtomic("preview",{v:3},v3,s);expect(r3.accepted).toBe(true);expect(r3.previousArtifactHash).toBe(v1.hash);expect((await s.readGood("preview"))?.hash).toBe(v3.hash);expect(s.candidate.has("preview")).toBe(false);
 });
 it("does not replace good artifact when external verification returns failure",async()=>{const s=new MemoryDeliveryStore(),v1=make("<!doctype html><svg></svg>");await deliverAtomic("preview",{v:1},v1,s);const v2=make("<!doctype html><svg><title>v2</title></svg>");const r=await deliverAtomic("preview",{v:2},v2,s,async()=>["BROWSER_VERIFY_FAILED"]);expect(r.accepted).toBe(false);expect((await s.readGood("preview"))?.hash).toBe(v1.hash);expect(s.candidate.has("preview")).toBe(false)});
 it("cleans the candidate and preserves good output when external verification throws",async()=>{const s=new MemoryDeliveryStore(),v1=make("<!doctype html><svg></svg>");await deliverAtomic("preview",{v:1},v1,s);const v2=make("<!doctype html><svg><title>v2</title></svg>");const r=await deliverAtomic("preview",{v:2},v2,s,async()=>{throw new Error("browser crashed")});expect(r.accepted).toBe(false);expect(r.errors[0]).toContain("EXTERNAL_VALIDATION_ERROR");expect((await s.readGood("preview"))?.hash).toBe(v1.hash);expect(s.candidate.has("preview")).toBe(false)});
 it("returns stable specification and artifact hashes",async()=>{const s=new MemoryDeliveryStore(),a=make("<!doctype html><svg></svg>");const r=await deliverAtomic("preview",{b:2,a:1},a,s);expect(r.specificationHash).toBe(specificationHash({a:1,b:2}));expect(r.specificationHash).toMatch(/^[0-9a-f]{8}$/);expect(r.artifactHash).toBe(a.hash)});
});
