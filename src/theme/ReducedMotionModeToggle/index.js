// Heavily adapted from Docusaurus's native ColorModeToggle.

import React from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {translate} from '@docusaurus/Translate';
import { IoAccessibility } from "react-icons/io5";
import styles from './styles.module.css';
// The order of color modes is defined here, and can be customized with swizzle
function getNextReducedMotionMode(reducedMotionMode, respectPrefersReducedMotion) {
  // 2-value transition
  if (!respectPrefersReducedMotion) {
    return reducedMotionMode === 'disabled' ? 'enabled' : 'disabled';
  }
  // 3-value transition
  switch (reducedMotionMode) {
    case null:
      return 'disabled';
    case 'enabled':
      return 'disabled';
    case 'disabled':
      return 'enabled';
    default:
      throw new Error(`unexpected reduced motion mode '${reducedMotionMode}'`);
  }
}
function getReducedMotionModeLabel(reducedMotionMode) {
  switch (reducedMotionMode) {
    case null:
      return 'using browser\'s reduced motion preference';
    case 'enabled':
      return 'reduced motion mode enabled';
    case 'disabled':
      return 'reduced motion mode disabled';
    default:
      throw new Error(`unexpected reduced motion mode '${reducedMotionMode}'`);
  }
}
function getReducedMotionModeAriaLabel(reducedMotionMode) {
  switch (reducedMotionMode) {
    case null:
      return 'Toggle reduced motion mode (currently using browser default)';
    case 'enabled':
      return 'Toggle reduced motion mode (currently enabled)';
    case 'disabled':
      return 'Toggle reduced motion mode (currently disabled)';
    default:
      throw new Error(`unexpected reduced motion mode '${reducedMotionMode}'`);
  }
}
function CurrentReducedMotionModeIcon() {
  // 3 icons are always rendered for technical reasons
  // We use "data-theme-choice" to render the correct one
  // This must work even before React hydrates
  return (
    <>
      <IoAccessibility
        // a18y is handled at the button level,
        // not relying on button content (svg icons)
        aria-hidden
        className={clsx(styles.toggleIcon, styles.lightToggleIcon)}
      />
      <IoAccessibility
        aria-hidden
        className={clsx(styles.toggleIcon, styles.darkToggleIcon)}
      />
      <IoAccessibility
        aria-hidden
        className={clsx(styles.toggleIcon, styles.systemToggleIcon)}
      />
    </>
  );
}
function ReducedMotionModeToggle({
  className,
  buttonClassName,
  respectPrefersReducedMotion,
  value,
  onChange,
}) {
  const isBrowser = useIsBrowser();
  return (
    <div className={clsx(styles.toggle, className)}>
      <button
        className={clsx(
          'clean-btn',
          styles.toggleButton,
          !isBrowser && styles.toggleButtonDisabled,
          buttonClassName,
        )}
        type="button"
        onClick={() =>
          onChange(getNextReducedMotionMode(value, respectPrefersReducedMotion))
        }
        disabled={!isBrowser}
        title={getReducedMotionModeLabel(value)}
        aria-label={getReducedMotionModeAriaLabel(value)}>
        <CurrentReducedMotionModeIcon />
      </button>
    </div>
  );
}
export default React.memo(ReducedMotionModeToggle);
