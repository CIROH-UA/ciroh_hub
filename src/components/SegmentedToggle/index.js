import React, { useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

/**
 * A pill-shaped segmented toggle for choosing one of a few options.
 *
 * Controlled: pass the selected `value` and an `onChange(value)` handler. A
 * single "thumb" slides to sit behind the selected segment; its position and
 * width are measured from the segment itself, so options can have different
 * label widths. The thumb appears instantly on mount (CSS transitions don't
 * run on an element's first render) and animates on every change after that.
 *
 * Colors come from CSS custom properties (see styles.module.css) and can be
 * overridden per instance via the `style` prop, e.g.
 *   <SegmentedToggle style={{ '--toggle-accent': '#0ea5e9' }} ... />
 *
 * @param {Array<{label: string, value: string}>} options The options to choose from. Example: [{ label: 'URL', value: 'url' }, { label: 'Upload', value: 'upload' }]
 * @param {string} value The currently selected option's value
 * @param {function} onChange Called with the newly selected value
 * @param {string} [ariaLabel] Accessible label for the group
 * @param {string} [className] Extra class for the container
 * @param {object} [style] Inline style (handy for overriding the color variables)
 * 
 * @example
 *   <SegmentedToggle
 *       options={[{ label: 'URL', value: 'url' }, { label: 'Upload', value: 'upload' }]}
 *       value="url"
 *       onChange={(newValue) => console.log(newValue)}
 *       ariaLabel="Thumbnail source"
 *   />
 */
export default function SegmentedToggle({ options = [], value, onChange, ariaLabel, className, style }) {
    const segmentRefs = useRef([]);
    const [thumb, setThumb] = useState(null);   // Measured { left, width } of the active segment

    // Fall back to the first segment if the value doesn't match any option
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

    // Handle a click on an option. With exactly two options the toggle acts like
    // a switch: clicking either segment (including the selected one) flips to the
    // other option. With more options, a click just selects the one clicked.
    function handleSelect(option) {
        if (options.length === 2) {
            const other = options.find((o) => o.value !== value) ?? option;
            onChange?.(other.value);
        } else {
            onChange?.(option.value);
        }
    }

    // Measure the active segment so the thumb can sit exactly behind it. Runs
    // before paint and re-runs whenever the selection or option set changes;
    // changing the thumb's position/width is what the CSS transition animates.
    useLayoutEffect(() => {
        const element = segmentRefs.current[selectedIndex];
        if (!element) return;
        setThumb({ left: element.offsetLeft, width: element.offsetWidth });
    }, [selectedIndex, options.length]);

    return (
        <div role="radiogroup" aria-label={ariaLabel} className={clsx(styles.toggle, className)} style={style}>
            {/* The thumb element that visually indicates the active segment */}
            {thumb && (
                <span
                    aria-hidden="true"
                    className={styles.thumb}
                    style={{ width: `${thumb.width}px`, transform: `translateX(${thumb.left}px)` }}
                />
            )}
            
            {/* The individual segment buttons representing each option */}
            {options.map((option, i) => {
                const selected = option.value === value;
                return (
                    <button
                        key={option.value}
                        ref={(el) => { segmentRefs.current[i] = el; }}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={clsx(styles.segment, selected && styles.segmentActive)}
                        onClick={() => handleSelect(option)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
