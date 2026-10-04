import {describe,expect,it} from "vitest";
import type {DiagramIR} from "@visual-architecture/ir";
import {layoutDiagram} from "../src/index";

const ir:DiagramIR={version:"1.0",kind:"architecture",document:{title:"Determinism"},nodes:[
 {id:"postgres",type:"store",label:"Postgres"},{id:"api",type:"service",label:"API"},{id:"web",type:"component",label:"Web"}
],relationships:[
 {id:"api-db",source:"api",target:"postgres",type:"calls"},{id:"web-api",source:"web",target:"api",type:"calls"}
],boundaries:[],evidence:[],presentation:{}};

describe("deterministic layout",()=>{
 it("returns the same geometry hash for identical IR",()=>expect(layoutDiagram(ir).geometryHash).toBe(layoutDiagram(ir).geometryHash));
 it("is independent of input node ordering",()=>{
  const shuffled={...ir,nodes:[ir.nodes[2]!,ir.nodes[0]!,ir.nodes[1]!]};
  expect(layoutDiagram(shuffled).geometryHash).toBe(layoutDiagram(ir).geometryHash);
 });
 it("uses stable orthogonal edge routes",()=>expect(layoutDiagram(ir).edges.every(e=>e.points.length===4)).toBe(true));
});
