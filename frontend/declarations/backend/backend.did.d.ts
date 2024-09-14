import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Holding {
  'id' : bigint,
  'acquisitionPrice' : number,
  'currentPrice' : number,
  'acquisitionDate' : bigint,
  'name' : string,
  'performance' : number,
  'quantity' : bigint,
  'symbol' : string,
}
export interface _SERVICE {
  'addHolding' : ActorMethod<[string, bigint, number], bigint>,
  'deleteHolding' : ActorMethod<[bigint], boolean>,
  'getAllHoldings' : ActorMethod<[], Array<Holding>>,
  'getAveragePerformance' : ActorMethod<[], number>,
  'getTotalPortfolioValue' : ActorMethod<[], number>,
  'updateHolding' : ActorMethod<[bigint, bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
