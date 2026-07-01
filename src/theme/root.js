import React, {useContext, useState, useEffect} from 'react';
import {ReducedMotionContext} from "@theme/Contexts";

export default function Root({children}) {
  const [reducedMotionMode, setReducedMotionMode] = useState(null);
  const value = {reducedMotionMode, setReducedMotionMode};

  useEffect(() => {
    switch (reducedMotionMode) {
        case null:
            const mode = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'true' : 'false';
            document.documentElement.setAttribute(
                'data-reduce-motion',
                mode,
            );
            break;
        case 'enabled':
            document.documentElement.setAttribute(
                'data-reduce-motion',
                'true',
            );
            break;
        case 'disabled':
            document.documentElement.setAttribute(
                'data-reduce-motion',
                'false',
            );
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