# Takshvi Global Services

## Current State
- Full-stack ICP app with Navy/Gold theme
- Smart Finance portal (approval-gated, Internet Identity auth)
- Admin dashboard with user approvals, finance requests, contact submissions, finance role management
- Login page with Internet Identity + admin credential login (admin section buried at bottom)
- Contact page
- Home page with services, stats, why-choose-us sections
- Logo broken (shows question mark)

## Requested Changes (Diff)

### Add
- Separate `/admin-login` page for admin credential login (krishna.ku / dilip.ku with password admin.ku)
- `/properties` page: public listing of admin-approved properties; viewable by anyone
- Property submission form for approved users (post title, description, location, valuation, Google Maps/location link)
- Admin can approve/reject property listings; admin can also edit any property
- Approved users can submit and edit their own properties
- Properties section promoted on Home page (showing latest approved properties)
- Property management tab in Admin dashboard
- Backend: Property data model (id, owner, title, description, location, valuation, locationLink, status, createdAt, updatedAt)
- Backend endpoints: submitProperty, updateProperty, setPropertyStatus, getApprovedProperties, getMyProperties, getAllProperties
- Fix logo: use uploaded Takshvi Global Services India Pvt Ltd logo

### Modify
- Login page: remove admin login section from bottom; add link to /admin-login instead
- Navbar: add "Properties" link (public); add "Admin Login" link visible to all; update logo src
- Admin dashboard: add "Properties" tab to manage all submitted properties

### Remove
- Admin login card from LoginPage (moved to dedicated AdminLoginPage)

## Implementation Plan
1. Regenerate backend with Property type and all property endpoints (keeping all existing endpoints)
2. Create AdminLoginPage at /admin-login (extracted from LoginPage)
3. Update LoginPage to remove admin section, add link to /admin-login
4. Create PropertiesPage: public listing + approved-user submission form + own property management
5. Update AdminPage: add Properties tab with approve/reject/edit controls
6. Update HomePage: add Featured Properties section showing latest 3 approved properties
7. Update Navbar: add Properties link, Admin Login link, fix logo reference
8. Update App.tsx to register /admin-login and /properties routes
