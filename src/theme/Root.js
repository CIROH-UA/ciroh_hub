import { useState, useEffect } from 'react';
import { ReducedMotionContext } from '@theme/Contexts';
import HydroShareAuthProvider from '@site/src/components/HydroShareAuth';
import { storageAvailable } from '@site/src/utils/localStorage';

function getMotionPreference() {
    const localStorageAvailable = storageAvailable('localStorage');
    if (localStorageAvailable && (localStorage.getItem('reduce-motion') == 'enabled' || localStorage.getItem('reduce-motion') == 'disabled')) {
        return localStorage.getItem('reduce-motion');
    } else {
        const mode = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'enabled' : 'disabled';
        if (localStorageAvailable) localStorage.setItem('reduce-motion', mode);
        return mode;
    }
}

export default function Root({children}) {
  const [reducedMotionMode, setReducedMotionMode] = useState(null);
  const value = {reducedMotionMode, setReducedMotionMode};

  useEffect(() => {
    switch (reducedMotionMode) {
        case null:
            const mode = getMotionPreference();
            const pseudobool = mode === 'enabled' ? 'true' : 'false';
            document.documentElement.setAttribute(
                'data-reduce-motion',
                pseudobool,
            );
            setReducedMotionMode(mode); // Not accounted for until next render, but that's okay here
            break;
        case 'enabled':
            document.documentElement.setAttribute(
                'data-reduce-motion',
                'true',
            );
            if (storageAvailable('localStorage')) localStorage.setItem('reduce-motion', 'enabled');
            break;
        case 'disabled':
            document.documentElement.setAttribute(
                'data-reduce-motion',
                'false',
            );
            if (storageAvailable('localStorage')) localStorage.setItem('reduce-motion', 'disabled');
            break;
        default:
            throw new Error(`unexpected reduced motion mode '${reducedMotionMode}'`);
    }
  }, [reducedMotionMode]);

  return (
    <ReducedMotionContext.Provider value={value}>
      <HydroShareAuthProvider>
        {children}
      </HydroShareAuthProvider>
    </ReducedMotionContext.Provider>
  );
}
