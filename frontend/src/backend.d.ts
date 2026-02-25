import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ZReport {
    totalProfit: number;
    totalRevenue: number;
    products: Array<ZReportProduct>;
    totalQuantity: bigint;
}
export interface ZReportProduct {
    purchasePrice: number;
    revenue: number;
    sellingPrice: number;
    productName: string;
    quantitySold: bigint;
    profit: number;
}
export interface backendInterface {
    addProduct(productName: string): Promise<boolean>;
    addStock(productName: string, quantity: bigint, purchasePrice: number): Promise<boolean>;
    deleteProduct(productName: string): Promise<boolean>;
    getSalesHistory(): Promise<Array<[string, bigint, number, Time]>>;
    getStockLevels(): Promise<Array<[string, bigint]>>;
    getZReport(): Promise<ZReport>;
    recordSale(productName: string, quantitySold: bigint, sellingPrice: number, timestamp: Time): Promise<boolean>;
    resetInventory(): Promise<boolean>;
}
