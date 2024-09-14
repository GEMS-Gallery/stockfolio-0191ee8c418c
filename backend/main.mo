import Bool "mo:base/Bool";
import Func "mo:base/Func";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Text "mo:base/Text";

actor StockHoldings {
  // Define the structure for a stock holding
  public type Holding = {
    id: Nat;
    name: Text;
    quantity: Nat;
    marketValue: Float;
    performance: Float;
  };

  stable var holdings: [Holding] = [];
  stable var nextId: Nat = 0;

  // Function to add a new holding
  public func addHolding(name: Text, quantity: Nat, marketValue: Float, performance: Float) : async Nat {
    let id = nextId;
    nextId += 1;
    let newHolding: Holding = {
      id;
      name;
      quantity;
      marketValue;
      performance;
    };
    holdings := Array.append(holdings, [newHolding]);
    id
  };

  // Function to get all holdings
  public query func getAllHoldings() : async [Holding] {
    holdings
  };

  // Function to update a holding
  public func updateHolding(id: Nat, name: Text, quantity: Nat, marketValue: Float, performance: Float) : async Bool {
    let updatedHoldings = Array.map<Holding, Holding>(holdings, func (h) {
      if (h.id == id) {
        {
          id = h.id;
          name = name;
          quantity = quantity;
          marketValue = marketValue;
          performance = performance;
        }
      } else {
        h
      }
    });
    
    if (holdings != updatedHoldings) {
      holdings := updatedHoldings;
      true
    } else {
      false
    }
  };

  // Function to delete a holding
  public func deleteHolding(id: Nat) : async Bool {
    let initialLength = holdings.size();
    holdings := Array.filter<Holding>(holdings, func(h) { h.id != id });
    holdings.size() != initialLength
  };

  // Function to calculate total portfolio value
  public query func getTotalPortfolioValue() : async Float {
    Array.foldLeft<Holding, Float>(holdings, 0, func(acc, h) { acc + h.marketValue * Float.fromInt(h.quantity) })
  };

  // Function to calculate average portfolio performance
  public query func getAveragePerformance() : async Float {
    let totalValue = Array.foldLeft<Holding, Float>(holdings, 0, func(acc, h) { acc + h.marketValue * Float.fromInt(h.quantity) });
    let weightedPerformance = Array.foldLeft<Holding, Float>(holdings, 0, func(acc, h) { acc + h.performance * h.marketValue * Float.fromInt(h.quantity) });
    if (totalValue == 0) {
      0
    } else {
      weightedPerformance / totalValue
    }
  };
}