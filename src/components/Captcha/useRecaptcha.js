import { useState, useRef, useCallback, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const useRecaptcha = () => {
  const [capchaToken, setCapchaToken] = useState('');
  const recaptchaRef = useRef(null);

  const handleRecaptcha = useCallback((token) => {
    setCapchaToken(token || '');
  }, []);

  useEffect(() => {
    const refreshCaptcha = () => {
      if (recaptchaRef.current && capchaToken) {
        recaptchaRef.current.reset();
        setCapchaToken('');
      }
    };

    let tokenRefreshTimeout = null;

    if (capchaToken) {
      // reset after 110 seconds
      tokenRefreshTimeout = setTimeout(refreshCaptcha, 110000);
    }

    return () => {
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
    };
  }, [capchaToken]);

  return { capchaToken, setCapchaToken, recaptchaRef, handleRecaptcha };
};

export default useRecaptcha;