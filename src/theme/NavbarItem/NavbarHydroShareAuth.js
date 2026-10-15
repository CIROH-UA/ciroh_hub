import React from 'react';
import '@site/src/css/navbar-hydroshare-auth.css';
import useHydroShareAuth from '@site/src/components/HydroShareAuth/useHydroShareAuth';

/**
 * Navbar item for logging in to / out of HydroShare. Registered as the
 * 'custom-hydroShareAuth' navbar item type in ComponentTypes.js. All auth
 * state comes from the site-wide provider via useHydroShareAuth, so a login
 * started here returns the user to whatever page they were on.
 *
 * Docusaurus renders navbar items twice: once in the top bar (mobile=false)
 * and once inside the hamburger drawer (mobile=true). The desktop version is
 * a styled button hidden at mobile widths (see navbar-hydroshare-auth.css);
 * the mobile version uses the drawer's menu__link styling instead.
 */
export default function NavbarHydroShareAuth({ mobile = false }) {
  const { authenticated, verifying, loginInProgress, logIn, logOut } = useHydroShareAuth();

  const onClick = authenticated ? logOut : logIn;
  const disabled = !authenticated && (verifying || loginInProgress);
  const label = authenticated
    ? 'Log out of HydroShare'
    : verifying ? 'Checking…' : loginInProgress ? 'Redirecting…' : 'Log in to HydroShare';

  if (mobile) {
    return (
      <li className="menu__list-item">
        <button
          type="button"
          className={`menu__link ${authenticated ? 'navbar-hydroshare-menu-logout' : 'navbar-hydroshare-menu-login'}`}
          onClick={onClick}
          disabled={disabled}
        >
          {label}
        </button>
      </li>
    );
  }

  return (
    <button
      type="button"
      className={`${authenticated ? 'navbar-hydroshare-logout' : 'navbar-hydroshare-login'} navbar__item`}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      {label}
    </button>
  );
}
