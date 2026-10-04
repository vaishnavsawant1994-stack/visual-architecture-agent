import {describe,expect,it} from "vitest";import type {DiagramIR,DiagnosticStage,EvidenceClassification} from "../src/index";
describe("G1 typed IR contract",()=>{
 it("represents every frozen diagram kind with durable graph identity",()=>{for(const kind of ["architecture","workflow","sequence","data-flow","lifecycle"] as const){const ir:DiagramIR={version:"1.0",kind,document:{title:kind},nodes:[{id:"node-a",type:"component",label:"A"}],relationships:[],boundaries:[],evidence:[],presentation:{}};expect(ir.kind).toBe(kind);expect(ir.nodes[0]?.id).toBe("node-a")}});
 it("supports all evidence classifications",()=>{const values:EvidenceClassification[]=["VERIFIED","INFERRED","USER_SUPPLIED","UNKNOWN"];expect(values).toHaveLength(4)});
 it("supports the complete staged diagnostic vocabulary",()=>{const stages:DiagnosticStage[]=["schema","semantic","id","relationship","model","graph","layout","svg","artifact","delivery"];expect(stages).toContain("delivery")});
});