import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { clearStoredConfig, loadConfig, loadConfigFromStorage, persistConfig } from '../lib/configStorage';
import { defaultSiteConfig } from '../config/defaultSiteConfig';
import type { SiteConfig } from '../types/site';

interface SiteConfigContextValue {
  config: SiteConfig;
  setConfig: Dispatch<SetStateAction<SiteConfig>>;
  saveConfigChanges: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  reloadConfigFromStorage: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isConfigLoading: boolean;
  isConfigSaving: boolean;
  storageError: string;
}

const SiteConfigContext = createContext<SiteConfigContextValue | undefined>(undefined);

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const initialConfig = loadConfig();

  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [persistedConfig, setPersistedConfig] = useState<SiteConfig>(initialConfig);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const hydrateConfig = async () => {
      setIsConfigLoading(true);
      setStorageError('');
      try {
        const latest = await loadConfigFromStorage();
        if (!isMounted) {
          return;
        }
        setConfig(latest);
        setPersistedConfig(latest);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setStorageError(error instanceof Error ? error.message : 'Could not load remote config.');
        const latest = loadConfig();
        setConfig(latest);
        setPersistedConfig(latest);
      } finally {
        if (isMounted) {
          setIsConfigLoading(false);
        }
      }
    };

    void hydrateConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(persistedConfig),
    [config, persistedConfig],
  );

  const saveConfigChanges = async () => {
    setIsConfigSaving(true);
    setStorageError('');
    try {
      await persistConfig(config);
      setPersistedConfig(config);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Could not save config.');
      throw error;
    } finally {
      setIsConfigSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setConfig(defaultSiteConfig);
    setPersistedConfig(defaultSiteConfig);
    clearStoredConfig();
    await persistConfig(defaultSiteConfig);
  };

  const reloadConfigFromStorage = async () => {
    setIsConfigLoading(true);
    setStorageError('');
    try {
      const latest = await loadConfigFromStorage();
      setConfig(latest);
      setPersistedConfig(latest);
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Could not reload config.');
      throw error;
    } finally {
      setIsConfigLoading(false);
    }
  };

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        setConfig,
        saveConfigChanges,
        resetToDefaults,
        reloadConfigFromStorage,
        hasUnsavedChanges,
        isConfigLoading,
        isConfigSaving,
        storageError,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used inside SiteConfigProvider');
  }
  return context;
};
