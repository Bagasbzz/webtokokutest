# Style Guide - webtokoku

## IMPORTANT NOTES

### NO EMOJI POLICY
- **DO NOT** use emoji for any purpose
- **USE** standard web icons instead
- **PREFERRED**: FontAwesome, Lucide React, Heroicons
- **AVOID**: Unicode emoji, custom emoji sets

### Icon Guidelines
- Use **Lucide React** icons (already installed)
- Use **standard web icons** that users recognize
- Examples:
  - Settings: `<Settings size={20} />`
  - Edit: `<Edit size={20} />`
  - Delete: `<Trash size={20} />`
  - Save: `<Save size={20} />`
  - Upload: `<Upload size={20} />`

### Code Style
- Professional, clean interface
- No playful elements
- Business-oriented design
- Consistent icon usage

---

## Page Audit Requirements

### All Pages Must Be Audited For:
1. **Icon Compliance** - No emoji anywhere
2. **Professional Design** - Clean, business-like
3. **Consistent Styling** - Uniform colors and fonts
4. **Mobile Responsive** - Works on all devices
5. **Accessibility** - Proper ARIA labels
6. **Performance** - Fast loading

---

## Pages to Audit

### 1. Landing Page (`/`)
- [ ] Remove all emoji
- [ ] Replace with Lucide icons
- [ ] Check hero section
- [ ] Check features section
- [ ] Check templates section
- [ ] Check footer

### 2. Dashboard (`/dashboard`)
- [ ] Remove emoji from stats
- [ ] Use professional icons
- [ ] Check navigation
- [ ] Check charts
- [ ] Check activity feed

### 3. Template Editor (`/dashboard/editor`)
- [ ] Remove emoji from buttons
- [ ] Use Lucide icons
- [ ] Check edit modal
- [ ] Check preview mode
- [ ] Check section controls

### 4. Auth Pages (`/auth/login`, `/auth/register`)
- [ ] Remove emoji
- [ ] Professional design
- [ ] Check form validation
- [ ] Check social login

### 5. Product Management (`/dashboard/produk`)
- [ ] Product list view
- [ ] Add/edit forms
- [ ] Image upload
- [ ] Category management

### 6. Order Management (`/dashboard/pesanan`)
- [ ] Order list
- [ ] Order details
- [ ] Status updates
- [ ] Customer info

### 7. Settings (`/dashboard/pengaturan`)
- [ ] Store settings
- [ ] Payment settings
- [ ] Profile settings
- [ ] Notification settings

### 8. Store Pages (`/[slug]`)
- [ ] All 5 templates
- [ ] Product display
- [ ] Contact forms
- [ ] WhatsApp integration

---

## Implementation Priority

### Phase 1: Critical (Today)
- [ ] Landing page emoji removal
- [ ] Dashboard emoji removal
- [ ] Template Editor emoji removal

### Phase 2: High Priority (Tomorrow)
- [ ] Auth pages
- [ ] Product management
- [ ] Order management

### Phase 3: Medium Priority (This Week)
- [ ] Settings pages
- [ ] Store templates
- [ ] Checkout flow

---

## Icon Mapping

| Emoji | Lucide Icon | Usage |
|-------|-------------|-------|
| 🎨 | `<Palette />` | Design/Template |
| 📱 | `<Smartphone />` | Mobile |
| 💰 | `<DollarSign />` | Money |
| 📊 | `<BarChart />` | Analytics |
| ⚡ | `<Zap />` | Speed |
| ✓ | `<Check />` | Success |
| ✗ | `<X />` | Error/Close |
| + | `<Plus />` | Add |
| - | `<Minus />` | Remove |
| → | `<ArrowRight />` | Next/Forward |
| ← | `<ArrowLeft />` | Back |
| ⭐ | `<Star />` | Rating/Favorite |
| 🔔 | `<Bell />` | Notification |
| 👤 | `<User />` | Profile |
| 🏪 | `<Store />` | Store |
| 📦 | `<Package />` | Product/Order |
| 🚀 | `<Rocket />` | Launch/Deploy |

---

## Code Examples

### Before (WRONG):
```tsx
<button>🎨 Edit Template</button>
<div>✅ Success!</div>
<span>📊 Analytics</span>
```

### After (CORRECT):
```tsx
<button><Palette size={16} /> Edit Template</button>
<div><Check size={16} /> Success!</div>
<span><BarChart size={16} /> Analytics</span>
```

---

## Testing Checklist

### Visual Testing
- [ ] No emoji visible on any page
- [ ] All icons are consistent
- [ ] Professional appearance
- [ ] Brand consistency

### Functional Testing
- [ ] All icons clickable where needed
- [ ] Hover states work
- [ ] Loading states use spinners, not emoji
- [ ] Error states use proper icons

---

*Last Updated: 8 Mei 2026*  
*Status: Ready for Implementation*
