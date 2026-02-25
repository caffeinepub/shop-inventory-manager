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
export interface backendInterface {
    addStock(productName: string, quantity: bigint, purchasePrice: number): Promise<void>;
    getTodaySales(): Promise<Array<[string, bigint, number]>>;
    recordSale(productName: string, quantitySold: bigint, sellingPrice: number, timestamp: Time): Promise<void>;
    resetStocks(): Promise<void>;
}
