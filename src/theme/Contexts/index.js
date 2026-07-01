import {createContext} from 'react';

export const ReducedMotionContext = createContext({
    reducedMotionMode: null,
    setReducedMotionMode: () => {console.log("Oops! This just ran a placeholder")},
});