export interface StructuralReport{errors:string[];warnings:string[]}
export function verifyHtmlStructure(html:string):StructuralReport{const errors:string[]=[],warnings:string[]=[];
 if(!html.startsWith("<!doctype html>"))errors.push("HTML_DOCTYPE_MISSING");
 if(!/<meta name="viewport"/i.test(html))errors.push("HTML_VIEWPORT_MISSING");
 if(!/<svg\b/i.test(html))errors.push("SVG_MISSING");
 if(/<script[^>]+src=/i.test(html)||/<link[^>]+href=["']https?:/i.test(html))errors.push("EXTERNAL_DEPENDENCY_FORBIDDEN");
 if(!/aria-label="Diagram controls"/i.test(html))errors.push("A11Y_TOOLBAR_LABEL_MISSING");
 if(!/aria-label="Interactive diagram"/i.test(html))errors.push("A11Y_DIAGRAM_LABEL_MISSING");
 if(!/:focus-visible/.test(html))errors.push("A11Y_FOCUS_STYLE_MISSING");
 if(!/prefers-reduced-motion:reduce/.test(html))errors.push("A11Y_REDUCED_MOTION_STYLE_MISSING");
 if(!/data-relation-kind=/.test(html))errors.push("RELATIONSHIP_NONCOLOR_METADATA_MISSING");
 if(!/tabindex="0"/.test(html))warnings.push("KEYBOARD_VIEWPORT_TABINDEX_MISSING");
 return{errors,warnings};
}
