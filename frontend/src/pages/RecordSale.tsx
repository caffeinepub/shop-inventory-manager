import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useRecordSale, PRODUCTS } from '../hooks/useQueries';

type Step = 'product' | 'quantity' | 'price' | 'success';

const QUANTITY_OPTIONS = [1, 2, 5, 10];
const PRICE_OPTIONS = [9, 10, 11, 12];

export function RecordSale() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('product');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [error, setError] = useState('');

  const recordSaleMutation = useRecordSale();

  const handleSubmit = async () => {
    setError('');
    try {
      await recordSaleMutation.mutateAsync({
        productName: selectedProduct,
        quantitySold: selectedQuantity,
        sellingPrice: selectedPrice,
      });
      setStep('success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes('insufficient')) {
        setError('Not enough stock! Please check inventory before recording this sale.');
      } else {
        setError('Failed to record sale. Please try again.');
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
          <h2 className="font-display font-bold text-2xl text-foreground">Sale Recorded!</h2>
          <p className="text-muted-foreground mt-2">
            <span className="text-foreground font-semibold">{selectedProduct}</span>
            {' '}×{selectedQuantity} @ {selectedPrice} AZN
          </p>
          <p className="text-primary font-bold text-xl mt-2">
            Total: {(selectedQuantity * selectedPrice).toFixed(0)} AZN
          </p>
        </div>
        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => {
              setStep('product');
              setSelectedProduct('');
              setSelectedQuantity(0);
              setSelectedPrice(0);
              setError('');
            }}
            className="btn-amber w-full text-lg font-bold py-4"
          >
            Record Another Sale
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="btn-ghost-border w-full text-lg font-bold py-4"
          >
            Back to Home
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
            <h2 className="font-display font-bold text-2xl text-foreground">Select Product</h2>
            <p className="text-muted-foreground text-sm mt-1">What did the customer buy?</p>
          </div>
          <div className="flex flex-col gap-3">
            {PRODUCTS.map((product) => (
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
          </div>
        </div>
      )}

      {/* Step: Quantity */}
      {step === 'quantity' && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-primary text-sm font-semibold uppercase tracking-wide">{selectedProduct}</p>
            <h2 className="font-display font-bold text-2xl text-foreground">Select Quantity</h2>
            <p className="text-muted-foreground text-sm mt-1">How many units were sold?</p>
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
                <span className="text-xs opacity-70 mt-0.5">unit{qty > 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('product')}
            className="text-muted-foreground text-sm underline text-center mt-2"
          >
            ← Change product
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
            <h2 className="font-display font-bold text-2xl text-foreground">Selling Price</h2>
            <p className="text-muted-foreground text-sm mt-1">What price per unit?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {PRICE_OPTIONS.map((price) => (
              <button
                key={price}
                onClick={() => setSelectedPrice(price)}
                className={`btn-ghost-border flex flex-col items-center justify-center py-5 ${
                  selectedPrice === price ? 'btn-selected bg-primary/10' : ''
                }`}
              >
                <span className="text-2xl font-display font-bold">{price}</span>
                <span className="text-sm text-muted-foreground mt-0.5">AZN</span>
              </button>
            ))}
          </div>

          {selectedPrice > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 text-center">
              <span className="text-muted-foreground text-sm">Total: </span>
              <span className="text-primary font-bold text-xl">
                {(selectedQuantity * selectedPrice).toFixed(0)} AZN
              </span>
            </div>
          )}

          {error && (
            <div className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive text-sm font-medium">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={recordSaleMutation.isPending || selectedPrice === 0}
            className="btn-amber w-full text-lg font-bold py-4 flex items-center justify-center gap-2"
          >
            {recordSaleMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Recording Sale...
              </>
            ) : (
              'Confirm Sale'
            )}
          </button>

          <button
            onClick={() => {
              setStep('quantity');
              setError('');
            }}
            className="text-muted-foreground text-sm underline text-center"
          >
            ← Change quantity
          </button>
        </div>
      )}
    </div>
  );
}
