import {runCommand,type Command,type CommandContext} from "@visual-architecture/cli";
export type AgentRuntime="codex"|"claude-code"|"cursor"|"opencode";
export interface AgentRequest{runtime:AgentRuntime;operation:Command;context:CommandContext}
export interface AgentResponse{runtime:AgentRuntime;ok:boolean;result?:unknown;error?:{code:string;message:string}}
const message=(e:unknown)=>e instanceof Error?e.message:String(e);
export async function invokeAgent(request:AgentRequest):Promise<AgentResponse>{if(!["codex","claude-code","cursor","opencode"].includes(request.runtime))return{runtime:request.runtime,ok:false,error:{code:"RUNTIME_UNSUPPORTED",message:"Unsupported runtime"}};try{const result=await runCommand(request.operation,request.context);const failed=(request.operation==="validate"&&(result as any).valid===false)||(request.operation==="analyze"&&(result as any).ok===false)||(request.operation==="deliver"&&(result as any).accepted===false);return failed?{runtime:request.runtime,ok:false,result,error:{code:"CORE_REJECTED",message:"Authoritative core rejected request"}}:{runtime:request.runtime,ok:true,result}}catch(e){return{runtime:request.runtime,ok:false,error:{code:"CORE_ERROR",message:message(e)}}}}
const adapter=(runtime:AgentRuntime)=>(operation:Command,context:CommandContext={})=>invokeAgent({runtime,operation,context});
export const adapters={codex:adapter("codex"),"claude-code":adapter("claude-code"),cursor:adapter("cursor"),opencode:adapter("opencode")};
