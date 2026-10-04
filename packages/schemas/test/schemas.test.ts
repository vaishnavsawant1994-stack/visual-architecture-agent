import {describe,expect,it} from "vitest";import {diagramIRSchema,schemaAcceptsShape} from "../src/index";
describe("G2 schema contract",()=>{
 it("freezes five diagram kinds and rejects additional root properties",()=>{expect(diagramIRSchema.additionalProperties).toBe(false);expect(diagramIRSchema.properties.kind.enum).toEqual(["architecture","workflow","sequence","data-flow","lifecycle"])});
 it("recognizes only complete root shapes",()=>{expect(schemaAcceptsShape({version:"1.0",kind:"architecture",document:{title:"x"},nodes:[],relationships:[],boundaries:[],evidence:[],presentation:{}})).toBe(true);expect(schemaAcceptsShape({version:"1.0"})).toBe(false)});
 it("keeps nested authored structures closed",()=>{expect(diagramIRSchema.properties.nodes.items.additionalProperties).toBe(false);expect(diagramIRSchema.properties.relationships.items.additionalProperties).toBe(false);expect(diagramIRSchema.properties.boundaries.items.additionalProperties).toBe(false)});
});