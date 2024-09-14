import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Option "mo:base/Option";

actor StockHoldings {
  type Holding = {
    id: Nat;
    symbol: Text;
    name: Text;
    quantity: Nat;
    acquisitionPrice: Float;
    acquisitionDate: Int;
    currentPrice: Float;
    performance: Float;
  };

  stable var holdings: [Holding] = [];
  stable var nextId: Nat = 0;

  public func addHolding(symbol: Text, name: Text, quantity: Nat, acquisitionPrice: Float, currentPrice: Float) : async Nat {
    let performance = calculatePerformance(acquisitionPrice, currentPrice);
    
    let id = nextId;
    nextId += 1;
    let newHolding: Holding = {
      id;
      symbol;
      name;
      quantity;
      acquisitionPrice;
      acquisitionDate = Time.now();
      currentPrice;
      performance;
    };
    holdings := Array.append(holdings, [newHolding]);
    id
  };

  public query func getAllHoldings() : async [Holding] {
    holdings
  };

  public func updateHolding(id: Nat, quantity: Nat, currentPrice: Float) : async Bool {
    let updatedHoldings = Array.map<Holding, Holding>(holdings, func (h) {
      if (h.id == id) {
        let performance = calculatePerformance(h.acquisitionPrice, currentPrice);
        {
          id = h.id;
          symbol = h.symbol;
          name = h.name;
          quantity = quantity;
          acquisitionPrice = h.acquisitionPrice;
          acquisitionDate = h.acquisitionDate;
          currentPrice = currentPrice;
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

  public func deleteHolding(id: Nat) : async Bool {
    let initialLength = holdings.size();
    holdings := Array.filter<Holding>(holdings, func(h) { h.id != id });
    holdings.size() != initialLength
  };

  public query func getTotalPortfolioValue() : async Float {
    Array.foldLeft<Holding, Float>(holdings, 0, func(acc, h) { acc + h.currentPrice * Float.fromInt(h.quantity) })
  };

  public query func getAveragePerformance() : async Float {
    let totalValue = Array.foldLeft<Holding, Float>(holdings, 0, func(acc, h) { acc + h.currentPrice * Float.fromInt(h.quantity) });
    let weightedPerformance = Array.foldLeft<Holding, Float>(holdings, 0, func(acc, h) { acc + h.performance * h.currentPrice * Float.fromInt(h.quantity) });
    if (totalValue == 0) {
      0
    } else {
      weightedPerformance / totalValue
    }
  };

  private func calculatePerformance(acquisitionPrice: Float, currentPrice: Float) : Float {
    ((currentPrice - acquisitionPrice) / acquisitionPrice) * 100
  };
}