import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAddStock, useStockLevels } from '../hooks/useQueries';

type Step = 'product' | 'quantity' | 'price' | 'success';

const QUANTITY_OPTIONS = [10, 20, 50];
const PRICE_OPTIONS = [0.50, 0.60, 0.70];

export function AddStock() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('product');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [manualPrice, setManualPrice] = useState('');
  const [error, setError] = useState('');

  const addStockMutation = useAddStock();
  const { data: stockLevels, isLoading: productsLoading } = useStockLevels();

  // Derive sorted product names from stock levels
  const products = stockLevels
    ? stockLevels.map(([name]) => name).sort((a, b) => a.localeCompare(b))
    : [];

  const effectivePrice = selectedPrice !== null ? selectedPrice : parseFloat(manualPrice);

  const handleSubmit = async () => {
    const price = effectivePrice;
    if (isNaN(price) || price <= 0) {
      setError('Zəhmət olmasa düzgün qiymət daxil edin.');
      return;
    }
    setError('');
    try {
      await addStockMutation.mutateAsync({
        productName: selectedProduct,
        quantity: selectedQuantity,
        purchasePrice: price,
      });
      setStep('success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Stok əlavə edilmədi. Yenidən cəhd edin.';
      setError(msg);
    }
  };

  if (step === 'success') {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-6 pt-8 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Stok Əlavə Edildi!</h2>
          <p className="text-muted-foreground mt-2">
            <span className="text-foreground font-semibold">{selectedProduct}</span>
            {' '}+{selectedQuantity} ədəd @ {effectivePrice.toFixed(2)} AZN
          </p>
        </div>
        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => {
              setStep('product');
              setSelectedProduct('');
              setSelectedQuantity(0);
              setSelectedPrice(null);
              setManualPrice('');
              setError('');
            }}
            className="btn-amber w-full text-lg font-bold py-4"
          >
            Daha Çox Stok Əlavə Et
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="btn-ghost-border w-full text-lg font-bold py-4"
          >
            Ana Səhifəyə Qayıt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex gap-2">
        {(['product', 'quantity', 'price'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step === s
                ? 'bg-primary'
                : (['product', 'quantity', 'price'] as Step[]).indexOf(step) > i
                ? 'bg-primary/50'
                : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step: Product */}
      {step === 'product' && (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">Məhsul Seçin</h2>
            <p className="text-muted-foreground text-sm mt-1">Hansı məhsulu stoka əlavə edirsiniz?</p>
          </div>
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground text-sm">Yüklənir...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <button
                  key={product}
                  onClick={() => {
                    setSelectedProduct(product);
                    setStep('quantity');
                  }}
                  className="btn-ghost-border w-full text-left px-5 py-4 text-base font-semibold"
                >
                  {product}
                </button>
              ))}
              {products.length === 0 && (
                <div className="card-surface px-5 py-8 text-center text-muted-foreground text-sm">
                  Məhsul tapılmadı. Əvvəlcə Məhsul İdarəetməsindən məhsul əlavə edin.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step: Quantity */}
      {step === 'quantity' && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wide">{selectedProduct}</p>
            <h2 className="font-display font-bold text-2xl text-foreground">Miqdar Seçin</h2>
            <p className="text-muted-foreground text-sm mt-1">Neçə ədəd əlavə edirsiniz?</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {QUANTITY_OPTIONS.map((qty) => (
              <button
                key={qty}
                onClick={() => {
                  setSelectedQuantity(qty);
                  setStep('price');
                }}
                className="btn-amber flex flex-col items-center justify-center py-5 text-xl font-bold"
              >
                <span className="text-2xl font-display">+{qty}</span>
                <span className="text-xs opacity-70 mt-0.5">ədəd</span>
              </button>
            ))}
          </div>
          {/* Custom quantity input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Və ya əl ilə daxil edin:</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="Miqdar"
                className="flex-1 bg-card border border-border rounded-xl px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ fontSize: '16px' }}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setSelectedQuantity(val);
                }}
              />
              <button
                onClick={() => {
                  if (selectedQuantity > 0) setStep('price');
                }}
                className="btn-amber px-5 py-4 font-bold"
              >
                →
              </button>
            </div>
          </div>
          <button
            onClick={() => setStep('product')}
            className="text-muted-foreground text-sm underline text-center mt-2"
          >
            ← Məhsulu dəyiş
          </button>
        </div>
      )}

      {/* Step: Price */}
      {step === 'price' && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wide">
              {selectedProduct} · +{selectedQuantity} ədəd
            </p>
            <h2 className="font-display font-bold text-2xl text-foreground">Alış Qiyməti</h2>
            <p className="text-muted-foreground text-sm mt-1">Hər ədəd üçün nə qədər ödədiniz?</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PRICE_OPTIONS.map((price) => (
              <button
                key={price}
                onClick={() => {
                  setSelectedPrice(price);
                  setManualPrice('');
                }}
                className={`btn-ghost-border flex flex-col items-center justify-center py-5 ${
                  selectedPrice === price ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <span className="text-xl font-display font-bold">{price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground mt-0.5">AZN</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Və ya əl ilə daxil edin:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={manualPrice}
              onChange={(e) => {
                setManualPrice(e.target.value);
                setSelectedPrice(null);
              }}
              placeholder="0.00 AZN"
              className="w-full bg-card border border-border rounded-xl px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ fontSize: '16px' }}
            />
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={addStockMutation.isPending || (selectedPrice === null && !manualPrice)}
            className="btn-amber w-full text-lg font-bold py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {addStockMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Əlavə edilir...
              </>
            ) : (
              'Təsdiq et və Əlavə et'
            )}
          </button>

          <button
            onClick={() => setStep('quantity')}
            className="text-muted-foreground text-sm underline text-center"
          >
            ← Miqdarı dəyiş
          </button>
        </div>
      )}
    </div>
  );
}
