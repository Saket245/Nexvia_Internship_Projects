declare module 'yjs' {
  export const Doc: any;
  export type Doc = any;
  export const Map: any;
  export type Map<T = any> = any;
  export const Array: any;
  export type Array<T = any> = any;
  export const Text: any;
  export type Text = any;
  export function encodeStateAsUpdate(doc: any, targetStateVector?: Uint8Array): Uint8Array;
  export function applyUpdate(doc: any, update: Uint8Array, origin?: any): void;
  export function encodeStateVector(doc: any): Uint8Array;
  const Y: any;
  export default Y;
}

declare module 'y-protocols/sync' {
  export function readSyncMessage(decoder: any, encoder: any, doc: any, transactionOrigin: any): number;
  export function writeSyncStep1(encoder: any, doc: any): void;
  export function writeSyncStep2(encoder: any, doc: any, encodedStateVector?: Uint8Array): void;
  export function writeUpdate(encoder: any, update: Uint8Array): void;
  export const messageYjsSyncStep1: number;
  export const messageYjsSyncStep2: number;
  export const messageYjsUpdate: number;
}

declare module 'y-protocols/awareness' {
  export class Awareness {
    constructor(doc: any);
    destroy(): void;
    getLocalState(): any;
    setLocalState(state: any): void;
    setLocalStateField(field: string, value: any): void;
    getStates(): Map<number, any>;
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    clientID: number;
  }
  export function encodeAwarenessUpdate(awareness: Awareness, clients: number[], states?: Map<number, any>): Uint8Array;
  export function applyAwarenessUpdate(awareness: Awareness, update: Uint8Array, origin: any): void;
  export function removeAwarenessStates(awareness: Awareness, clients: number[], origin: any): void;
}

declare module 'lib0/decoding' {
  export class Decoder {
    constructor(uint8Array: Uint8Array);
  }
  export function createDecoder(uint8Array: Uint8Array): Decoder;
  export function readVarUint(decoder: Decoder): number;
  export function readVarUint8Array(decoder: Decoder): Uint8Array;
}

declare module 'lib0/encoding' {
  export class Encoder {}
  export function createEncoder(): Encoder;
  export function writeVarUint(encoder: Encoder, num: number): void;
  export function writeVarUint8Array(encoder: Encoder, uint8Array: Uint8Array): void;
  export function toUint8Array(encoder: Encoder): Uint8Array;
}
