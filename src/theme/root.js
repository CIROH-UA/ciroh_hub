import React, {useContext, useState} from 'react';
import {ReducedMotionContext} from "@theme/Contexts";

export default function Root({children}) {
  const [reducedMotionMode, setReducedMotionMode] = useState(null);
  const value = {reducedMotionMode, setReducedMotionMode};
  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  );
}