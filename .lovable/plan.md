

# Refactor for Local Development & External Supabase

## Overview
This plan removes the Lovable-specific `lovable-tagger` dev dependency and restructures the Supabase client to use standard environment variable names (`VITE_SUPABASE_ANON_KEY` instead of `VITE_SUPABASE_PUBLISHABLE_KEY`). It also creates a `.env.example` and documents the local setup process.

**Important note:** This project does NOT use Clerk or Next.js -- it's a Vite + React + Supabase app with its own auth via Supabase Auth. No Clerk integration is needed.

---

## Changes

### 1. Remove `lovable-tagger`
- **`package.json`**: Remove `"lovable-tagger"` from `devDependencies`
- **`vite.config.ts`**: Remove the `import { componentTagger } from "lovable-tagger"` and its usage in the plugins array. The config becomes a clean Vite + React setup.

### 2. Create `src/lib/supabase.ts` (new canonical client)
A standard Supabase client file using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`:

```text
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});
```

### 3. Re-export from old path for compatibility
Update `src/integrations/supabase/client.ts` to simply re-export from the new location so existing imports across the codebase continue to work without a mass find-and-replace:

```text
export { supabase } from '@/lib/supabase';
```

### 4. Update all direct imports (5 files)
Change imports in these hooks from `@/integrations/supabase/client` to `@/lib/supabase`:
- `src/hooks/useAuth.tsx`
- `src/hooks/useDocuments.tsx`
- `src/hooks/useProjects.tsx`
- `src/hooks/useProfile.tsx`
- `src/hooks/useSystemDesigns.tsx`

### 5. Create `.env.example`
```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Keep existing types file
`src/integrations/supabase/types.ts` contains auto-generated database types. It stays as-is -- it's standard TypeScript with no platform lock-in.

---

## What Does NOT Need Changing
- **`tsconfig.json` / `tsconfig.app.json`**: Already standard Vite/TS config with `@/*` path alias. Works in VS Code out of the box.
- **`vite.config.ts`**: Already standard after removing the tagger plugin. Uses `@vitejs/plugin-react-swc`, standard port 8080.
- **`package.json` scripts**: `dev`, `build`, `preview`, `test` are already standard Vite commands.
- **All component imports**: Already use standard `@/components/...` absolute imports via the tsconfig path alias.
- **Auth system**: Uses standard `@supabase/supabase-js` auth -- no platform-specific wrappers.
- **No edge functions exist** in `supabase/functions/`, so nothing to migrate there.

---

## Local Setup Guide (included as comment in `.env.example`)

```text
# 1. Clone the repo
# 2. Copy this file: cp .env.example .env
# 3. Fill in your Supabase project URL and anon key from:
#    https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
# 4. Install dependencies: npm install
# 5. Run dev server: npm run dev
# 6. Open http://localhost:8080
```

---

## File Summary

| File | Action |
|------|--------|
| `src/lib/supabase.ts` | Create -- new canonical Supabase client |
| `src/integrations/supabase/client.ts` | Edit -- re-export from `@/lib/supabase` |
| `src/hooks/useAuth.tsx` | Edit -- update import path |
| `src/hooks/useDocuments.tsx` | Edit -- update import path |
| `src/hooks/useProjects.tsx` | Edit -- update import path |
| `src/hooks/useProfile.tsx` | Edit -- update import path |
| `src/hooks/useSystemDesigns.tsx` | Edit -- update import path |
| `vite.config.ts` | Edit -- remove lovable-tagger |
| `package.json` | Edit -- remove lovable-tagger |
| `.env.example` | Create |
