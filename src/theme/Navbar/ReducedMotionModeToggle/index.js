// Heavily adapted from the native @theme/Navbar/ColorModeToggle.

import React, {useContext} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import ColorModeToggle from '@theme/ColorModeToggle';
import ReducedMotionModeToggle from '@site/src/components/ReducedMotion/Toggle';
import {ReducedMotionContext} from '@site/src/components/ReducedMotion/Context';
import styles from './styles.module.css';
export default function NavbarColorModeToggle({className}) {
  const navbarStyle = useThemeConfig().navbar.style;
  const {disableSwitch, respectPrefersReducedMotion} = useThemeConfig().customFields.reducedMotionMode;
  const {reducedMotionMode, setReducedMotionMode} = useContext(ReducedMotionContext);
  if (disableSwitch) {
    return null;
  }
  return (
    <ReducedMotionModeToggle
      className={className}
        buttonClassName={
        navbarStyle === 'dark' ? styles.darkNavbarColorModeToggle : undefined
      }
      respectPrefersReducedMotion={respectPrefersReducedMotion}
      value={reducedMotionMode}
      onChange={setReducedMotionMode}
    />
  );
}
