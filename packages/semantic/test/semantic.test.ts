import {describe,expect,it} from "vitest";
import type {DiagramIR,DiagramKind} from "@visual-architecture/ir";
import {semanticEngines,validateSemantics} from "../src/index";

const base=(kind:DiagramKind):DiagramIR=>({version:"1.0",kind,document:{title:kind},nodes:[],relationships:[],boundaries:[],evidence:[],presentation:{}});

describe("five independent semantic engines",()=>{
 it("registers exactly five engines",()=>expect(Object.keys(semanticEngines).sort()).toEqual(["architecture","data-flow","lifecycle","sequence","workflow"]));
 it("architecture rejects empty component graph",()=>expect(validateSemantics(base("architecture")).some(d=>d.code==="ARCHITECTURE_EMPTY")).toBe(true));
 it("workflow requires START semantics",()=>expect(validateSemantics(base("workflow")).some(d=>d.code==="WORKFLOW_START_MISSING")).toBe(true));
 it("sequence requires at least two participants",()=>expect(validateSemantics(base("sequence")).some(d=>d.code==="SEQUENCE_PARTICIPANTS_INSUFFICIENT")).toBe(true));
 it("data flow rejects non-flow relationships",()=>{const ir=base("data-flow");ir.nodes=[{id:"a",type:"source",label:"A"},{id:"b",type:"destination",label:"B"}];ir.relationships=[{id:"r",source:"a",target:"b",type:"calls"}];expect(validateSemantics(ir).some(d=>d.code==="DATA_FLOW_RELATION_TYPE_INVALID")).toBe(true);});
 it("lifecycle requires canonical state semantics",()=>expect(validateSemantics(base("lifecycle")).some(d=>d.code==="LIFECYCLE_START_MISSING")).toBe(true));
});
