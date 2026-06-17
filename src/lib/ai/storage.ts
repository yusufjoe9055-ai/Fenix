import { AISettings } from './types';

const KEY = 'fenix.ai.settings.v1';

export function loadSettings(): AISettings {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AISettings;
  } catch {
    return {};
  }
}

export function saveSettings(settings: AISettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('fenix-ai-settings-changed'));
}

export function clearSettings(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('fenix-ai-settings-changed'));
}

export function hasPrimaryProvider(s: AISettings = loadSettings()): boolean {
  return !!(s.primary?.apiKey && s.primary.provider && s.primary.model);
}
