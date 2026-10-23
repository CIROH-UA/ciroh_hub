import React from 'react';
import { buildApiUrl } from '@site/src/utils/apiClient';
import { useApiBaseUrl } from '@site/src/utils/useApiBaseUrl';

const LoginButton = () => {
  const apiBaseUrl = useApiBaseUrl();
  const href = buildApiUrl(apiBaseUrl, 'github-login');

  return (
    <a href={href}>
      Login
    </a>
  );
};

export default LoginButton;