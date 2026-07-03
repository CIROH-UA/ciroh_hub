import React, {useContext, useState, useEffect} from 'react';
import {ReducedMotionContext} from "@theme/Contexts";

// Credit: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      e.name === "QuotaExceededError" &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

function getMotionPreference() {
    const localStorageAvailable = storageAvailable('localStorage');
    if (localStorageAvailable && (localStorage.getItem('reduce-motion') == 'enabled' || localStorage.getItem('reduce-motion') == 'disabled')) {
        return localStorage.getItem('reduce-motion');
    } else {
        mode = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'enabled' : 'disabled';
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
      {children}
    </ReducedMotionContext.Provider>
  );
}