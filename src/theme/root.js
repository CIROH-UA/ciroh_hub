import React, {useContext, useState} from React;
import {ReducedMotionContext} from "@theme/Contexts";

const {reducedMotionMode, setReducedMotionMode} = useState('disabled');

export default function Root({children}) {
  return (
    <ReducedMotionContext value={reducedMotionMode, setReducedMotionMode}>
      {children}
    </ReducedMotionContext>
  );
}