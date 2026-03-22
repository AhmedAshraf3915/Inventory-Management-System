# UI Consistency Rules (Team Guidelines)

## 1. Global Layout Structure

Every page must follow the same vertical layout:

1. **Top Navbar** (global actions and brand)
2. **Second Navbar / Section Navigation**
3. **Page Header**
4. **Toolbar (search, filters, main actions)**
5. **Main Content (cards, tables, charts)**

No page should change this order.

---

# 2. Top Navbar Rules

The top navbar is **global and identical on all pages**.

It must contain:

- the **system logo or name** on the left
- **search input (optional)**
- **notification icon**
- **user profile / avatar**
- **logout access**

Rules:

- Navbar height must be consistent across all pages.
- Icons must have the same size and spacing.
- Profile dropdown must always appear on the right.
- The navbar should never contain page-specific actions.

---

# 3. Second Navbar Rules

The second navbar acts as **module navigation**.

It should contain links to main sections such as:

- Dashboard
- Products
- Categories
- Suppliers
- Orders
- Reports

Rules:

- The current page must always be visually highlighted.
- Navigation items must stay in the same order everywhere.
- Do not add random items per page.
- Use short labels only.

Example order:

Dashboard → Products → Categories → Suppliers → Orders → Reports

---

# 4. Page Header Rules

Every page must have a **page header section**.

The header should contain:

Left side:

- Page title
- Short description

Right side:

- One main action button (for example: **Add Product**)

Rules:

- Title should be short and clear.
- Subtitle explains what the page manages.
- Do not place search fields inside the header.

---

# 5. Toolbar Rules

The toolbar appears below the page header.

It is used for:

- search
- filters
- quick actions

Rules:

- Search field must appear on the left.
- Filters appear next to search.
- Main action button appears on the right.
- Toolbar must not contain large UI components.

Example:

Search | Filter | Sort → Add Button

---

# 6. Card Usage Rules

All content should be placed inside **cards**.

Cards are used for:

- tables
- charts
- statistics
- activity feeds
- reports
- forms

Rules:

- Cards should have consistent padding.
- Cards must have a title if they contain important content.
- Avoid deeply nested cards.

---

# 7. Dashboard Rules

The dashboard should always contain these sections:

1. **Summary cards**
2. **Charts or visual insights**
3. **Recent activity**
4. **Preview table (optional)**

Rules:

- Summary cards appear at the top.
- Charts appear below summary cards.
- Activity feed appears on the side or below charts.

---

# 8. Table Rules

Tables must follow the same structure on all pages.

Each table should contain:

- Column header row
- Data rows
- Action column (Edit / Delete / View)

Rules:

- The action column must always be the last column.
- Status values must use badges.
- Table rows should highlight on hover.
- Do not place large buttons inside table cells.

---

# 9. Status Indicators

Statuses must always use **badges**, not plain text.

Examples:

Products

- In Stock
- Low Stock
- Out of Stock

Orders

- Pending
- Received

Suppliers

- Active
- Inactive

Rules:

- Each status should always use the same color across the system.

---

# 10. Forms Rules

Forms appear inside **modals or form cards**.

Rules:

- Each field must have a label.
- Required fields should be clearly indicated.
- Group related fields together.
- Use dropdowns for predefined values (category, supplier).

Do not:

- mix unrelated fields in the same row
- use inconsistent field widths

---

# 11. Modal Rules

Modals are used for:

- Add item
- Edit item
- Create order
- Confirm delete

Modal structure must always follow this order:

1. Modal title
2. Description (optional)
3. Form fields
4. Footer actions

Footer actions:

- Cancel (left)
- Primary action (right)

Rules:

- Do not add navigation inside modals.
- Modals should stay focused on one task.

---

# 12. Button Rules

Buttons should be used consistently.

Primary button:

- used for the main action (Add, Save, Create)

Secondary button:

- used for Cancel or neutral actions

Danger button:

- used only for Delete actions

Rules:

- Never place more than one primary button in the same section.

---

# 13. Navigation Behavior

Navigation should always be predictable.

Rules:

- Clicking a navigation item changes the page.
- Active page must always be visually highlighted.
- Navigation order must never change between pages.

---

# 14. Icon Usage Rules

Icons should only be used when they add meaning.

Use icons for:

- actions
- status indicators
- navigation items

Rules:

- Icons must always appear with labels in navigation.
- Icons must have consistent size.

---

# 15. Activity Feed Rules

The activity feed shows recent system events.

Examples:

- Product added
- Supplier created
- Order received
- Product updated

Rules:

- Each activity should contain:
  - icon
  - description
  - timestamp

Only show **recent items (5–7 max)**.

---

# 16. Reports Page Rules

Reports page should contain:

- summary metrics
- data tables
- charts (optional)

Rules:

- reports should be read-only
- do not place editing actions on reports

---

# 17. Authentication Page Rules

The login page must remain simple.

It should contain:

- system logo
- system name
- short description
- email field
- password field
- sign-in button

Rules:

- do not place dashboard components on the login page
- authentication should be visually separate from the main system

---

# 18. Responsiveness Rules

All pages must remain usable on smaller screens.

Rules:

- navigation must remain accessible
- tables should scroll horizontally if needed
- forms should stack vertically on small screens

---

# 19. Naming Rules

Use consistent names across UI.

Examples:

Product (not item)
Supplier (not vendor)
Order (not purchase request)

Consistency in terminology is important.

---

# 20. Team Collaboration Rule

When adding new components:

1. Check if a similar component already exists.
2. Reuse the same structure if possible.
3. Do not introduce new layouts without discussion.
