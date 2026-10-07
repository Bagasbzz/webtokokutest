# Implement Basic Plan System (Free / Pro)

## Goal Description
Implement a tiered plan system for WebTokoku stores with **Free** and **Pro** tiers. Add UI cues, feature locks, upgrade flow (WhatsApp redirect), and super‑admin tools to view and modify a store's plan.

## User Review Required
> [!IMPORTANT]
> Please confirm the following design decisions:
> - Placement of the **Upgrade to Pro** badge/button on the main dashboard (top‑right, next to store name, or a dedicated section?).
> - WhatsApp link for upgrade flow – should it be read from an environment variable `NEXT_PUBLIC_WHATSAPP_UPGRADE`?
> - Path for super‑admin management UI – we propose `app/admin/stores/plan` (under existing admin guard). Confirm or suggest another route.

## Open Questions
> [!WARNING]
> - Do you want the **watermark** to be a semi‑transparent overlay image or a CSS text overlay?
> - Should the **template lock** be stored as a new column `template_locked` in `stores`? If yes, we will add a migration.
> - Should the free‑plan limits (15 products, 3 categories) be configurable via env vars?

## Proposed Changes
---
### Backend
#### [MODIFY] [lib/plan.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/lib/plan.ts)
- New utility module defining constants, limit checks (`canAddProduct`, `canAddCategory`) and helper `isPro(store)`.

#### [MODIFY] [app/api/products/route.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/products/route.ts)
- Before creating a product, call `canAddProduct(store)`; return 403 with message if limit exceeded.

#### [MODIFY] [app/api/product-categories/route.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/product-categories/route.ts)
- Add similar check for categories.

#### [NEW] [app/api/stores/upgrade/route.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/stores/upgrade/route.ts)
- POST endpoint that sets `plan='pro'`, `pro_started_at=NOW()`, clears `plan_expires_at`, and returns `{ whatsappLink: process.env.NEXT_PUBLIC_WHATSAPP_UPGRADE }`.

#### [NEW] [app/api/stores/downgrade/route.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/stores/downgrade/route.ts)
- POST endpoint that sets `plan='free'`, clears `pro_started_at`, keeps existing products/categories (graceful downgrade).

#### [NEW] [app/api/stores/plan-admin/route.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/api/stores/plan-admin/route.ts)
- Admin‑only CRUD for plan fields (`plan`, `plan_expires_at`, `pro_notes`). Uses existing `adminGuard()`.

#### [NEW] [middleware/planLock.ts](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/middleware/planLock.ts)
- Central middleware applied to product/category creation routes for extra safety.

---
### Frontend
#### [MODIFY] [app/dashboard/page.tsx](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/dashboard/page.tsx)
- Add **Upgrade Pro** badge/button next to store name. Show current plan badge (Free/Pro). Disable "Tambah Produk" button when free limit reached (tooltip). Show watermark overlay when plan is free.

#### [NEW] [components/UpgradeBadge.tsx](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/components/UpgradeBadge.tsx)
- Reusable component rendering the badge and handling click → call `/api/stores/upgrade` then redirect to WhatsApp.

#### [MODIFY] [components/Watermark.tsx] *(if exists, otherwise create)*
- Render semi‑transparent "WebTokoku" text when `store.plan === 'free'`.

#### [MODIFY] [app/dashboard/produk/page.tsx] *(or wherever product list/add button lives)*
- Fetch plan limits and disable "Add Product" when free limit reached, showing tooltip.

#### [MODIFY] [app/dashboard/kategori/page.tsx]
- Same for categories limit.

#### [NEW] [app/admin/stores/plan/page.tsx](file:///C:/Users/bagas/Downloads/iniwebtokoku/iniwebtokoku/app/admin/stores/plan/page.tsx)
- Super‑admin UI showing store list with plan badge, edit modal to change plan, set expiry date, add notes.

---
### Database
- Columns already exist (`plan`, `plan_expires_at`, `pro_started_at`, `pro_notes`).
- If template lock is needed, add `template_locked BOOLEAN DEFAULT false` migration (optional, ask user).

## Verification Plan
### Automated Tests
- Unit tests for `canAddProduct` / `canAddCategory`.
- Integration test: POST to `/api/products` as free store with 15 existing products → expect 403.
- Integration test: Upgrade flow returns WhatsApp link.
- Admin endpoint access limited to admin role.

### Manual Verification
- Open store dashboard as free tier, verify badge, watermark, disabled add buttons.
- Click Upgrade → confirm redirect to WhatsApp.
- As admin, change plan to Pro, verify UI updates instantly.
- Downgrade back to Free and ensure existing extra products are hidden but not deleted.

---
**Next Steps**
- Await user confirmation on the open questions and design decisions.
- After approval, create `task.md` and start implementation.
