import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { googleProvider } from './providers/google';
import { groqProvider } from './providers/groq';
import { loadSettings } from './storage';
import { AIError, AIRequest, AIResponse, ProviderDef, ProviderId } from './types';

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  groq: groqProvider,
};

export const PROVIDER_LIST: ProviderDef[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  groqProvider,
];

export async function callAI(req: AIRequest): Promise<AIResponse> {
  const settings = loadSettings();
  if (!settings.primary?.apiKey) {
    throw new AIError('No AI provider configured. Open Settings → AI Configuration.');
  }

  const tryOne = async (cfg: { provider: ProviderId; model: string; apiKey: string }) => {
    const provider = PROVIDERS[cfg.provider];
    return provider.chat(req, { apiKey: cfg.apiKey, model: cfg.model });
  };

  try {
    return await tryOne(settings.primary);
  } catch (err) {
    const e = err as AIError;
    if (settings.backup?.apiKey && (e.retryable || e.status === 401 || e.status === 404)) {
      try {
        return await tryOne(settings.backup);
      } catch (err2) {
        const e2 = err2 as AIError;
        throw new AIError(
          `Primary failed (${e.message}). Backup also failed: ${e2.message}`,
          { status: e2.status }
        );
      }
    }
    throw err;
  }
}
