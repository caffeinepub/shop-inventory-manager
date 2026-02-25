import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export const PRODUCTS = [
  'Marlboro Silver',
  'Marlboro Gold',
  'Parliament Silver',
  'Parliament Platinium',
  'Parliament Superslim',
] as const;

export type ProductName = (typeof PRODUCTS)[number];

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
      if (!actor) throw new Error('Actor not ready');
      await actor.addStock(productName, BigInt(quantity), purchasePrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySales'] });
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
      if (!actor) throw new Error('Actor not ready');
      const timestamp = BigInt(Date.now()) * BigInt(1_000_000); // ms → ns
      await actor.recordSale(productName, BigInt(quantitySold), sellingPrice, timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySales'] });
    },
  });
}

// ─── Today's Sales ───────────────────────────────────────────────────────────

export function useTodaySales() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, bigint, number]>>({
    queryKey: ['todaySales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaySales();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Reset Stocks ────────────────────────────────────────────────────────────

export function useResetStocks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      await actor.resetStocks();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaySales'] });
    },
  });
}
