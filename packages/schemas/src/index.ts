import type { DiagramIR } from "@visual-architecture/ir";

export const diagramIRSchema = {
  $schema:"https://json-schema.org/draft/2020-12/schema",
  $id:"https://visual-architecture.local/schemas/diagram-ir-1.0.json",
  type:"object", additionalProperties:false,
  required:["version","kind","document","nodes","relationships","boundaries","evidence","presentation"],
  properties:{
    version:{const:"1.0"},
    kind:{enum:["architecture","workflow","sequence","data-flow","lifecycle"]},
    document:{type:"object",additionalProperties:false,required:["title"],properties:{
      title:{type:"string",minLength:1},description:{type:"string"}
    }},
    nodes:{type:"array",items:{type:"object",additionalProperties:false,required:["id","type","label"],properties:{
      id:{type:"string",minLength:1},type:{type:"string",minLength:1},label:{type:"string",minLength:1},
      description:{type:"string"},evidenceIds:{type:"array",items:{type:"string",minLength:1}},metadata:{type:"object"}
    }}},
    relationships:{type:"array",items:{type:"object",additionalProperties:false,required:["id","source","target","type"],properties:{
      id:{type:"string",minLength:1},source:{type:"string",minLength:1},target:{type:"string",minLength:1},
      type:{type:"string",minLength:1},label:{type:"string"},evidenceIds:{type:"array",items:{type:"string",minLength:1}},metadata:{type:"object"}
    }}},
    boundaries:{type:"array",items:{type:"object",additionalProperties:false,required:["id","type","label"],properties:{
      id:{type:"string",minLength:1},type:{type:"string",minLength:1},label:{type:"string",minLength:1},
      nodeIds:{type:"array",items:{type:"string",minLength:1}},boundaryIds:{type:"array",items:{type:"string",minLength:1}},metadata:{type:"object"}
    }}},
    evidence:{type:"array",items:{type:"object",additionalProperties:false,required:["id","classification"],properties:{
      id:{type:"string",minLength:1},classification:{enum:["VERIFIED","INFERRED","USER_SUPPLIED","UNKNOWN"]},
      repository:{type:"string"},commitSha:{type:"string"},file:{type:"string"},lineStart:{type:"integer",minimum:1},
      lineEnd:{type:"integer",minimum:1},blobSha:{type:"string"},contentHash:{type:"string"},nodeId:{type:"string"},
      relationshipId:{type:"string"},confidence:{type:"number",minimum:0,maximum:1},excerpt:{type:"string"}
    }}},
    presentation:{type:"object",additionalProperties:false,properties:{
      preset:{enum:["classic","signal","blueprint","editorial"]},
      theme:{enum:["dark","light","presentation"]},reducedMotion:{type:"boolean"},locale:{type:"string",minLength:2}
    }}
  }
} as const;

export function schemaAcceptsShape(value:unknown):value is DiagramIR {
  if(typeof value!=="object"||value===null||Array.isArray(value)) return false;
  const r=value as Record<string,unknown>;
  return ["version","kind","document","nodes","relationships","boundaries","evidence","presentation"]
    .every(k=>Object.prototype.hasOwnProperty.call(r,k));
}
