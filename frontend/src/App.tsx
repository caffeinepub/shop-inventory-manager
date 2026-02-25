import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AddStock } from './pages/AddStock';
import { RecordSale } from './pages/RecordSale';
import { ViewInventory } from './pages/ViewInventory';
import { DailySalesReport } from './pages/DailySalesReport';
import { ResetInventory } from './pages/ResetInventory';
import { SalesHistory } from './pages/SalesHistory';
import { ProductManagement } from './pages/ProductManagement';

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

const salesHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sales-history',
  component: SalesHistory,
});

const resetInventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-inventory',
  component: ResetInventory,
});

const productManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product-management',
  component: ProductManagement,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  addStockRoute,
  recordSaleRoute,
  viewInventoryRoute,
  dailySalesReportRoute,
  salesHistoryRoute,
  resetInventoryRoute,
  productManagementRoute,
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
