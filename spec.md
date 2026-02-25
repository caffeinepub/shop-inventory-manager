# Specification

## Summary
**Goal:** Wire up the Admin "Anbarı Sıfırla" (Reset Inventory) feature by implementing the backend function and connecting it to the existing frontend UI.

**Planned changes:**
- Add a `resetInventory()` function in `backend/main.mo` that sets all product stock quantities to zero in stable storage and returns a success result
- Add a `useResetInventory` mutation hook in `useQueries.ts` that calls the backend `resetInventory` function and on success invalidates `stockLevels`, `salesHistory`, and `zReport` queries
- Update `ResetInventory.tsx` to remove the "feature not implemented" placeholder and instead call the backend via the new hook after password confirmation, displaying Azerbaijani success or error messages

**User-visible outcome:** After entering the correct password and confirming, the admin can successfully reset all product stock quantities to zero. A success message ("Anbar uğurla sıfırlandı") is shown on completion, and the inventory screen immediately reflects zeroed stock levels.
