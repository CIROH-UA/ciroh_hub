import React from 'react';
import ColorModeToggle from '@theme-original/Navbar/ColorModeToggle';
import ReducedMotionModeToggle from '@theme/Navbar/ReducedMotionModeToggle'

// This is where ReducedMotionToggle gets injected

export default function ColorModeToggleWrapper(props) {
  return (
    <>
      <ColorModeToggle {...props} />
      <ReducedMotionModeToggle {...props} />
    </>
  );
}
