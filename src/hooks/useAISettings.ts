import { useEffect, useState, useCallback } from 'react';
import { AISettings } from '@/lib/ai/types';
import { loadSettings, saveSettings, clearSettings, hasPrimaryProvider } from '@/lib/ai/storage';

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(() => loadSettings());

  useEffect(() => {
    const handler = () => setSettings(loadSettings());
    window.addEventListener('fenix-ai-settings-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('fenix-ai-settings-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const update = useCallback((next: AISettings) => {
    saveSettings(next);
    setSettings(next);
  }, []);

  const clear = useCallback(() => {
    clearSettings();
    setSettings({});
  }, []);

  return {
    settings,
    update,
    clear,
    isConfigured: hasPrimaryProvider(settings),
  };
}
