import {describe,expect,it} from "vitest";
import type {DiagramIR,DiagramKind} from "@visual-architecture/ir";
import {layoutDiagram} from "@visual-architecture/layout";
import {renderDiagram,renderers,validateRenderResult,validateSvg} from "../src/index";

const make=(kind:DiagramKind,label="API"):DiagramIR=>({version:"1.0",kind,document:{title:"Example",description:"Safe"},nodes:[{id:"a",type:kind==="lifecycle"?"state":"component",label,metadata:kind==="lifecycle"?{state:"START"}:{}}],relationships:[],boundaries:[],evidence:[],presentation:{}});

describe("G5 renderer",()=>{
 it("registers five renderer entry points",()=>expect(Object.keys(renderers).sort()).toEqual(["architecture","data-flow","lifecycle","sequence","workflow"]));
 it.each(["architecture","workflow","sequence","data-flow","lifecycle"] as DiagramKind[])("renders valid deterministic SVG for %s",kind=>{
  const ir=make(kind),layout=layoutDiagram(ir),a=renderDiagram(ir,layout),b=renderDiagram(ir,layout);
  expect(a.svg).toBe(b.svg);expect(a.geometryHash).toBe(layout.geometryHash);expect(validateSvg(a.svg)).toEqual([]);expect(validateRenderResult(a,kind,layout.geometryHash)).toEqual([]);
 });
 it("escapes authored text rather than injecting markup",()=>{
  const ir=make("architecture",'<script>alert("x")</script>');
  const svg=renderDiagram(ir,layoutDiagram(ir)).svg;
  expect(svg).not.toContain("<script>");expect(svg).toContain("&lt;script&gt;");
  expect(validateSvg(svg)).toEqual([]);
 });
 it("emits deep-linkable semantic ids",()=>{
  const ir=make("architecture"),svg=renderDiagram(ir,layoutDiagram(ir)).svg;
  expect(svg).toContain('id="node-a"');expect(svg).toContain('data-node-id="a"');
 });
});
