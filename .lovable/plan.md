

# Plan: Write PRD and Rebrand Landing Page to "Fenix"

## PRD (Product Requirements Document)

Based on the actual codebase, here is what Fenix does:

**Fenix** is a cloud-based developer workspace that combines document editing, system architecture design, and algorithm visualization into a single project-oriented platform. It is a PWA with offline support.

**Core Features:**
1. **Project Management** -- Create, rename, delete projects. Each project contains documents and system designs.
2. **Document Forge** -- Monaco-powered editor supporting Markdown (with live preview), XML, and plain text. Auto-save (1.5s debounce). Export to PDF, HTML, or native format.
3. **System Architect** -- Visual node-based canvas (React Flow) for designing system architectures. Predefined node templates: Database, Server, Frontend, Cloud Service, API, Storage. Smooth-step connections with amber arrowheads. Freehand drawing overlay with color/size controls. Mouse wheel zoom + drag panning.
4. **Algorithm Visualizer** -- Separate mode within System Architect with specialized node templates for Sorting (Array, Comparator, Swap, Partition), Graph & Tree (Tree Node, Vertex, Visited, BFS Queue, DFS Stack), Data Structures (Linked Node, Stack, Queue, Hash Table, Heap), and General (Variable, Pointer, Condition, Output).
5. **Authentication** -- Email/password signup and login. Profile settings (display name). Password change.
6. **PWA** -- Installable, offline asset caching, service worker.
7. **Settings** -- Profile management, password change, account deletion request.

---

## Landing Page Rewrite

Rebrand every occurrence of "TextForge" to **Fenix** across all affected files, and rewrite the landing page copy to reflect the full product accurately.

### Files to modify

1. **`index.html`** -- Update `<title>`, meta tags, and OG tags to use "Fenix".

2. **`src/pages/Index.tsx`** -- Full content rewrite:
   - Hero: "The Developer's Command Center" stays as tagline concept but refreshed copy referencing Fenix
   - Subtitle: Emphasize the three pillars -- Document Forge, System Architect, Algorithm Visualizer
   - Features array: Update to 4 cards reflecting actual features (Document Forge, System Architect, Algorithm Visualizer, PWA/Offline)
   - Format badges: Keep Markdown/XML/Plain Text
   - Mock editor preview: Update to show "Fenix" in the mock content
   - CTA section: Update copy with Fenix branding
   - Footer: "Fenix" branding

3. **`src/components/Navbar.tsx`** -- Change "TextForge" to "Fenix" in the logo text.

4. **`src/components/PWAInstallPrompt.tsx`** -- Change any "TextForge" references to "Fenix".

5. **`vite.config.ts`** -- Update PWA manifest `name` and `short_name` to "Fenix".

### Content direction

- Hero heading: "The Developer's Command Center" (keep) with "Fenix" as the glowing brand word
- Subheading: "Document, design, and visualize -- all in one workspace. Write in Markdown, architect your systems, and map out algorithms with Fenix."
- Feature cards:
  - Document Forge: Write in Markdown, XML, or plain text with Monaco editor, live preview, auto-save, and export to PDF/HTML
  - System Architect: Design system architectures visually with drag-and-drop nodes, curved connections, and freehand drawing
  - Algorithm Visualizer: Map out sorting, graph traversal, and data structure algorithms with specialized node templates
  - Works Offline: Install as a native app. Your work is cached and available even without internet
- CTA: "Ready to build?" / "Start building with Fenix -- it's free"
- Footer: "Fenix. Built for developers."

