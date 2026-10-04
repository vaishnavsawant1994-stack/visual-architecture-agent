import {describe,expect,it} from "vitest";
import type {DiagramIR} from "@visual-architecture/ir";
import {layoutDiagram} from "@visual-architecture/layout";
import {DEFAULT_STATE,applyLens,createSelfContainedHtml,fit,focus,inspectRelationship,pan,parseDeepLink,reach,reset,route,search,serializeDeepLink,zoom} from "../src/index";

const ir:DiagramIR={version:"1.0",kind:"architecture",document:{title:"Runtime"},nodes:[
{id:"web",type:"external",label:"Web"},{id:"api",type:"runtime",label:"API"},{id:"db",type:"storage",label:"Database"}
],relationships:[
{id:"web-api",source:"web",target:"api",type:"calls"},{id:"api-db",source:"api",target:"db",type:"reads"}
],boundaries:[{id:"trust",type:"trust",label:"Trust",nodeIds:["api"]}],evidence:[{id:"ev1",classification:"VERIFIED",nodeId:"api"}],presentation:{}};

describe("G6 viewer runtime",()=>{
 it("zooms, pans, resets and fits deterministically",()=>{const z=zoom(DEFAULT_STATE,2);expect(z.zoom).toBe(2);expect(pan(z,3,4).panX).toBe(3);expect(reset(z).zoom).toBe(1);expect(fit(1000,700,layoutDiagram(ir),DEFAULT_STATE).zoom).toBeGreaterThan(0);});
 it("searches and focuses semantic content",()=>{expect(search(ir,"database")).toEqual(["db"]);expect(focus(ir,"api").incoming.map(r=>r.id)).toEqual(["web-api"]);expect(focus(ir,"api").evidence.map(e=>e.id)).toContain("ev1");});
 it("computes reach and authored directed routes",()=>{expect(reach(ir,"api","downstream")).toEqual(["api","db"]);expect(route(ir,"web","db")).toEqual(["web","api","db"]);expect(route(ir,"db","web")).toEqual([]);});
 it("inspects relationships and lenses",()=>{expect(inspectRelationship(ir,"api-db")?.relation.target).toBe("db");expect(applyLens(ir,"storage")).toEqual(["db"]);});
 it("round-trips deep-link state",()=>{const s={...DEFAULT_STATE,nodeId:"api",lens:"security" as const};expect(parseDeepLink(serializeDeepLink(s)).nodeId).toBe("api");expect(parseDeepLink("#route=web,db").route).toEqual(["web","db"]);});
 it("creates a self-contained accessible HTML artifact",()=>{const html=createSelfContainedHtml(ir,layoutDiagram(ir));expect(html).toContain("<!doctype html>");expect(html).toContain('aria-label="Diagram controls"');expect(html).toContain('aria-label="Interactive diagram"');expect(html).toContain("prefers-reduced-motion");expect(html).toContain("<svg");expect(html).toContain('data-action="fit"');expect(html).toContain('data-theme="presentation"');});
 it("does not inject closing script from authored JSON",()=>{const hostile={...ir,document:{title:"</script><script>alert(1)</script>"}};const html=createSelfContainedHtml(hostile,layoutDiagram(hostile));expect(html).not.toContain('</script><script>alert(1)</script>');});
});