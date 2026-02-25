# Specification

## Summary
**Goal:** Enhance the Daily Sales Report with profit/revenue data and add a password-protected Product Management page that allows adding and deleting products, with all product menus throughout the app dynamically reflecting the current product list.

**Planned changes:**
- Extend the backend `getZReport` to return per-product rows (name, quantity sold, selling price, purchase price, revenue, profit) plus aggregate totals (total revenue, total profit, total quantity sold)
- Update `DailySalesReport.tsx` to display the enriched per-product data and summary totals in AZN, with a "No sales recorded today" fallback
- Add backend `addProduct(name)` and `deleteProduct(name)` functions that persist changes in stable storage and remove associated sale records on deletion
- Add `useAddProduct` and `useDeleteProduct` React Query mutation hooks in `useQueries.ts` that invalidate relevant queries on success
- Create a new `ProductManagement.tsx` page with a password gate (password: 'gulserxan'), a text input and "Add Product" button, and a product list with per-item delete buttons and inline confirmation prompts
- Add a "Manage Products" button to `Dashboard.tsx` navigating to the new page
- Register a `/product-management` route in `App.tsx`
- Remove hardcoded product arrays from `AddStock`, `RecordSale`, `ViewInventory`, `SalesHistory`, and `DailySalesReport` pages, replacing them with dynamic lists from `getStockLevels`
- Add a `migration.mo` module to preserve existing stable data (products map and sales list) during canister upgrade

**User-visible outcome:** Shop managers can view detailed daily profit and revenue per product in the sales report, and can add or remove products via a protected management page — with all menus across the app automatically reflecting the current product catalogue.
