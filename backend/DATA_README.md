# Data Files — Single Source of Truth

## ⚠️ Important: Only edit the files in this directory

All medicine and order data is read **directly** from these two Excel files:

| File | Used by | Purpose |
|------|---------|---------|
| `products-export.xlsx` | `/api/products` | Product catalog (names, prices, PZN, descriptions) |
| `Consumer Order History 1.xlsx` | `/api/orders`, `/api/refill-alerts` | Patient order history |

## How live-reload works

- The backend reads these files **every 30 seconds** (TTL cache).
- **No restart needed** — just save the Excel file and the API auto-updates within 30 seconds.
- If you add a product → it appears in the app within 30 seconds.
- If you remove a product → it disappears from the app within 30 seconds.

## Root-level copies

There are also copies of these Excel files in the project root (`/RXGuardians/*.xlsx`).
Those are **not used** — the backend reads exclusively from `backend/*.xlsx`.
You can safely delete the root-level copies to avoid confusion:

```
RXGuardians/products-export.xlsx            ← not used, can delete
RXGuardians/Consumer Order History 1.xlsx   ← not used, can delete
RXGuardians/backend/products-export.xlsx    ← ✅ ACTIVE source
RXGuardians/backend/Consumer Order History 1.xlsx  ← ✅ ACTIVE source
```

## Column reference

### products-export.xlsx (Sheet 1, row 1 = headers)

| Column | Type | Notes |
|--------|------|-------|
| `product id` | number | Unique product ID |
| `product name` | string | Full display name |
| `pzn` | string | Pharmazentralnummer |
| `price rec` | number | Recommended retail price in EUR |
| `package size` | string | e.g. "50 st", "100 ml" |
| `descriptions` | string | German product description |

### Consumer Order History 1.xlsx (Sheet 1, row 5 = headers)

| Column | Type | Notes |
|--------|------|-------|
| `Patient ID` | string | e.g. PAT001 |
| `Patient Age` | number | |
| `Patient Gender` | string | M/F |
| `Purchase Date` | number | Excel serial date |
| `Product Name` | string | Must match product catalog name |
| `Quantity` | number | Units ordered |
| `Total Price (EUR)` | number | |
| `Dosage Frequency` | string | Once daily, Twice daily, etc. |
| `Prescription Required` | string | Yes/No |
