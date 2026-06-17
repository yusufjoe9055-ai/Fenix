
# Fenix AI Layer — Phase 1 + PRD Generator

Implement the foundation (BYOK provider config with connection testing) plus the first core AI feature (Document → PRD Generator). Other features (vibe coding prompts, auto-generate nodes, agentic workflows) are deferred to later iterations.

## Architecture decision: BYOK direct-from-browser

The spec mandates "zero-cost hosting": API keys stored in browser localStorage, all LLM calls made directly from the client. No proxy server, no Lovable Cloud edge function for inference. This is unusual but it is the spec's defining constraint, so we follow it.

Trade-off: API keys live in the user's browser localStorage in plaintext (optional passphrase encryption is listed as Phase 3+). Users only ever send their own keys to their chosen provider — never to Fenix servers.

## Phase 1: Provider Foundation

### Providers in scope (per your selection)
OpenAI, Anthropic, Google (Gemini), Groq. (OpenRouter / Ollama deferred.)

### Provider abstraction (`src/lib/ai/`)
- `types.ts` — `ProviderId`, `ProviderConfig`, `ChatMessage`, `AIRequest`, `AIResponse`, `AIError` types.
- `providers/openai.ts`, `anthropic.ts`, `google.ts`, `groq.ts` — each exports `{ id, label, defaultModel, models[], chat(request, config), testConnection(config) }`.
  - OpenAI: POST `https://api.openai.com/v1/chat/completions`, Bearer auth.
  - Anthropic: POST `https://api.anthropic.com/v1/messages`, `x-api-key` + `anthropic-version` + `anthropic-dangerous-direct-browser-access: true`.
  - Google: POST `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=…`.
  - Groq: POST `https://api.groq.com/openai/v1/chat/completions`, Bearer auth (OpenAI-compatible).
- `registry.ts` — unified `callAI({ provider, model, system, messages, temperature })` that routes to the right provider, with fallback chain (primary → backup → friendly error).
- `storage.ts` — typed read/write of AI settings in `localStorage` under `fenix.ai.settings.v1` (provider, model, apiKey, backupProvider, backupApiKey).

### Settings UI (`src/pages/Settings.tsx`)
Add a new "AI Configuration" `Card` below Profile, above Security:
- Primary provider `Select` (OpenAI / Anthropic / Google / Groq) with logo/label.
- Model `Select` filtered by selected provider.
- API key `Input` (type=password, show/hide toggle button).
- "Test Connection" `Button` with inline status (idle/loading/success/failure + message). Sends a minimal `"Reply with 'ok'"` request.
- Collapsible "Backup Provider" section with the same fields.
- "Clear Keys" destructive button with confirmation `AlertDialog`.
- Inline note: "Keys are stored only in your browser. Fenix never sees them."

### Error handling
Friendly messages for invalid key (401), rate limit (429, surface retry-after), model unavailable (404), network failure. Fallback chain attempts backup provider on 429/5xx.

## Phase 2: Document → PRD Generator

### Entry point
In `src/components/Editor/EditorToolbar.tsx`, add a "Generate PRD" `Button` (Sparkles icon) next to Save. Disabled when no AI provider is configured (tooltip: "Configure AI in Settings").

### PRD modal (`src/components/AI/PRDGeneratorDialog.tsx`)
Triggered from the editor. Contents:
- Template selector `Select`: Agile, Technical Spec, Lean Startup, Custom.
- Optional "Custom instructions" `Textarea` (used by Custom template; appended otherwise).
- "Generate" button → calls `callAI` with a template-specific system prompt + the document content.
- Loading state with skeleton + cancel.
- Two-pane preview after generation (source on left via read-only Monaco, generated PRD on right via Monaco editable markdown).
- Footer actions: Regenerate, Discard, "Save as New Document".

### Prompt engineering (`src/lib/ai/prompts/prd.ts`)
- One `systemPromptFor(template)` per template, each containing:
  - Role + output contract (markdown with strict H2 sections from the spec: Overview, User Stories, Technical Requirements, Functional Requirements, Non-Functional Requirements, Acceptance Criteria, Timeline & Milestones, Dependencies & Risks).
  - One short few-shot example tailored to the template.
  - Instruction to mark assumptions explicitly with `> Assumption:` blockquotes when the source is incomplete.
- `buildUserPrompt({ sourceMarkdown, customInstructions })`.

### Saving the PRD
On "Save as New Document": call `useDocuments.createDocument(projectId)` then `updateDocument` with `{ title: \`PRD — ${sourceTitle}\`, content: generated, format: 'markdown' }`. Toast on success and switch the workspace to the new document.

### Generation history (lightweight)
- New table `prd_generations` (id, user_id, project_id, source_document_id, template, output_markdown, created_at). RLS scoped to `auth.uid()`; standard grants. (Only persists the output, not the API key.)
- New hook `usePRDGenerations(projectId)` with list + create.
- "History" tab inside the PRD dialog listing past generations for the current project with click-to-reopen.

## Out of scope (this iteration)
- Vibe Coding Prompts, Auto-Generate Visual Nodes, Agentic Workflow Prompts (Phase 2 items 2–4).
- OpenRouter, Ollama auto-detect.
- Passphrase encryption of localStorage, token usage estimator, context compression beyond simple truncation, streaming display (Phase 3 polish).

## Technical details (for reference)

```text
src/
  lib/ai/
    types.ts
    storage.ts
    registry.ts
    providers/
      openai.ts
      anthropic.ts
      google.ts
      groq.ts
    prompts/
      prd.ts
  components/AI/
    PRDGeneratorDialog.tsx
    ProviderStatusBadge.tsx
  hooks/
    useAISettings.ts
    usePRDGenerations.ts
  pages/Settings.tsx              (extended)
  components/Editor/EditorToolbar.tsx  (extended)
supabase/migrations/
  <timestamp>_prd_generations.sql
```

Migration sketch:
```sql
CREATE TABLE public.prd_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  template text NOT NULL,
  output_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prd_generations TO authenticated;
GRANT ALL ON public.prd_generations TO service_role;
ALTER TABLE public.prd_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows select" ON public.prd_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own rows insert" ON public.prd_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rows delete" ON public.prd_generations FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

After approval, I will implement Phase 1 and the PRD Generator in one build pass, then we can iterate on the remaining 3 features.
