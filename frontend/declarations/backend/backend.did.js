export const idlFactory = ({ IDL }) => {
  const Holding = IDL.Record({
    'id' : IDL.Nat,
    'acquisitionPrice' : IDL.Float64,
    'currentPrice' : IDL.Float64,
    'acquisitionDate' : IDL.Int,
    'name' : IDL.Text,
    'performance' : IDL.Float64,
    'quantity' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  return IDL.Service({
    'addHolding' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Float64, IDL.Float64],
        [IDL.Nat],
        [],
      ),
    'deleteHolding' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getAllHoldings' : IDL.Func([], [IDL.Vec(Holding)], ['query']),
    'getAveragePerformance' : IDL.Func([], [IDL.Float64], ['query']),
    'getTotalPortfolioValue' : IDL.Func([], [IDL.Float64], ['query']),
    'updateHolding' : IDL.Func([IDL.Nat, IDL.Nat, IDL.Float64], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
