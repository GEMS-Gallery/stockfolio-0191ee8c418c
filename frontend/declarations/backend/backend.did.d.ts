import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Holding {
  'id' : bigint,
  'marketValue' : number,
  'name' : string,
  'performance' : number,
  'quantity' : bigint,
}
export interface _SERVICE {
  'addHolding' : ActorMethod<[string, bigint, number, number], bigint>,
  'deleteHolding' : ActorMethod<[bigint], boolean>,
  'getAllHoldings' : ActorMethod<[], Array<Holding>>,
  'getAveragePerformance' : ActorMethod<[], number>,
  'getTotalPortfolioValue' : ActorMethod<[], number>,
  'updateHolding' : ActorMethod<
    [bigint, string, bigint, number, number],
    boolean
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
