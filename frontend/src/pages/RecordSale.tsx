import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRecordSale, useStockLevels } from '../hooks/useQueries';

type Step = 'product' | 'quantity' | 'price' | 'success';

const QUANTITY_OPTIONS = [1, 2, 5, 10];
const PRICE_OPTIONS = [9, 10, 11, 12];

export function RecordSale() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('product');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [priceInput, setPriceInput] = useState('');
  const [error, setError] = useState('');

  const recordSaleMutation = useRecordSale();
  const { data: stockLevels, isLoading: productsLoading } = useStockLevels();

  // Derive sorted product names from stock levels
  const products = stockLevels
    ? stockLevels.map(([name]) => name).sort((a, b) => a.localeCompare(b))
    : [];

  const effectivePrice = parseFloat(priceInput);
  const isPriceValid = priceInput.trim() !== '' && !isNaN(effectivePrice) && effectivePrice > 0;

  const handlePresetPrice = (price: number) => {
    setSelectedPrice(price);
    setPriceInput(String(price));
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPriceInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedPrice(parsed);
    } else {
      setSelectedPrice(0);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!isPriceValid) return;
    try {
      await recordSaleMutation.mutateAsync({
        productName: selectedProduct,
        quantitySold: selectedQuantity,
        sellingPrice: effectivePrice,
      });
      setStep('success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'INSUFFICIENT_STOCK' || msg.toLowerCase().includes('insufficient')) {
        setError('Stok kifayət deyil! Bu məhsulun anbarında yetəri qədər mal yoxdur.');
      } else {
        setError('Satış qeyd edilmədi. Yenidən cəhd edin.');
      }
    }
  };

  if (step === 'success') {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-6 pt-8 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Satış Qeyd Edildi!</h2>
          <p className="text-muted-foreground mt-2">
            <span className="text-foreground font-semibold">{selectedProduct}</span>
            {' '}×{selectedQuantity} @ {effectivePrice} AZN
          </p>
          <p className="text-primary font-bold text-xl mt-2">
            Cəmi: {(selectedQuantity * effectivePrice).toFixed(2)} AZN
          </p>
        </div>
        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => {
              setStep('product');
              setSelectedProduct('');
              setSelectedQuantity(0);
              setSelectedPrice(0);
              setPriceInput('');
              setError('');
            }}
            className="btn-amber w-full text-lg font-bold py-4"
          >
            Başqa Satış Qeyd Et
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
            <p className="text-muted-foreground text-sm mt-1">Müştəri nə aldı?</p>
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
            <p className="text-muted-foreground text-sm mt-1">Neçə ədəd satıldı?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {QUANTITY_OPTIONS.map((qty) => (
              <button
                key={qty}
                onClick={() => {
                  setSelectedQuantity(qty);
                  setStep('price');
                }}
                className="btn-amber flex flex-col items-center justify-center py-5"
              >
                <span className="text-3xl font-display font-bold">×{qty}</span>
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
              {selectedProduct} · ×{selectedQuantity}
            </p>
            <h2 className="font-display font-bold text-2xl text-foreground">Satış Qiyməti</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PRICE_OPTIONS.map((price) => (
              <button
                key={price}
                onClick={() => handlePresetPrice(price)}
                className={`btn-ghost-border flex flex-col items-center justify-center py-5 ${
                  selectedPrice === price && priceInput === String(price)
                    ? 'border-primary bg-primary/10'
                    : ''
                }`}
              >
                <span className="text-2xl font-display font-bold">{price}</span>
                <span className="text-xs text-muted-foreground mt-0.5">AZN</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Qiymət (AZN):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceInput}
              onChange={handlePriceInputChange}
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
            disabled={recordSaleMutation.isPending || !isPriceValid}
            className="btn-amber w-full text-lg font-bold py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {recordSaleMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Qeyd edilir...
              </>
            ) : isPriceValid ? (
              `Təsdiq et — ${(selectedQuantity * effectivePrice).toFixed(2)} AZN`
            ) : (
              'Qiymət daxil edin'
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
