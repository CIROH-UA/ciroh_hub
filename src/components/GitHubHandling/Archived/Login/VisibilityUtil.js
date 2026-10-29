import React, { useState, useEffect, useRef, RefObject } from "react";


/**
 * @name BasicObserverThresholds
 * @description A set of basic thresholds for the Intersection Observer API.
 * @type {number[]}
 * @constant
 */
export const BasicObserverThresholds = [
    0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1
]

/**
 * @name useObserveFraction
 * @description A custom hook to observe the fraction of a component that is visible in the viewport.
 * @param {RefObject} ref - The ref of the component.
 * @param {boolean} [bool=false] - Whether to skip the threshold generation and use the default 0 threshold.
 * This means it will only trigger when the component switches from not visible to visible.
 * @returns {number} The fraction of the component that is visible in the viewport.
 */
export function useObserveFraction(ref, bool = false) {
    const [visibleFraction, setVisibleFraction] = useState(0);
    const observer = useRef(null);
    const ObserverThresholds = bool ? [0] : BasicObserverThresholds;
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: ObserverThresholds
    };
    useEffect(() => {
        if (!ref.current) return;
        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setVisibleFraction(entry.intersectionRatio);
                } else {
                    setVisibleFraction(0);
                }
            });
        };
        observer.current = new IntersectionObserver(handleIntersect, observerOptions);
        observer.current.observe(ref.current);
    }, [ref, observerOptions]);

    return visibleFraction;
}

/**
 * @name useResizeTuple
 * @description A custom hook to observe the size of a component.
 * @param {RefObject} ref - The ref of the component.
 * @returns {[number, number]} The width and height of the component.
 */
export function useResizeTuple(ref) {
    const [size, setSize] = useState([0, 0]);
    const observer = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        const handleResize = (entries) => {
            entries.forEach((entry) => {
                setSize([entry.contentRect.width, entry.contentRect.height]);
            });
        };
        observer.current = new ResizeObserver(handleResize);
        observer.current.observe(ref.current);
    }, [ref]);

    return size;
}

/**
 * @name visibleOnce
 * @description A custom hook that updates only when the component is visible in the viewport for the first time.
 * @param {RefObject} ref - The ref of the component.
 * @returns {boolean} Whether the component is visible in the viewport.
 */
export function visibleOnce(ref) {
    const [success, setSuccess] = useState(false);
    const visibleFraction = useObserveFraction(ref, true);
    useEffect(() => {
        if (success) {
            return;
        }
        if (visibleFraction > 0) {
            setSuccess(true);
        }
    }, [visibleFraction]);
    return success;
}


/**
 * @param {Object} props - The props object.
 * @param {React.ReactNode} props.children - The children to render.
 * @description Only renders the children when they are visible in the viewport for the first time.
 * @returns {JSX.Element} The resulting JSX element.
 * @example
 * <LazyLoader>
 *   <MyComponent />
 * </LazyLoader>
 */
export function LazyLoader({ children }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    const success = visibleOnce(ref);
    useEffect(() => {
        if (success) {
            setIsVisible(true);
        }
    }, [success]);
    return (
        <div ref={ref} style={{ width: "100%", height: "100%" }}>
            {isVisible ? children : null}
        </div>
    );
}

/**
 * @param {Object} props - The props object.
 * @param {string} [props.msg] - Message to send to the console on load.
 * @description A test component that announces itself to the console whenever it is loaded.
 * @returns {JSX.Element} The resulting JSX element.
 * @example
 * <LoudLoader msg="Hello World!" />
 * // This will log "Hello World!" to the console when the component is loaded.
 */
export function LoudLoader({ msg }) {
    console.log(msg);
    return (
        <div>
            <p>LoudLoader: {msg}</p>
        </div>
    );
}
