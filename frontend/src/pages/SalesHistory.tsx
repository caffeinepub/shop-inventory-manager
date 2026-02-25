import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useSalesHistory, useStockLevels } from '../hooks/useQueries';
import { Loader2, RefreshCw, Calendar, Package } from 'lucide-react';

type DateFilter = 'today' | 'week' | 'all';

function formatTimestamp(ts: bigint): string {
  // ts is in nanoseconds
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isToday(ts: bigint): boolean {
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isThisWeek(ts: bigint): boolean {
  const ms = Number(ts / BigInt(1_000_000));
  const date = new Date(ms);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

function SalesHistoryContent() {
  const navigate = useNavigate();
  const { data: salesHistory, isLoading, error, refetch } = useSalesHistory();
  const { data: stockLevels } = useStockLevels();

  const [productFilter, setProductFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Derive product names dynamically from stock levels
  const productNames = useMemo(() => {
    if (!stockLevels) return [];
    return stockLevels.map(([name]) => name).sort((a, b) => a.localeCompare(b));
  }, [stockLevels]);

  const filteredSales = useMemo(() => {
    if (!salesHistory) return [];
    return salesHistory
      .filter((sale) => {
        if (productFilter !== 'all' && sale.productName !== productFilter) return false;
        if (dateFilter === 'today' && !isToday(sale.timestamp)) return false;
        if (dateFilter === 'week' && !isThisWeek(sale.timestamp)) return false;
        return true;
      })
      .slice()
      .reverse(); // newest first
  }, [salesHistory, productFilter, dateFilter]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.quantity, 0);

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
        <p className="text-destructive font-medium">Satış tarixçəsi yüklənmədi.</p>
        <button
          onClick={() => refetch()}
          className="btn-amber px-6 py-3 text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Satış Tarixçəsi</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Bütün satış qeydləri</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Date filter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5" />
            Tarix Filtri
          </div>
          <div className="flex gap-2">
            {([
              { key: 'today', label: 'Bu Gün' },
              { key: 'week', label: 'Bu Həftə' },
              { key: 'all', label: 'Hamısı' },
            ] as { key: DateFilter; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateFilter(key)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  dateFilter === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                }`}
                style={{ minHeight: '44px' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Product filter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <Package className="w-3.5 h-3.5" />
            Məhsul Filtri
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setProductFilter('all')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                productFilter === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
              style={{ minHeight: '44px' }}
            >
              Hamısı
            </button>
            {productNames.map((product) => (
              <button
                key={product}
                onClick={() => setProductFilter(product)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  productFilter === product
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                }`}
                style={{ minHeight: '44px' }}
              >
                {product.replace('Parliament ', 'Parl. ').replace('Marlboro ', 'Marl. ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {filteredSales.length > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{filteredSales.length}</span> qeyd ·{' '}
            <span className="text-foreground font-semibold">{totalUnits}</span> ədəd
          </div>
          <div className="font-display font-bold text-lg text-primary">
            {totalRevenue.toFixed(2)} AZN
          </div>
        </div>
      )}

      {/* Sales list */}
      {filteredSales.length === 0 ? (
        <div className="card-surface px-5 py-10 flex flex-col items-center gap-3 text-center">
          <div className="text-4xl">🔍</div>
          <p className="font-semibold text-foreground text-lg">Satış Tapılmadı</p>
          <p className="text-muted-foreground text-sm">
            Seçilmiş filtrlərə uyğun satış qeydi yoxdur.
          </p>
          {(productFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setProductFilter('all');
                setDateFilter('all');
              }}
              className="btn-amber px-5 py-2.5 text-sm font-semibold mt-1"
            >
              Filtrləri Sıfırla
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredSales.map((sale, idx) => (
            <div key={idx} className="card-surface px-4 py-3 flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 shrink-0">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-tight truncate">
                  {sale.productName}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {formatTimestamp(sale.timestamp)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-primary text-base">
                  {(sale.price * sale.quantity).toFixed(2)} AZN
                </div>
                <div className="text-muted-foreground text-xs">
                  {sale.quantity} ədəd × {sale.price.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export function SalesHistory() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="Satış Tarixçəsi"
        description="Satış qeydlərini görmək üçün şifrəni daxil edin"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <SalesHistoryContent />;
}
