import type {ExportArtifact} from "@visual-architecture/exporter";
export type Severity="error"|"warning";
export interface VerificationDiagnostic{code:string;severity:Severity;message:string}
export interface BrowserObservation{loaded:boolean;consoleErrors:string[];viewport:{width:number;height:number};overflowX:boolean;overflowY:boolean;overlaps:string[];brokenArrows:string[];keyboardReachable:boolean;focusVisible:boolean;semanticLabels:boolean;contrastPass:boolean;reducedMotion:boolean;nonColorSemantics:boolean;interactions:Record<string,boolean>;screenshotHash?:string}
export interface VerificationReport{passed:boolean;diagnostics:VerificationDiagnostic[];observation:BrowserObservation}
const d=(code:string,severity:Severity,message:string):VerificationDiagnostic=>({code,severity,message});
export function verifyObservation(o:BrowserObservation):VerificationReport{const x:VerificationDiagnostic[]=[];
 if(!o.loaded)x.push(d("BROWSER_LOAD_FAILED","error","Artifact did not load."));
 for(const e of o.consoleErrors)x.push(d("BROWSER_CONSOLE_ERROR","error",e));
 if(o.overflowX||o.overflowY)x.push(d("RESPONSIVE_OVERFLOW","error","Viewport overflow detected."));
 for(const id of o.overlaps)x.push(d("LAYOUT_OVERLAP","error",id));
 for(const id of o.brokenArrows)x.push(d("BROKEN_ARROW","error",id));
 for(const [name,ok] of Object.entries(o.interactions))if(!ok)x.push(d("INTERACTION_FAILED","error",name));
 if(!o.keyboardReachable)x.push(d("A11Y_KEYBOARD_UNREACHABLE","error","Interactive controls are not keyboard reachable."));
 if(!o.focusVisible)x.push(d("A11Y_FOCUS_INVISIBLE","error","Visible focus indicator missing."));
 if(!o.semanticLabels)x.push(d("A11Y_SEMANTIC_LABELS_MISSING","error","Semantic labels missing."));
 if(!o.contrastPass)x.push(d("A11Y_CONTRAST_FAILED","error","Contrast requirement failed."));
 if(!o.reducedMotion)x.push(d("A11Y_REDUCED_MOTION_FAILED","error","Reduced-motion behavior missing."));
 if(!o.nonColorSemantics)x.push(d("A11Y_COLOR_ONLY_SEMANTICS","error","Relationship meaning relies on color only."));
 if(!o.screenshotHash)x.push(d("VISUAL_SCREENSHOT_MISSING","warning","No screenshot evidence was recorded."));
 return{passed:!x.some(v=>v.severity==="error"),diagnostics:x,observation:o};
}
export interface BrowserDriver{open(html:string,viewport:{width:number;height:number},reducedMotion:boolean):Promise<BrowserObservation>}
export async function verifyArtifact(a:ExportArtifact,driver:BrowserDriver,viewports=[{width:1440,height:900},{width:390,height:844}]):Promise<VerificationReport[]>{
 if(a.format!=="html")throw new Error("BROWSER_VERIFY_REQUIRES_HTML");const html=new TextDecoder().decode(a.bytes);const out:VerificationReport[]=[];
 for(const viewport of viewports)out.push(verifyObservation(await driver.open(html,viewport,true)));return out;
}
export function deliveryErrors(reports:VerificationReport[]):string[]{return reports.flatMap(r=>r.diagnostics.filter(d=>d.severity==="error").map(d=>d.code))}
