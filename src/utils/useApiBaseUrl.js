import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { DEFAULT_API_BASE_URL, normalizeApiBaseUrl } from './apiClient';

export function useApiBaseUrl() {
  const { siteConfig } = useDocusaurusContext();
  const fromConfig = siteConfig?.customFields?.apiBaseUrl;

  const resolved =
    typeof fromConfig === 'string' && fromConfig.trim()
      ? fromConfig
      : DEFAULT_API_BASE_URL;

  return normalizeApiBaseUrl(resolved);
}
