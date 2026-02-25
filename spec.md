# Specification

## Summary
**Goal:** Build a mobile-first shop inventory management POS app with stock tracking, sales recording, daily reporting, and admin controls.

**Planned changes:**

**Backend:**
- Define 5 fixed products (Marlboro Silver, Marlboro Gold, Parliament Silver, Parliament Platinium, Parliament Superslim) with name, stock quantity, and last purchase price, persisted in stable storage
- `addStock(productName, quantity, purchasePrice)` — increments stock and updates last purchase price
- `recordSale(productName, quantity, sellingPrice, timestamp)` — decrements stock and saves a sale record; rejects if stock would go below zero
- `getDailySales()` — returns today's sale records aggregated by product (total quantity and total revenue)
- `resetAllStock()` — sets all product stock quantities to zero

**Frontend:**
- Main dashboard with 5 large full-width buttons: Add Stock, Record Sale, View Inventory, Daily Sales Report, Reset Inventory
- Add Stock flow: select product → select quantity (+10, +20, +50) → select purchase price (0.50, 0.60, 0.70 buttons + manual input) → confirm → success message
- Record Sale flow: select product → select quantity (-1, -2, -5, -10) → select selling price (9, 10, 11, 12 AZN) → confirm → success or insufficient stock error
- View Inventory screen: password prompt → on correct password show all 5 products with current stock quantities
- Daily Sales Report screen: password prompt → on correct password show today's sales per product and total revenue
- Reset Inventory flow: password prompt → confirmation dialog warning → call reset → success message
- Password for protected screens: `gulserxan` (client-side validation)
- Dark theme (near-black background, white/light-gray text, warm amber/orange accent), large rounded buttons, single-column mobile-first layout, consistent header with back button on sub-screens

**User-visible outcome:** Shop workers can add stock, record sales, view current inventory, check today's revenue, and reset stock — all from a simple, large-button mobile interface with a dark theme.
