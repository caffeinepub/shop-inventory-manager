import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useZReport } from '../hooks/useQueries';
import { Loader2, TrendingUp, Package2, TrendingDown, DollarSign } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

function ReportContent() {
  const navigate = useNavigate();
  const { data: zReport, isLoading, error, refetch } = useZReport();
  const [sharing, setSharing] = useState(false);

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
        <p className="text-destructive font-medium">Satış məlumatları yüklənmədi.</p>
        <button onClick={() => refetch()} className="btn-amber px-6 py-3 text-sm">
          Yenidən cəhd et
        </button>
      </div>
    );
  }

  const products = zReport?.products ?? [];
  const totalRevenue = zReport?.totalRevenue ?? 0;
  const totalProfit = zReport?.totalProfit ?? 0;
  const totalQuantity = Number(zReport?.totalQuantity ?? 0);

  const handleWhatsAppShare = () => {
    setSharing(true);
    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      let text = `🏪 *Shop POS — Z Hesabatı*\n`;
      text += `📅 Tarix: ${dateStr}\n`;
      text += `─────────────────\n`;

      if (products.length === 0) {
        text += `Bu gün satış qeyd edilməyib.\n`;
      } else {
        products.forEach(({ productName, quantitySold, sellingPrice, purchasePrice, revenue, profit }) => {
          text += `📦 ${productName}\n`;
          text += `   ${Number(quantitySold)} ədəd × ${sellingPrice.toFixed(2)} AZN = ${revenue.toFixed(2)} AZN\n`;
          text += `   Alış: ${purchasePrice.toFixed(2)} AZN | Xeyir: ${profit.toFixed(2)} AZN\n`;
        });
        text += `─────────────────\n`;
        text += `📊 Ümumi Satılan: ${totalQuantity} ədəd\n`;
        text += `💰 Ümumi Gəlir: ${totalRevenue.toFixed(2)} AZN\n`;
        text += `📈 Ümumi Xeyir: ${totalProfit.toFixed(2)} AZN\n`;
      }

      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Günlük Satış Hesabatı</h2>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString('az-AZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card-surface px-3 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
            <TrendingUp className="w-3 h-3" />
            Gəlir
          </div>
          <div className="font-display font-bold text-lg text-primary leading-tight">
            {totalRevenue.toFixed(2)}
            <span className="text-xs font-normal ml-0.5">AZN</span>
          </div>
        </div>
        <div className="card-surface px-3 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
            <DollarSign className="w-3 h-3" />
            Xeyir
          </div>
          <div className={`font-display font-bold text-lg leading-tight ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
            {totalProfit.toFixed(2)}
            <span className="text-xs font-normal ml-0.5">AZN</span>
          </div>
        </div>
        <div className="card-surface px-3 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wide">
            <Package2 className="w-3 h-3" />
            Ədəd
          </div>
          <div className="font-display font-bold text-lg text-foreground leading-tight">
            {totalQuantity}
          </div>
        </div>
      </div>

      {/* Sales breakdown */}
      {products.length === 0 ? (
        <div className="card-surface px-5 py-10 flex flex-col items-center gap-3 text-center">
          <div className="text-4xl">📊</div>
          <p className="font-semibold text-foreground text-lg">Bu Gün Satış Yoxdur</p>
          <p className="text-muted-foreground text-sm">
            Bu gün qeyd edilən satışlar burada görünəcək.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Məhsula Görə Bölgü
          </h3>
          {products.map(({ productName, quantitySold, sellingPrice, purchasePrice, revenue, profit }) => (
            <div key={productName} className="card-surface px-4 py-4">
              {/* Product name */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="font-semibold text-foreground text-base leading-tight">{productName}</p>
                <div className="text-right shrink-0">
                  <div className="font-bold text-primary text-lg leading-tight">{revenue.toFixed(2)} AZN</div>
                  <div className="text-muted-foreground text-xs">gəlir</div>
                </div>
              </div>
              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs">Satılan</span>
                  <span className="font-bold text-foreground text-sm">{Number(quantitySold)} ədəd</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs">Satış qiyməti</span>
                  <span className="font-bold text-foreground text-sm">{sellingPrice.toFixed(2)} AZN</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs">Alış qiyməti</span>
                  <span className="font-bold text-foreground text-sm">{purchasePrice.toFixed(2)} AZN</span>
                </div>
              </div>
              {/* Profit row */}
              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">Xeyir (satış − alış)</span>
                <span className={`font-bold text-sm ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {profit >= 0 ? '+' : ''}{profit.toFixed(2)} AZN
                </span>
              </div>
            </div>
          ))}

          {/* Total summary row */}
          <div className="bg-primary/10 border border-primary/30 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-foreground text-base">Günlük Cəmi</p>
              <p className="text-muted-foreground text-sm">{totalQuantity} ədəd · {products.length} məhsul</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Ümumi Gəlir</span>
                <span className="font-display font-bold text-xl text-primary">{totalRevenue.toFixed(2)} AZN</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">Ümumi Xeyir</span>
                <span className={`font-display font-bold text-xl ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} AZN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Z Report WhatsApp Share Button */}
      <button
        onClick={handleWhatsAppShare}
        disabled={sharing}
        className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98]"
        style={{
          minHeight: '56px',
          background: 'oklch(0.55 0.18 145)',
        }}
      >
        {sharing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Hazırlanır...
          </>
        ) : (
          <>
            <SiWhatsapp className="w-5 h-5" />
            Z Hesabatı WhatsApp ilə Paylaş
          </>
        )}
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

export function DailySalesReport() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="Satış Hesabatı"
        description="Bugünkü satışları görmək üçün şifrəni daxil edin"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <ReportContent />;
}
