import { useNavigate } from '@tanstack/react-router';
import { PackagePlus, ShoppingCart, Eye, BarChart2, RotateCcw } from 'lucide-react';

const actions = [
  {
    label: 'Add Stock',
    icon: PackagePlus,
    path: '/add-stock',
    description: 'Receive new inventory',
    variant: 'amber' as const,
  },
  {
    label: 'Record Sale',
    icon: ShoppingCart,
    path: '/record-sale',
    description: 'Log a customer sale',
    variant: 'amber' as const,
  },
  {
    label: 'View Inventory',
    icon: Eye,
    path: '/view-inventory',
    description: 'Check stock levels',
    variant: 'secondary' as const,
  },
  {
    label: 'Daily Sales Report',
    icon: BarChart2,
    path: '/daily-sales-report',
    description: "Today's revenue summary",
    variant: 'secondary' as const,
  },
  {
    label: 'Reset Inventory',
    icon: RotateCcw,
    path: '/reset-inventory',
    description: 'Admin: zero all stock',
    variant: 'danger' as const,
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in flex flex-col gap-3">
      <div className="mb-2">
        <p className="text-muted-foreground text-sm font-medium">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {actions.map(({ label, icon: Icon, path, description, variant }) => (
        <button
          key={path}
          onClick={() => navigate({ to: path })}
          className={`
            w-full flex items-center gap-4 px-5 py-4 rounded-2xl border
            active:scale-[0.98] transition-all duration-100 text-left
            ${variant === 'amber'
              ? 'bg-primary text-primary-foreground border-primary/50 shadow-glow'
              : variant === 'danger'
              ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15'
              : 'bg-card text-card-foreground border-border hover:bg-secondary/50'
            }
          `}
          style={{ minHeight: '72px' }}
        >
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-xl shrink-0
            ${variant === 'amber'
              ? 'bg-primary-foreground/15'
              : variant === 'danger'
              ? 'bg-destructive/15'
              : 'bg-primary/15'
            }
          `}>
            <Icon className={`w-6 h-6 ${
              variant === 'amber'
                ? 'text-primary-foreground'
                : variant === 'danger'
                ? 'text-destructive'
                : 'text-primary'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-display font-bold text-lg leading-tight ${
              variant === 'amber' ? 'text-primary-foreground' : ''
            }`}>
              {label}
            </div>
            <div className={`text-sm mt-0.5 ${
              variant === 'amber'
                ? 'text-primary-foreground/70'
                : variant === 'danger'
                ? 'text-destructive/70'
                : 'text-muted-foreground'
            }`}>
              {description}
            </div>
          </div>
          <div className={`text-xl ${
            variant === 'amber'
              ? 'text-primary-foreground/50'
              : variant === 'danger'
              ? 'text-destructive/40'
              : 'text-muted-foreground/40'
          }`}>›</div>
        </button>
      ))}
    </div>
  );
}
