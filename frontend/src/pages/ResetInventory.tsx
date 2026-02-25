import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { AlertTriangle, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useResetInventory } from '../hooks/useQueries';

function ResetContent() {
  const navigate = useNavigate();
  const resetMutation = useResetInventory();
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync();
    } catch {
      // error handled via resetMutation.isError
    }
  };

  if (resetMutation.isSuccess) {
    return (
      <div className="animate-fade-in flex flex-col gap-6 pt-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">Uğurlu!</h2>
            <p className="text-muted-foreground text-sm mt-1">Əməliyyat tamamlandı</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4">
          <p className="font-semibold text-green-700 dark:text-green-400 text-sm text-center">
            Anbar uğurla sıfırlandı
          </p>
          <p className="text-green-600/80 dark:text-green-500/80 text-sm mt-1 text-center">
            Bütün məhsulların stok miqdarı 0-a endirildi.
          </p>
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

  return (
    <div className="animate-fade-in flex flex-col gap-6 pt-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/30">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Anbarı Sıfırla</h2>
          <p className="text-muted-foreground text-sm mt-1">Admin əməliyyatı</p>
        </div>
      </div>

      <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive text-sm">Diqqət! Bu əməliyyat geri alına bilməz</p>
          <p className="text-destructive/80 text-sm mt-1">
            Bütün məhsulların stok miqdarı sıfırlanacaq. Satış tarixçəsi saxlanılacaq.
          </p>
        </div>
      </div>

      {resetMutation.isError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-5 py-3">
          <p className="text-destructive text-sm font-medium text-center">
            Xəta baş verdi: {resetMutation.error instanceof Error ? resetMutation.error.message : 'Naməlum xəta'}
          </p>
        </div>
      )}

      {!confirmed ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setConfirmed(true)}
            className="w-full bg-destructive text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Anbarı Sıfırla
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="btn-ghost-border w-full text-base font-bold py-4"
          >
            Ləğv Et
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm font-semibold text-foreground">
            Əminsinizmi? Bu əməliyyat bütün stokları sıfırlayacaq.
          </p>
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="w-full bg-destructive text-white font-bold text-base py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resetMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sıfırlanır...
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" />
                Bəli, Sıfırla
              </>
            )}
          </button>
          <button
            onClick={() => setConfirmed(false)}
            disabled={resetMutation.isPending}
            className="btn-ghost-border w-full text-base font-bold py-4 disabled:opacity-60"
          >
            Geri Qayıt
          </button>
        </div>
      )}
    </div>
  );
}

export function ResetInventory() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PasswordGate
        title="Admin Sıfırlama"
        description="Anbarı sıfırlamaq üçün admin şifrəsini daxil edin"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <ResetContent />;
}
