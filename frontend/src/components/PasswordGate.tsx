import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const CORRECT_PASSWORD = 'gulserxan';

interface PasswordGateProps {
  onSuccess: () => void;
  title: string;
  description?: string;
}

export function PasswordGate({ onSuccess, title, description }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center gap-6 pt-8">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30">
        <Lock className="w-8 h-8 text-primary" />
      </div>

      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-foreground">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter password"
            autoFocus
            className="w-full bg-card border border-border rounded-xl px-4 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive/30 rounded-xl px-4 py-3 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn-amber w-full text-lg font-bold py-4"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
