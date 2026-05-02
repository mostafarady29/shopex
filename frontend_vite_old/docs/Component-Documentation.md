# PARTNER_NODE Design System
**Version:** 1.0.0  
**Aesthetic Profile:** Cyberpunk / High-Tech  
**Location:** `/frontend/src/components`

This document outlines the API, architecture, and accessibility standards for the core components of the SaaS Hub application.

---

## 1. Atoms (Primitives)

### `Button`
**Purpose:** Primary mechanism for executing actions, submitting forms, or navigating.

**Usage:**
```tsx
import Button from '../ui/Button';

<Button variant="primary" size="md">
  <i className="bi bi-cpu"></i> EXECUTE
</Button>
```

**Props:**
| Name      | Type                   | Default | Description                                   |
|-----------|------------------------|---------|-----------------------------------------------|
| `variant` | `'primary' | 'ghost'`  | `ghost` | Determines the aesthetic style and fill color |
| `size`    | `'sm' | 'md' | 'lg'`   | `md`    | Adjusts padding and font-size                 |
| `disabled`| `boolean`              | `false` | Sets `.disabled` attributes and pointer-events|
| `icon`    | `ReactNode`            | `null`  | Optional bootstrap-icon to precede text       |

**Accessibility:**
- Native `<button>` mapped with proper standard `type="button|submit|reset"`.
- `aria-label` automatically inherited from `children` string if no explicit label provided.
- Keyboard support (`Space` and `Enter` to cycle/activate). Focus rings use the `--accent-glow`.

---

### `Input`
**Purpose:** Interactive field for text, passwords, or numeric data entry.

**Usage:**
```tsx
import Input from '../form/Input';

<Input 
  id="terminal-access" 
  type="password" 
  placeholder="Enter authorization string..." 
/>
```

**Props:**
| Name      | Type                   | Default | Description                                 |
|-----------|------------------------|---------|---------------------------------------------|
| `id`      | `string`               | -       | Unique ID, required for label linking       |
| `type`    | `string`               | `'text'`| Standard HTML input type                    |
| `error`   | `string`               | `null`  | Renders error state border & message prompt |

**Accessibility:**
- Requires matching `Label` component utilizing `htmlFor`. 
- Incorporates `aria-invalid="true"` dynamically when `error` is populated.

---

## 2. Molecules (Compositions)

### `ProductCard`
**Purpose:** Displays individual item inventory mapping data including thumbnail, telemetry, and actions.

**Usage:**
```tsx
import ProductCard from '../product/ProductCard';

<ProductCard 
  product={productData} 
  onAddToCart={() => dispatchPurchase()} 
/>
```

**Props:**
| Name          | Type                   | Default | Description                           |
|---------------|------------------------|---------|---------------------------------------|
| `product`     | `Object`               | -       | Required standard Object data mapping |
| `onAddToCart` | `function`             | -       | Callback when action button is hit    |

**Accessibility:**
- Wraps context inside `article` for semantic DOM structuring.
- Image includes redundant `alt` text mapping to `product.name`.
- Entire card is tab traversable.

---

## 3. Organisms (Complex Structures)

### `AffiliateDashboard`
**Purpose:** Dedicated dashboard grid mapping referring traffic nodes to local monetary ledgers.

**Architecture:**
Composed using the `<Section>` block template mixed with local CSS `.stat-panel-clip` to give an irregular geometric structural boundary with severe `clip-paths`. Follows the "Design Theme Layout: Staggered Fade" technique where internal elements are wrapped in `.animate-stagger`.

**Data Polling Mechanisms:**
Checks `fetch('/api/affiliate/dashboard')`. Contains built-in resilient UI states displaying mock data if `ECONNREFUSED` exception triggers (assuring visual feedback when backend node environments are offline).

---

## Usage Checklist (For Developers)
- [ ] Ensure any newly created inputs use the unified `<Input/>` atom to get proper hover tracking.
- [ ] Avoid relying on `.rounded` Bootstrap classes; this styling completely ignores radii for aggressive structural corners.
- [ ] Retain WCAG 2.1 Contrast ratios when implementing custom text elements against `--bg-secondary` dark layers.
