import { useNavigate } from '@tanstack/react-router';
import { PasswordGate } from '../components/PasswordGate';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

function ResetContent() {
  const navigate = useNavigate();

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
          <p className="font-semibold text-destructive text-sm">Bu funksiya hal-hazırda mövcud deyil</p>
          <p className="text-destructive/80 text-sm mt-1">
            Anbarı sıfırlamaq funksiyası bu versiyada dəstəklənmir. Zəhmət olmasa administratorla əlaqə saxlayın.
          </p>
        </div>
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
