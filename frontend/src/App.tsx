import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddStock } from './pages/AddStock';
import { RecordSale } from './pages/RecordSale';
import { ViewInventory } from './pages/ViewInventory';
import { DailySalesReport } from './pages/DailySalesReport';
import { ResetInventory } from './pages/ResetInventory';

// Page title map
const PAGE_TITLES: Record<string, string> = {
  '/': 'Shop Inventory',
  '/add-stock': 'Add Stock',
  '/record-sale': 'Record Sale',
  '/view-inventory': 'View Inventory',
  '/daily-sales-report': 'Sales Report',
  '/reset-inventory': 'Reset Inventory',
};

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// Routes
const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const addStockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-stock',
  component: AddStock,
});

const recordSaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/record-sale',
  component: RecordSale,
});

const viewInventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/view-inventory',
  component: ViewInventory,
});

const dailySalesReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-sales-report',
  component: DailySalesReport,
});

const resetInventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-inventory',
  component: ResetInventory,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  addStockRoute,
  recordSaleRoute,
  viewInventoryRoute,
  dailySalesReportRoute,
  resetInventoryRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
