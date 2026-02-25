import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useStockLevels } from '../hooks/useQueries';
import { Loader2, Package, RefreshCw } from 'lucide-react';

function InventoryContent() {
  const navigate = useNavigate();
  const { data: stockLevels, isLoading, error, refetch } = useStockLevels();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Yüklənir...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-destructive font-medium">Stok məlumatları yüklənmədi.</p>
        <button onClick={() => refetch()} className="btn-amber px-6 py-3 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  // Build a sorted list of products from stock levels
  const products = stockLevels
    ? stockLevels.map(([name, qty]) => ({ name, qty: Number(qty) })).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const totalStock = products.reduce((sum, p) => sum + p.qty, 0);

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Anbar</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Cari stok səviyyələri</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5">
            {new Date().toLocaleDateString('az-AZ')}
          </div>
          <div className="text-xs text-muted-foreground">
            Cəmi: <span className="text-foreground font-semibold">{totalStock} ədəd</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <div className="card-surface px-5 py-8 text-center text-muted-foreground text-sm">
            Anbar boşdur. Məhsul İdarəetməsindən məhsul əlavə edin.
          </div>
        ) : (
          products.map(({ name, qty }) => {
            const isLow = qty > 0 && qty <= 10;
            const isEmpty = qty === 0;

            return (
              <div
                key={name}
                className="card-surface px-5 py-4 flex items-center gap-4"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/15 shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-base leading-tight">{name}</p>
                  <p className={`text-xs mt-0.5 ${
                    isEmpty
                      ? 'text-destructive font-medium'
                      : isLow
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                  }`}>
                    {isEmpty
                      ? 'Stok yoxdur'
                      : isLow
                      ? 'Az qalıb'
                      : 'Stokda var'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-muted-foreground text-xs mb-0.5">Qalıq</div>
                  <div className={`font-bold text-2xl font-display ${
                    isEmpty
                      ? 'text-destructive'
                      : isLow
                      ? 'text-primary'
                      : 'text-foreground'
                  }`}>
                    {qty}
                  </div>
                  <div className="text-muted-foreground text-xs">ədəd</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => refetch()}
        className="btn-ghost-border w-full text-sm font-medium py-3 flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Yenilə
      </button>

      <button
        onClick={() => navigate({ to: '/' })}
        className="btn-ghost-border w-full text-base font-bold py-4"
      >
        Ana Səhifəyə Qayıt
      </button>
    </div>
  );
}

export function ViewInventory() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="Anbara Bax"
        description="Stok səviyyələrini görmək üçün şifrəni daxil edin"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <InventoryContent />;
}
