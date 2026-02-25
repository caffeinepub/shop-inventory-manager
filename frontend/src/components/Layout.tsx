import { ReactNode } from 'react';
import { Header } from './Header';
import { Heart } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'shop-inventory-manager'
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={title} />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="py-4 text-center border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Built with{' '}
          <Heart className="w-3 h-3 fill-primary text-primary" />{' '}
          using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
