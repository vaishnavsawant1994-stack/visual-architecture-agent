import { describe, expect, it } from "vitest";
import { validateDiagramIR, validatePipeline } from "../src/index";

const valid = {
  version:"1.0",
  kind:"architecture",
  document:{title:"Personal AI Runtime"},
  nodes:[
    {id:"agent-runtime",type:"runtime",label:"Agent Runtime"},
    {id:"memory-engine",type:"service",label:"Memory Engine"}
  ],
  relationships:[
    {id:"agent-to-memory",source:"agent-runtime",target:"memory-engine",type:"calls"}
  ],
  boundaries:[],evidence:[],presentation:{}
};

describe("Typed IR hostile validation",()=>{
  it("accepts the minimal valid contract",()=>{
    expect(validateDiagramIR(valid).valid).toBe(true);
  });

  it("rejects unknown root fields instead of silently dropping them",()=>{
    const result=validateDiagramIR({...valid,surprise:true});
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="SCHEMA_UNKNOWN_FIELD")).toBe(true);
  });

  it("rejects unknown nested fields",()=>{
    const result=validateDiagramIR({...valid,document:{title:"Runtime",unexpected:"drop-me"}});
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="SCHEMA_UNKNOWN_FIELD" && d.path==="document.unexpected")).toBe(true);
  });

  it("rejects unsupported versions",()=>{
    const result=validateDiagramIR({...valid,version:"9.9"});
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="SCHEMA_VERSION_UNSUPPORTED")).toBe(true);
  });

  it("rejects duplicate node ids",()=>{
    const result=validateDiagramIR({...valid,nodes:[...valid.nodes,valid.nodes[0]]});
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="NODE_ID_DUPLICATE")).toBe(true);
  });

  it("rejects relationships with missing endpoints",()=>{
    const result=validateDiagramIR({
      ...valid,
      relationships:[{id:"bad",source:"agent-runtime",target:"does-not-exist",type:"calls"}]
    });
    expect(result.valid).toBe(false);
    expect(result.diagnostics.some(d=>d.code==="RELATION_TARGET_MISSING")).toBe(true);
  });
});

describe("G2 staged qualification",()=>{
 it("qualifies a valid candidate through delivery",()=>{const r=validatePipeline(valid);expect(r.deliveryEligible).toBe(true);expect(Object.keys(r.stages)).toEqual(expect.arrayContaining(["schema","id","relationship","model","graph","layout","svg","artifact","delivery"]))});
 it("rejects non-durable IDs",()=>{const r=validatePipeline({...valid,nodes:[{...valid.nodes[0],id:"Agent Runtime"},valid.nodes[1]],relationships:[]});expect(r.deliveryEligible).toBe(false);expect(r.diagnostics.some(d=>d.code==="DURABLE_ID_INVALID")).toBe(true)});
 it("rejects missing evidence references",()=>{const r=validatePipeline({...valid,nodes:[{...valid.nodes[0],evidenceIds:["missing"]},valid.nodes[1]]});expect(r.diagnostics.some(d=>d.code==="EVIDENCE_REFERENCE_MISSING")).toBe(true)});
 it("rejects invalid boundary references",()=>{const r=validatePipeline({...valid,boundaries:[{id:"outer",type:"trust",label:"Outer",boundaryIds:["outer"]}]});expect(r.diagnostics.some(d=>d.code==="BOUNDARY_REFERENCE_INVALID")).toBe(true)});
 it("fails model-invalid candidates",()=>{const r=validatePipeline({...valid,kind:"workflow",nodes:[{id:"step-one",type:"step",label:"Step"}],relationships:[]});expect(r.diagnostics.some(d=>d.stage==="model")).toBe(true);expect(r.deliveryEligible).toBe(false)});
 it("never silently accepts hostile unknown content",()=>{const r=validatePipeline({...valid,nodes:[{...valid.nodes[0],onload:"alert(1)"},valid.nodes[1]]});expect(r.deliveryEligible).toBe(false);expect(r.diagnostics.some(d=>d.code==="SCHEMA_UNKNOWN_FIELD")).toBe(true)});
});
