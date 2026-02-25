import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ZReport } from '../backend';

// ─── Add Stock ───────────────────────────────────────────────────────────────

export function useAddStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productName,
      quantity,
      purchasePrice,
    }: {
      productName: string;
      quantity: number;
      purchasePrice: number;
    }) => {
      if (!actor) throw new Error('Actor hazır deyil');
      const result = await actor.addStock(productName, BigInt(quantity), purchasePrice);
      if (!result) {
        throw new Error('Stok əlavə edilmədi. Məhsul tapılmadı və ya miqdar sıfırdır.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] });
      queryClient.invalidateQueries({ queryKey: ['zReport'] });
    },
  });
}

// ─── Record Sale ─────────────────────────────────────────────────────────────

export function useRecordSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productName,
      quantitySold,
      sellingPrice,
    }: {
      productName: string;
      quantitySold: number;
      sellingPrice: number;
    }) => {
      if (!actor) throw new Error('Actor hazır deyil');
      const timestamp = BigInt(Date.now()) * BigInt(1_000_000); // ms → ns
      const result = await actor.recordSale(
        productName,
        BigInt(quantitySold),
        sellingPrice,
        timestamp,
      );
      if (!result) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] });
      queryClient.invalidateQueries({ queryKey: ['zReport'] });
    },
  });
}

// ─── Stock Levels ────────────────────────────────────────────────────────────

export function useStockLevels() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['stockLevels'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getStockLevels();
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Sales History ───────────────────────────────────────────────────────────

export interface SaleRecord {
  productName: string;
  quantity: number;
  price: number;
  timestamp: bigint;
}

export function useSalesHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<SaleRecord[]>({
    queryKey: ['salesHistory'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getSalesHistory();
      return result.map(([productName, qty, price, timestamp]) => ({
        productName,
        quantity: Number(qty),
        price,
        timestamp,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Z Report ────────────────────────────────────────────────────────────────

export function useZReport() {
  const { actor, isFetching } = useActor();

  return useQuery<ZReport>({
    queryKey: ['zReport'],
    queryFn: async () => {
      if (!actor) {
        return {
          products: [],
          totalRevenue: 0,
          totalProfit: 0,
          totalQuantity: BigInt(0),
        };
      }
      const result = await actor.getZReport();
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Add Product ─────────────────────────────────────────────────────────────

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName: string) => {
      if (!actor) throw new Error('Actor hazır deyil');
      const result = await actor.addProduct(productName);
      if (!result) {
        throw new Error('Bu adda məhsul artıq mövcuddur.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] });
      queryClient.invalidateQueries({ queryKey: ['zReport'] });
    },
  });
}

// ─── Delete Product ───────────────────────────────────────────────────────────

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productName: string) => {
      if (!actor) throw new Error('Actor hazır deyil');
      const result = await actor.deleteProduct(productName);
      if (!result) {
        throw new Error('Məhsul tapılmadı.');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['salesHistory'] });
      queryClient.invalidateQueries({ queryKey: ['zReport'] });
    },
  });
}
