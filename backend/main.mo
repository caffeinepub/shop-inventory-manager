import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

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

  type ZReportProduct = {
    productName : Text;
    quantitySold : Nat;
    sellingPrice : Float;
    purchasePrice : Float;
    revenue : Float;
    profit : Float;
  };

  type ZReport = {
    products : [ZReportProduct];
    totalRevenue : Float;
    totalProfit : Float;
    totalQuantity : Nat;
  };

  let products = Map.fromIter<Text, Product>([
    ("Marlboro Silver", { name = "Marlboro Silver"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Marlboro Gold", { name = "Marlboro Gold"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Parliament Silver", { name = "Parliament Silver"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Parliament Platinium", { name = "Parliament Platinium"; quantity = 0; lastPurchasePrice = 0.0 }),
    ("Parliament Superslim", { name = "Parliament Superslim"; quantity = 0; lastPurchasePrice = 0.0 }),
  ].values());

  let sales = List.empty<Sale>();

  public shared ({ caller }) func addStock(productName : Text, quantity : Nat, purchasePrice : Float) : async Bool {
    if (quantity == 0) {
      return false;
    };

    switch (products.get(productName)) {
      case (?product) {
        let updatedProduct : Product = {
          name = product.name;
          quantity = product.quantity + quantity;
          lastPurchasePrice = purchasePrice;
        };
        products.add(productName, updatedProduct);
        true;
      };
      case (null) {
        false;
      };
    };
  };

  public shared ({ caller }) func recordSale(productName : Text, quantitySold : Nat, sellingPrice : Float, timestamp : Time.Time) : async Bool {
    if (quantitySold == 0) {
      return false;
    };

    switch (products.get(productName)) {
      case (?product) {
        if (quantitySold > product.quantity) {
          return false;
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
        true;
      };
      case (null) {
        false;
      };
    };
  };

  public query ({ caller }) func getStockLevels() : async [(Text, Nat)] {
    let stockList = List.empty<(Text, Nat)>();
    for ((productName, product) in products.entries()) {
      stockList.add((productName, product.quantity));
    };
    stockList.toArray();
  };

  public query ({ caller }) func getSalesHistory() : async [(Text, Nat, Float, Time.Time)] {
    let salesArray = sales.toArray();
    let salesHistory = List.empty<(Text, Nat, Float, Time.Time)>();

    for (sale in salesArray.values()) {
      salesHistory.add(
        (
          sale.productName,
          sale.quantitySold,
          sale.sellingPrice,
          sale.timestamp,
        )
      );
    };

    salesHistory.toArray();
  };

  public query ({ caller }) func getZReport() : async ZReport {
    let today = Time.now();

    let dailySales = sales.toArray().filter(
      func(sale) {
        let saleDay = sale.timestamp / (24 * 60 * 60 * 1_000_000_000);
        let currentDay = today / (24 * 60 * 60 * 1_000_000_000);
        saleDay == currentDay;
      }
    );

    let productMap = Map.empty<Text, (Nat, Float, Float)>();

    // Aggregate sales data per product
    let aggregatedSales = dailySales.foldRight(
      productMap,
      func(sale, acc) {
        let previous = acc.get(sale.productName);
        let updated = switch (previous) {
          case (? (qty, price, totalRevenue)) {
            (qty + sale.quantitySold, price, totalRevenue + sale.quantitySold.toFloat() * sale.sellingPrice);
          };
          case (null) {
            (sale.quantitySold, sale.sellingPrice, sale.quantitySold.toFloat() * sale.sellingPrice);
          };
        };
        acc.add(sale.productName, updated);
        acc;
      },
    );

    // Map aggregated sales to ZReportProduct array
    let zReportProducts = aggregatedSales.entries().toArray().map(
      func((productName, (quantitySold, sellingPrice, _))) {
        let purchasePrice = switch (products.get(productName)) {
          case (?product) { product.lastPurchasePrice };
          case (null) { 0.0 };
        };

        let revenue = quantitySold.toFloat() * sellingPrice;
        let profit = quantitySold.toFloat() * (sellingPrice - purchasePrice);

        {
          productName;
          quantitySold;
          sellingPrice;
          purchasePrice;
          revenue;
          profit;
        };
      }
    );

    let (totalRevenue, totalProfit, totalQuantity) = zReportProducts.foldLeft(
      (0.0, 0.0, 0),
      func(acc, zProduct) {
        let (sumRevenue, sumProfit, sumQuantity) = acc;
        (sumRevenue + zProduct.revenue, sumProfit + zProduct.profit, sumQuantity + zProduct.quantitySold);
      },
    );

    {
      products = zReportProducts;
      totalRevenue;
      totalProfit;
      totalQuantity;
    };
  };

  public shared ({ caller }) func addProduct(productName : Text) : async Bool {
    switch (products.get(productName)) {
      case (?_) { false };
      case (null) {
        let newProduct : Product = {
          name = productName;
          quantity = 0;
          lastPurchasePrice = 0.0;
        };
        products.add(productName, newProduct);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productName : Text) : async Bool {
    switch (products.get(productName)) {
      case (?_) {
        products.remove(productName);

        let filteredSales = sales.reverse().filter(
          func(sale) { sale.productName != productName }
        );
        sales.clear();
        let filteredSalesArray = filteredSales.toArray();
        let reversedFilteredSales = List.fromArray<Sale>(filteredSalesArray.reverse());
        sales.addAll(reversedFilteredSales.values());
        true;
      };
      case (null) { false };
    };
  };
};
