import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
        {!isHome && (
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary text-foreground active:scale-95 transition-transform shrink-0"
            aria-label="Ana səhifəyə qayıt"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {isHome && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 shrink-0">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-lg leading-tight truncate text-foreground">
            {title ?? 'Mağaza Anbarı'}
          </h1>
          {isHome && (
            <p className="text-xs text-muted-foreground font-medium">POS İdarəetməsi</p>
          )}
        </div>
      </div>
    </header>
  );
}
