# ShopZone MERN App - Client Frontend Inventory

Scope includes:

- package scripts
- all dependencies and devDependencies
- route files
- all component files
- hooks, services, store, types, and config files
- static assets

## Frontend Stack

- Framework: Next.js 16
- Language: TypeScript + React 19
- State: Redux Toolkit + React Redux
- Forms: React Hook Form + Yup
- Styling: Tailwind CSS v4 + tailwindcss-animate + tw-animate-css, shadcn
- UI Utilities: class-variance-authority, clsx, tailwind-merge
- Motion: Framer Motion
- Icons: lucide-react
- Theme: next-themes
- Notifications: sonner
- HTTP Client: axios
- Realtime Client: socket.io-clients

## Dependencies

- `@hookform/resolvers`: `^5.4.0`
- `@reduxjs/toolkit`: `^2.12.0`
- `axios`: `^1.18.1`
- `class-variance-authority`: `^0.7.1`
- `clsx`: `^2.1.1`
- `framer-motion`: `^12.40.0`
- `lucide-react`: `^1.21.0`
- `next`: `16.2.9`
- `next-themes`: `^0.4.6`
- `radix-ui`: `^1.6.0`
- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `react-hook-form`: `^7.80.0`
- `react-redux`: `^9.3.0`
- `shadcn`: `^4.11.0`
- `socket.io-client`: `^4.8.3`
- `sonner`: `^2.0.7`
- `tailwind-merge`: `^3.6.0`
- `tailwindcss-animate`: `^1.0.7`
- `tw-animate-css`: `^1.4.0`
- `yup`: `^1.7.1`

## Dev Dependencies

- `@tailwindcss/postcss`: `^4`
- `@types/node`: `^20.19.43`
- `@types/react`: `^19`
- `@types/react-dom`: `^19`
- `eslint`: `^9`
- `eslint-config-next`: `16.2.9`
- `tailwindcss`: `^4`
- `typescript`: `^5`

## Frontend File Inventory (Complete)

### Root Client Config Files

- `client/.gitignore`
- `client/components.json`
- `client/eslint.config.mjs`
- `client/next.config.ts`
- `client/next-env.d.ts`
- `client/package.json`
- `client/package-lock.json`
- `client/postcss.config.mjs`
- `client/tailwind.config.ts`
- `client/tsconfig.json`
- `client/README.md`

### Public Assets

- `client/public/file.svg`
- `client/public/globe.svg`
- `client/public/next.svg`
- `client/public/vercel.svg`
- `client/public/window.svg`

### App Router Files

- `client/src/app/layout.tsx`
- `client/src/app/globals.css`
- `client/src/app/(auth)/layout.tsx`
- `client/src/app/(auth)/forgot-password/page.tsx`
- `client/src/app/(auth)/login/page.tsx`
- `client/src/app/(auth)/register/page.tsx`
- `client/src/app/(auth)/reset-password/page.tsx`
- `client/src/app/(auth)/verify-email/page.tsx`
- `client/src/app/(root)/layout.tsx`
- `client/src/app/(root)/page.tsx`
- `client/src/app/(root)/products/page.tsx`
- `client/src/app/(root)/products/[slug]/page.tsx`

### Middleware

- `client/src/middleware.ts`

### Components

#### Common Components

- `client/src/components/common/Providers.tsx`
- `client/src/components/common/Footer/Footer.tsx`
- `client/src/components/common/Footer/index.ts`
- `client/src/components/common/Navbar/Navbar.tsx`
- `client/src/components/common/Navbar/index.ts`

#### Product Components

- `client/src/components/product/ProductCard.tsx`
- `client/src/components/product/ProductFilters.tsx`
- `client/src/components/product/ProductImages.tsx`
- `client/src/components/product/ProductReviews.tsx`
- `client/src/components/product/ProductVariants.tsx`

#### UI Components

- `client/src/components/ui/avatar.tsx`
- `client/src/components/ui/badge.tsx`
- `client/src/components/ui/button.tsx`
- `client/src/components/ui/card.tsx`
- `client/src/components/ui/checkbox.tsx`
- `client/src/components/ui/dropdown-menu.tsx`
- `client/src/components/ui/input.tsx`
- `client/src/components/ui/label.tsx`
- `client/src/components/ui/radio-group.tsx`
- `client/src/components/ui/select.tsx`
- `client/src/components/ui/separator.tsx`
- `client/src/components/ui/sheet.tsx`
- `client/src/components/ui/slider.tsx`
- `client/src/components/ui/sonner.tsx`
- `client/src/components/ui/tabs.tsx`
- `client/src/components/ui/textarea.tsx`

### Config

- `client/src/config/constants.ts`

### Hooks

- `client/src/hooks/useAuth.ts`
- `client/src/hooks/useCart.ts`
- `client/src/hooks/useDebounce.ts`
- `client/src/hooks/useProduct.ts`
- `client/src/hooks/useSocket.ts`

### Libraries

- `client/src/lib/axios.ts`
- `client/src/lib/utils.ts`

### Services

- `client/src/services/api.ts`
- `client/src/services/authApi.ts`
- `client/src/services/cartApi.ts`
- `client/src/services/productApi.ts`

### Redux Store

- `client/src/store/index.ts`
- `client/src/store/slices/authSlice.ts`
- `client/src/store/slices/cartSlice.ts`
- `client/src/store/slices/notificationSlice.ts`

### Types

- `client/src/types/auth.types.ts`
- `client/src/types/cart.types.ts`
- `client/src/types/product.types.ts`
