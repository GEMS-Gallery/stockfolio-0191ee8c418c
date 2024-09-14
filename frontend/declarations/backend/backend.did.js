export const idlFactory = ({ IDL }) => {
  const Holding = IDL.Record({
    'id' : IDL.Nat,
    'marketValue' : IDL.Float64,
    'name' : IDL.Text,
    'performance' : IDL.Float64,
    'quantity' : IDL.Nat,
  });
  return IDL.Service({
    'addHolding' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Float64, IDL.Float64],
        [IDL.Nat],
        [],
      ),
    'deleteHolding' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getAllHoldings' : IDL.Func([], [IDL.Vec(Holding)], ['query']),
    'getAveragePerformance' : IDL.Func([], [IDL.Float64], ['query']),
    'getTotalPortfolioValue' : IDL.Func([], [IDL.Float64], ['query']),
    'updateHolding' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Nat, IDL.Float64, IDL.Float64],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
