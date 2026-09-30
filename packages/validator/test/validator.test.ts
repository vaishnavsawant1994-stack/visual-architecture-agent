import { describe, expect, it } from "vitest";
import { validateDiagramIR } from "../src/index";

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
