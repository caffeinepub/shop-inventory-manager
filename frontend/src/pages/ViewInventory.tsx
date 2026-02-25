import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useActor } from '../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { PRODUCTS } from '../hooks/useQueries';
import { Loader2, Package, RefreshCw } from 'lucide-react';

// We need to query the backend for product data.
// The backend doesn't expose a direct getProducts query, so we use getTodaySales
// to get sales data and display stock info. However, the backend doesn't expose
// a getProducts/getAllProducts query. We'll show a note about this limitation.
// Actually, looking at the backend, there's no getProducts query exposed.
// We'll use a workaround: we can still show the inventory by calling getTodaySales
// but for actual stock quantities we need a getProducts endpoint.
// Since it's not available, we'll document this as a backend gap and show
// what we can from the available data.

// NOTE: Backend doesn't expose getProducts. We'll show a message and use
// what's available. See backend-gaps section.

function InventoryContent() {
  const { actor, isFetching } = useActor();
  const navigate = useNavigate();

  // Since there's no getProducts query, we'll show a placeholder with product names
  // and indicate stock data is not available via query.
  // We'll attempt to use a workaround by calling getTodaySales for context.
  const { data: todaySales, isLoading } = useQuery({
    queryKey: ['todaySales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaySales();
    },
    enabled: !!actor && !isFetching,
  });

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Build a map of today's sales for reference
  const salesMap = new Map<string, { qty: bigint; revenue: number }>();
  if (todaySales) {
    for (const [name, qty, revenue] of todaySales) {
      salesMap.set(name, { qty, revenue });
    }
  }

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Inventory</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Current stock levels</p>
        </div>
        <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive/90">
        ⚠️ Live stock quantities require a backend update. Showing product list only.
      </div>

      <div className="flex flex-col gap-3">
        {PRODUCTS.map((product, index) => (
          <div
            key={product}
            className="card-surface px-5 py-4 flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-base leading-tight">{product}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sold today: {salesMap.has(product) ? Number(salesMap.get(product)!.qty) : 0} units
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-muted-foreground text-xs">Stock</div>
              <div className="text-foreground font-bold text-lg">—</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate({ to: '/' })}
        className="btn-ghost-border w-full text-base font-bold py-4 mt-2"
      >
        Back to Home
      </button>
    </div>
  );
}

export function ViewInventory() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="View Inventory"
        description="Enter the password to view stock levels"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <InventoryContent />;
}
