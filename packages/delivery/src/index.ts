import type {ExportArtifact} from "@visual-architecture/exporter";import {hashBytes,validateExport} from "@visual-architecture/exporter";
export interface DeliveryRecord{accepted:boolean;specificationHash:string;artifactHash:string;previousArtifactHash?:string;errors:string[]}
export interface DeliveryStore{readGood(key:string):Promise<ExportArtifact|undefined>;writeCandidate(key:string,a:ExportArtifact):Promise<void>;promoteCandidate(key:string):Promise<void>;discardCandidate(key:string):Promise<void>}
export function specificationHash(spec:unknown):string{return hashBytes(new TextEncoder().encode(JSON.stringify(spec)))}
export async function deliverAtomic(key:string,spec:unknown,candidate:ExportArtifact,store:DeliveryStore,extraValidate:(a:ExportArtifact)=>Promise<string[]>=async()=>[]):Promise<DeliveryRecord>{
 const previous=await store.readGood(key);await store.writeCandidate(key,candidate);
 const errors=[...validateExport(candidate),...await extraValidate(candidate)];
 if(errors.length){await store.discardCandidate(key);return{accepted:false,specificationHash:specificationHash(spec),artifactHash:candidate.hash,...(previous?{previousArtifactHash:previous.hash}:{}),errors}}
 await store.promoteCandidate(key);return{accepted:true,specificationHash:specificationHash(spec),artifactHash:candidate.hash,...(previous?{previousArtifactHash:previous.hash}:{}),errors:[]};
}
export class MemoryDeliveryStore implements DeliveryStore{
 good=new Map<string,ExportArtifact>();candidate=new Map<string,ExportArtifact>();
 async readGood(k:string){return this.good.get(k)}
 async writeCandidate(k:string,a:ExportArtifact){this.candidate.set(k,a)}
 async promoteCandidate(k:string){const a=this.candidate.get(k);if(!a)throw new Error("CANDIDATE_MISSING");this.good.set(k,a);this.candidate.delete(k)}
 async discardCandidate(k:string){this.candidate.delete(k)}
}
