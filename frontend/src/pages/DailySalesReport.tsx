import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useTodaySales } from '../hooks/useQueries';
import { Loader2, TrendingUp, Package2 } from 'lucide-react';

function ReportContent() {
  const navigate = useNavigate();
  const { data: todaySales, isLoading, error, refetch } = useTodaySales();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-destructive font-medium">Failed to load sales data.</p>
        <button onClick={() => refetch()} className="btn-amber px-6 py-3 text-sm">
          Retry
        </button>
      </div>
    );
  }

  const sales = todaySales ?? [];
  const totalRevenue = sales.reduce((sum, [, , revenue]) => sum + revenue, 0);
  const totalUnits = sales.reduce((sum, [, qty]) => sum + Number(qty), 0);

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Daily Sales Report</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface px-4 py-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5" />
            Revenue
          </div>
          <div className="font-display font-bold text-2xl text-primary">
            {totalRevenue.toFixed(0)} AZN
          </div>
        </div>
        <div className="card-surface px-4 py-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
            <Package2 className="w-3.5 h-3.5" />
            Units Sold
          </div>
          <div className="font-display font-bold text-2xl text-foreground">
            {totalUnits}
          </div>
        </div>
      </div>

      {/* Sales breakdown */}
      {sales.length === 0 ? (
        <div className="card-surface px-5 py-10 flex flex-col items-center gap-3 text-center">
          <div className="text-4xl">📊</div>
          <p className="font-semibold text-foreground text-lg">No Sales Today</p>
          <p className="text-muted-foreground text-sm">
            Sales recorded today will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Breakdown by Product
          </h3>
          {sales.map(([productName, qty, revenue]) => (
            <div key={productName} className="card-surface px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-base leading-tight">{productName}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {Number(qty)} unit{Number(qty) !== 1 ? 's' : ''} sold
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-primary text-lg">{revenue.toFixed(0)} AZN</div>
                  <div className="text-muted-foreground text-xs">
                    avg {(revenue / Number(qty)).toFixed(1)} AZN/unit
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total row */}
          <div className="bg-primary/10 border border-primary/30 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground text-base">Total Revenue</p>
              <p className="text-muted-foreground text-sm">{totalUnits} units across {sales.length} product{sales.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="font-display font-bold text-2xl text-primary">
              {totalRevenue.toFixed(0)} AZN
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate({ to: '/' })}
        className="btn-ghost-border w-full text-base font-bold py-4 mt-2"
      >
        Back to Home
      </button>
    </div>
  );
}

export function DailySalesReport() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="Sales Report"
        description="Enter the password to view today's sales"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <ReportContent />;
}
