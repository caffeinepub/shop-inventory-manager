import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

actor {
  type Product = {
    name : Text;
    quantity : Nat;
    lastPurchasePrice : Float;
  };

  type Sale = {
    productName : Text;
    quantitySold : Nat;
    sellingPrice : Float;
    timestamp : Time.Time;
  };

  let products = Map.fromIter<Text, Product>([
    ("Marlboro Silver", { name = "Marlboro Silver"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Marlboro Gold", { name = "Marlboro Gold"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Parliament Silver", { name = "Parliament Silver"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Parliament Platinium", { name = "Parliament Platinium"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Parliament Superslim", { name = "Parliament Superslim"; quantity = 0; lastPurchasePrice = 0.0 }),
  ].values());

  let sales = List.empty<Sale>();

  public shared ({ caller }) func addStock(productName : Text, quantity : Nat, purchasePrice : Float) : async () {
    if (quantity <= 0) { Runtime.trap("Quantity must be positive") };

    switch (products.get(productName)) {
      case (?product) {
        let updatedProduct : Product = {
          name = product.name;
          quantity = product.quantity + quantity;
          lastPurchasePrice = purchasePrice;
        };
        products.add(productName, updatedProduct);
      };
      case (null) {
        Runtime.trap("Product does not exist");
      };
    };
  };

  public shared ({ caller }) func recordSale(productName : Text, quantitySold : Nat, sellingPrice : Float, timestamp : Time.Time) : async () {
    if (quantitySold <= 0) { Runtime.trap("Quantity sold must be positive") };

    switch (products.get(productName)) {
      case (?product) {
        if (product.quantity < quantitySold) {
          Runtime.trap("Insufficient stock");
        };

        let updatedProduct : Product = {
          name = product.name;
          quantity = product.quantity - quantitySold;
          lastPurchasePrice = product.lastPurchasePrice;
        };
        products.add(productName, updatedProduct);

        let newSale : Sale = {
          productName;
          quantitySold;
          sellingPrice;
          timestamp;
        };
        sales.add(newSale);
      };
      case (null) {
        Runtime.trap("Product does not exist");
      };
    };
  };

  func isToday(timestamp : Time.Time) : Bool {
    let now = Time.now();
    let secondsInDay : Int = 86400;
    let daysSinceEpoch = now / (secondsInDay * 1_000_000_000);
    let saleDaysSinceEpoch = timestamp / (secondsInDay * 1_000_000_000);
    daysSinceEpoch == saleDaysSinceEpoch;
  };

  public query ({ caller }) func getTodaySales() : async [(Text, Nat, Float)] {
    let todaySalesMap = Map.empty<Text, (Nat, Float)>();

    for (sale in sales.values()) {
      if (isToday(sale.timestamp)) {
        switch (todaySalesMap.get(sale.productName)) {
          case (? (quantity, revenue)) {
            todaySalesMap.add(
              sale.productName,
              (
                quantity + sale.quantitySold,
                revenue + (sale.quantitySold.toFloat() * sale.sellingPrice),
              ),
            );
          };
          case (null) {
            todaySalesMap.add(
              sale.productName,
              (
                sale.quantitySold,
                sale.quantitySold.toFloat() * sale.sellingPrice,
              ),
            );
          };
        };
      };
    };

    let result = List.empty<(Text, Nat, Float)>();
    for (entry in todaySalesMap.entries()) {
      let (productName, (quantity, revenue)) = entry;
      result.add((productName, quantity, revenue));
    };
    result.toArray();
  };

  public shared ({ caller }) func resetStocks() : async () {
    for (entry in products.entries()) {
      let (productName, product) = entry;
      let updatedProduct : Product = {
        name = product.name;
        quantity = 0;
        lastPurchasePrice = product.lastPurchasePrice;
      };
      products.add(productName, updatedProduct);
    };
  };
};
