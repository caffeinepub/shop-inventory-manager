import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useStockLevels, useAddProduct, useDeleteProduct } from '../hooks/useQueries';
import { Loader2, Plus, Trash2, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

function ProductManagementContent() {
  const navigate = useNavigate();
  const { data: stockLevels, isLoading } = useStockLevels();
  const addProductMutation = useAddProduct();
  const deleteProductMutation = useDeleteProduct();

  const [newProductName, setNewProductName] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const products = stockLevels
    ? stockLevels.map(([name, qty]) => ({ name, qty: Number(qty) })).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const handleAddProduct = async () => {
    const trimmed = newProductName.trim();
    if (!trimmed) {
      setAddError('Məhsul adı boş ola bilməz.');
      return;
    }
    setAddError('');
    setAddSuccess('');
    try {
      await addProductMutation.mutateAsync(trimmed);
      setAddSuccess(`"${trimmed}" uğurla əlavə edildi.`);
      setNewProductName('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Məhsul əlavə edilmədi.';
      setAddError(msg);
    }
  };

  const handleDeleteConfirm = async (productName: string) => {
    setDeleteError('');
    try {
      await deleteProductMutation.mutateAsync(productName);
      setConfirmDelete(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Məhsul silinmədi.';
      setDeleteError(msg);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-5">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Məhsul İdarəetməsi</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Məhsul əlavə et və ya sil</p>
      </div>

      {/* Add Product Form */}
      <div className="card-surface px-5 py-5 flex flex-col gap-4">
        <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Yeni Məhsul Əlavə Et
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={newProductName}
            onChange={(e) => {
              setNewProductName(e.target.value);
              setAddError('');
              setAddSuccess('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddProduct();
            }}
            placeholder="Məhsul adı daxil edin..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ fontSize: '16px' }}
            disabled={addProductMutation.isPending}
          />
          <button
            onClick={handleAddProduct}
            disabled={addProductMutation.isPending || !newProductName.trim()}
            className="btn-amber px-5 py-3 font-bold flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            {addProductMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            Əlavə Et
          </button>
        </div>

        {addSuccess && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-700 dark:text-green-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {addSuccess}
          </div>
        )}

        {addError && (
          <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {addError}
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide flex items-center gap-2">
          <Package className="w-3.5 h-3.5" />
          Mövcud Məhsullar ({products.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground text-sm">Yüklənir...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="card-surface px-5 py-8 flex flex-col items-center gap-2 text-center">
            <div className="text-3xl">📦</div>
            <p className="font-semibold text-foreground">Məhsul yoxdur</p>
            <p className="text-muted-foreground text-sm">Yuxarıdan yeni məhsul əlavə edin.</p>
          </div>
        ) : (
          <>
            {deleteError && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {deleteError}
              </div>
            )}
            {products.map(({ name, qty }) => (
              <div key={name} className="card-surface px-4 py-4 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-base leading-tight truncate">{name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Stok: {qty} ədəd</p>
                  </div>
                  {confirmDelete !== name ? (
                    <button
                      onClick={() => {
                        setConfirmDelete(name);
                        setDeleteError('');
                      }}
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                      aria-label={`${name} sil`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>

                {/* Inline delete confirmation */}
                {confirmDelete === name && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-destructive text-sm font-medium">
                        <span className="font-bold">"{name}"</span> silinsin? Bu məhsulun bütün satış qeydləri də silinəcək.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteConfirm(name)}
                        disabled={deleteProductMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive text-white font-bold text-sm disabled:opacity-50"
                        style={{ minHeight: '44px' }}
                      >
                        {deleteProductMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Sil
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDelete(null);
                          setDeleteError('');
                        }}
                        disabled={deleteProductMutation.isPending}
                        className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm hover:bg-secondary/50 transition-colors disabled:opacity-50"
                        style={{ minHeight: '44px' }}
                      >
                        Ləğv et
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <button
        onClick={() => navigate({ to: '/' })}
        className="btn-ghost-border w-full text-base font-bold py-4"
      >
        Ana Səhifəyə Qayıt
      </button>
    </div>
  );
}

export function ProductManagement() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="Məhsul İdarəetməsi"
        description="Məhsulları idarə etmək üçün şifrəni daxil edin"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <ProductManagementContent />;
}
