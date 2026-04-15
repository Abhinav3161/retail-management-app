

# Enterprise Retail Billing & Profit Analytics Dashboard

A premium, full-featured retail management SaaS dashboard connected to your backend at `localhost:8000`.

---

## 🎨 Design Foundation
- **Theme**: Indigo/blue primary, emerald for profit, red for loss — inspired by Stripe/Linear aesthetics
- **Dark/light mode** with persistent toggle
- **Inter font**, generous whitespace, soft shadows, glass morphism accents
- **Framer Motion** for page transitions, hover effects, animated counters, and micro-interactions
- **Loading skeletons** everywhere — no blank screens

---

## 🧭 Layout
- **Collapsible sidebar** with icons: Dashboard, Billing, Products, Reports, Insights, Returns, Customers, Settings — active route highlighted
- **Top navbar**: Search bar (Cmd+K shortcut), notification bell with badge, dark/light toggle, profile dropdown

---

## 📄 Pages (all wired to your API)

### 1. Dashboard (`/dashboard`)
- Animated KPI cards: Total Sales, Total Profit, Profit Margin %, Inventory Value
- Circular Business Health Score (0-100)
- Line chart (sales trend, 7 days), gradient area chart (profit overview)
- Best Selling Product card, Product of the Week, Low Stock Alerts, Smart Insights preview

### 2. Billing (`/billing`)
- Live debounced product search → product grid with images
- Shopping cart sidebar with quantity controls, real-time subtotal, configurable tax %, discount input
- Profit preview before checkout
- Generate Invoice → print/download PDF
- Success confetti animation, WebSocket push to dashboard

### 3. Products (`/products`)
- Sortable, filterable, paginated table with image thumbnails, SKU, prices, color-coded margin badges
- Add/Edit modal with auto-suggested selling price based on target margin, live margin preview, image upload
- Bulk actions, search & filter

### 4. Reports (`/reports`)
- Date range filters (today/week/month/custom date picker)
- Summary cards: Total Sales, Total Profit, Avg Margin, Break-Even count
- Charts: Sales vs Profit combo, Best Time to Sell by hour, Profit Comparison (daily/weekly/monthly toggle), Top Products horizontal bar
- CSV export

### 5. Insights (`/insights`)
- Smart insight cards: Low Margin Alerts, Highest Profit Product, Profit Drop %, Stock Predictions, Health Score breakdown, Recommended Actions
- Each card with icon, description, and actionable CTA

### 6. Returns & Loss (`/returns`)
- Record returns: product search, reason dropdown (damaged/customer return/expired), quantity
- Automatic profit adjustment
- Loss summary table with date range filter

### 7. Authentication (`/login`, `/register`)
- Clean centered login card: email, password, remember me, forgot password link
- Register: name, email, password, confirm, role selection (Admin/Cashier)
- JWT stored in localStorage, protected routes with role-based access (Admin = full, Cashier = limited)

---

## 🔌 Real-Time & Integrations
- **WebSocket** connection to `ws://localhost:8000/ws/dashboard` for live sale_completed, low_stock_alert, and new_insight events
- **Axios** instance with JWT interceptor, base URL `http://localhost:8000`
- All API endpoints from your spec wired up

---

## ✨ Polish & UX
- Animated number counters on KPI cards
- Toast notifications via Sonner (success/error)
- Friendly empty states with illustrations
- Error boundary with user-friendly messages
- Keyboard shortcuts (Cmd+K for search)
- Fully responsive (mobile + tablet)
- Print-ready invoice stylesheet
- CSV export for reports

