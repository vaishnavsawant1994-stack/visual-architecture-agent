import type {ExportArtifact} from "@visual-architecture/exporter";
import {hashBytes,validateExport} from "@visual-architecture/exporter";

export interface DeliveryRecord{accepted:boolean;specificationHash:string;artifactHash:string;previousArtifactHash?:string;errors:string[]}
export interface DeliveryStore{readGood(key:string):Promise<ExportArtifact|undefined>;writeCandidate(key:string,a:ExportArtifact):Promise<void>;readCandidate?(key:string):Promise<ExportArtifact|undefined>;promoteCandidate(key:string):Promise<void>;discardCandidate(key:string):Promise<void>}

const canonical=(value:unknown):string=>{
 if(value===null||typeof value!=="object")return JSON.stringify(value);
 if(Array.isArray(value))return `[${value.map(canonical).join(",")}]`;
 const record=value as Record<string,unknown>;
 return `{${Object.keys(record).sort().map(k=>`${JSON.stringify(k)}:${canonical(record[k])}`).join(",")}}`;
};
export function specificationHash(spec:unknown):string{return hashBytes(new TextEncoder().encode(canonical(spec)))}
const message=(e:unknown)=>e instanceof Error?e.message:String(e);
async function cleanup(store:DeliveryStore,key:string,errors:string[]):Promise<void>{try{await store.discardCandidate(key)}catch(e){errors.push(`CLEANUP_ERROR: ${message(e)}`)}}
function integrity(a:ExportArtifact):string[]{return validateExport(a)}
export async function deliverAtomic(key:string,spec:unknown,candidate:ExportArtifact,store:DeliveryStore,extraValidate:(a:ExportArtifact)=>Promise<string[]>=async()=>[]):Promise<DeliveryRecord>{
 const previous=await store.readGood(key),specHash=specificationHash(spec);
 try{await store.writeCandidate(key,candidate)}catch(e){return{accepted:false,specificationHash:specHash,artifactHash:candidate.hash,...(previous?{previousArtifactHash:previous.hash}:{}),errors:[`CANDIDATE_WRITE_ERROR: ${message(e)}`]}};
 let staged=candidate,errors:string[]=[];
 try{if(store.readCandidate){const read=await store.readCandidate(key);if(!read)errors.push("CANDIDATE_MISSING");else staged=read}errors.push(...integrity(staged));if(staged.hash!==candidate.hash)errors.push("CANDIDATE_CHANGED");if(!errors.length)errors.push(...await extraValidate(staged))}
 catch(e){errors.push(`EXTERNAL_VALIDATION_ERROR: ${message(e)}`)}
 if(errors.length){await cleanup(store,key,errors);return{accepted:false,specificationHash:specHash,artifactHash:candidate.hash,...(previous?{previousArtifactHash:previous.hash}:{}),errors}}
 try{
  const beforePromotion=store.readCandidate?await store.readCandidate(key):staged;
  if(!beforePromotion||beforePromotion.hash!==candidate.hash||integrity(beforePromotion).length)throw new Error("CANDIDATE_INTEGRITY_CHANGED");
  await store.promoteCandidate(key);
  const active=await store.readGood(key);
  if(!active||active.hash!==candidate.hash||integrity(active).length)throw new Error("PROMOTED_ARTIFACT_INTEGRITY_FAILED");
 }catch(e){errors.push(`PROMOTION_ERROR: ${message(e)}`);await cleanup(store,key,errors);return{accepted:false,specificationHash:specHash,artifactHash:candidate.hash,...(previous?{previousArtifactHash:previous.hash}:{}),errors}}
 return{accepted:true,specificationHash:specHash,artifactHash:candidate.hash,...(previous?{previousArtifactHash:previous.hash}:{}),errors:[]};
}
export class MemoryDeliveryStore implements DeliveryStore{
 good=new Map<string,ExportArtifact>();candidate=new Map<string,ExportArtifact>();
 async readGood(k:string){return this.good.get(k)}
 async writeCandidate(k:string,a:ExportArtifact){this.candidate.set(k,a)}
 async readCandidate(k:string){return this.candidate.get(k)}
 async promoteCandidate(k:string){const a=this.candidate.get(k);if(!a)throw new Error("CANDIDATE_MISSING");this.good.set(k,a);this.candidate.delete(k)}
 async discardCandidate(k:string){this.candidate.delete(k)}
}
