# Takshvi Global Services

## Current State

Full-stack ICP app with:
- Navy/Gold themed React frontend with TanStack Router
- Motoko backend with authorization, user approval, smart finance access, property listings, contact submissions
- Pages: Home, Smart Finance, Properties, Contact, Login, Admin Login, Admin Dashboard
- Admin dashboard has tabs for users, smart finance, properties, contact submissions
- Smart finance: request access flow, admin approval, approved portal view
- Properties: user submission, admin approval, public listing

## Requested Changes (Diff)

### Add
- New page `/construction-cost` — Construction Cost Estimator
- Navigation link to the new page in Navbar
- The page allows user to:
  1. Select a city from a comprehensive dropdown of all major Indian cities (500+)
  2. Select property type: Residential / Commercial / Industrial
  3. Enter total area in square feet
  4. Click "Estimate" to call Gemini AI (via HTTP outcall from backend OR direct frontend fetch to Gemini API)
- Results displayed in two side-by-side columns:
  - **Column 1: Cost Estimation**
    - 3-tier pricing cards: Standard, Premium, Luxury (total estimated construction cost in INR)
    - Bar chart at the bottom showing raw material cost breakdown for each tier
  - **Column 2: Raw Material Breakdown**
    - Table listing every major raw material:
      - Material name
      - Unit (kg, bags, cubic ft, pieces, etc.)
      - Quantity required
      - Per unit/piece cost (city-specific, live price from Gemini)
      - Total cost for that material
    - Grand total of raw materials at the bottom
- All pricing data (raw material rates, construction estimates) fetched from Gemini AI using city-specific live market prices
- The construction cost calculator is publicly accessible (no login required)

### Modify
- Navbar: add "Cost Estimator" link pointing to `/construction-cost`
- App.tsx: add route for `/construction-cost` pointing to `ConstructionCostPage`

### Remove
- Nothing removed

## Implementation Plan

1. Add `http-outcalls` component via select_components (already has it or needs adding)
2. Since Gemini AI calls will be made from the frontend directly (using fetch to Gemini REST API), no backend changes are needed — the frontend will call Gemini directly from the browser using the API key embedded in env/config
3. Create `src/frontend/src/pages/ConstructionCostPage.tsx`:
   - City selector (comprehensive list of Indian cities)
   - Property type selector (Residential/Commercial/Industrial)
   - Square footage input
   - Estimate button that calls Gemini API
   - Results: 3-tier pricing cards (Standard/Premium/Luxury)
   - Bar chart using recharts for raw material cost breakdown
   - Raw material table with quantity, per-unit cost, total cost
4. Add route in App.tsx
5. Add nav link in Navbar.tsx
