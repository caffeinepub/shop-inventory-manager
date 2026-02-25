import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { useResetStocks } from '../hooks/useQueries';
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';

function ResetContent() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const resetMutation = useResetStocks();

  const handleReset = async () => {
    setError('');
    try {
      await resetMutation.mutateAsync();
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed. Please try again.');
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-6 pt-8 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Inventory Reset</h2>
          <p className="text-muted-foreground mt-2">All stock quantities have been set to zero.</p>
        </div>
        <button
          onClick={() => navigate({ to: '/' })}
          className="btn-amber w-full text-lg font-bold py-4"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6 pt-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/30">
          <RotateCcw className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Reset Inventory</h2>
          <p className="text-muted-foreground text-sm mt-1">Admin action — use with caution</p>
        </div>
      </div>

      <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-destructive text-sm">Warning: Irreversible Action</p>
          <p className="text-destructive/80 text-sm mt-1">
            This will set all 5 product stock quantities to <strong>zero</strong>. 
            Sale records will not be affected, but stock counts cannot be recovered.
          </p>
        </div>
      </div>

      {!confirmed ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setConfirmed(true)}
            className="w-full bg-destructive/10 text-destructive border-2 border-destructive/40 font-bold rounded-xl py-4 text-lg active:scale-[0.98] transition-all"
          >
            I Understand — Proceed
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="btn-ghost-border w-full text-base font-bold py-4"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-destructive/15 border border-destructive/40 rounded-2xl px-5 py-4 text-center">
            <p className="font-bold text-destructive text-base">Are you absolutely sure?</p>
            <p className="text-destructive/70 text-sm mt-1">
              Tap the button below to reset all stock to zero.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="w-full bg-destructive text-destructive-foreground font-bold rounded-xl py-4 text-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ minHeight: '56px' }}
          >
            {resetMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5" />
                Reset All Stock to Zero
              </>
            )}
          </button>

          <button
            onClick={() => setConfirmed(false)}
            className="text-muted-foreground text-sm underline text-center"
          >
            ← Go back
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
        title="Admin Reset"
        description="Enter the admin password to reset inventory"
        onSuccess={() => setUnlocked(true)}
      />
    );
  }

  return <ResetContent />;
}
