import { useContext } from 'react';
import { HydroShareAuthContext } from './index';

/**
 * Access the site-wide HydroShare authentication state.
 * @returns {{
 *   token: string,
 *   authenticated: boolean,
 *   verifying: boolean,
 *   loginInProgress: boolean,
 *   returnedFromLogin: boolean,
 *   logIn: function,
 *   logOut: function,
 *   clearReturnedFromLogin: function,
 * }} The current auth state and actions. During SSR (and outside the
 * provider) this is the logged-out default state with no-op actions.
 */
export default function useHydroShareAuth() {
    return useContext(HydroShareAuthContext);
}
