import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useEffect,
    useMemo,
    useRef
} from 'react';
import gsap from 'gsap';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
    <div
        ref={ref}
        {...rest}
        className={`
      tw-absolute tw-top-1/2 tw-left-1/2
      tw-rounded-xl tw-outline tw-border-2 tw-border-white tw-outline-white tw-bg-slate-900 tw-text-white
      tw-p-10 md:tw-p-10 sm:tw-p-6 max-[480px]:tw-p-4
      tw-text-sm md:tw-text-base
      [transform-style:preserve-3d]
      [will-change:transform]
      [backface-visibility:hidden]
      ${customClass ?? ''}
      ${rest.className ?? ''}
    `.trim()}
    />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
});

const placeNow = (el, slot, skew) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

const CardSwap = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children
}) => {
    const [isMobile, setIsMobile] = React.useState(false);

    // Adjust dimensions for mobile
    const responsiveWidth = isMobile ? 320 : width;
    const responsiveHeight = isMobile ? 260 : height;
    const responsiveCardDistance = isMobile ? 28 : cardDistance;
    const responsiveVerticalDistance = isMobile ? 30 : verticalDistance;

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const config =
        easing === 'elastic'
            ? {
                ease: 'elastic.out(0.6,0.9)',
                durDrop: 2,
                durMove: 2,
                durReturn: 2,
                promoteOverlap: 0.9,
                returnDelay: 0.05
            }
            : {
                ease: 'power1.inOut',
                durDrop: 0.8,
                durMove: 0.8,
                durReturn: 0.8,
                promoteOverlap: 0.45,
                returnDelay: 0.2
            };

    const childArr = useMemo(() => Children.toArray(children), [children]);
    const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);

    const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));

    const tlRef = useRef(null);
    const intervalRef = useRef();
    const container = useRef(null);

    useEffect(() => {
        const total = refs.length;
        refs.forEach((r, i) =>
            placeNow(r.current, makeSlot(i, responsiveCardDistance, responsiveVerticalDistance, total), skewAmount)
        );

        const swap = () => {
            if (order.current.length < 2) return;

            const [front, ...rest] = order.current;
            const elFront = refs[front].current;
            const tl = gsap.timeline();
            tlRef.current = tl;

            tl.to(elFront, {
                y: '+=500',
                duration: config.durDrop,
                ease: config.ease
            });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);

            rest.forEach((idx, i) => {
                const el = refs[idx].current;
                const slot = makeSlot(i, responsiveCardDistance, responsiveVerticalDistance, refs.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.durMove,
                        ease: config.ease
                    },
                    `promote+=${i * 0.15}`
                );
            });

            const backSlot = makeSlot(
                refs.length - 1,
                responsiveCardDistance,
                responsiveVerticalDistance,
                refs.length
            );

            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);

            tl.call(() => {
                gsap.set(elFront, { zIndex: backSlot.zIndex });
            }, undefined, 'return');

            tl.to(
                elFront,
                {
                    x: backSlot.x,
                    y: backSlot.y,
                    z: backSlot.z,
                    duration: config.durReturn,
                    ease: config.ease
                },
                'return'
            );

            tl.call(() => {
                order.current = [...rest, front];
            });
        };

        swap();
        intervalRef.current = window.setInterval(swap, delay);

        if (pauseOnHover) {
            const node = container.current;

            const pause = () => {
                tlRef.current?.pause();
                clearInterval(intervalRef.current);
            };

            const resume = () => {
                tlRef.current?.play();
                intervalRef.current = window.setInterval(swap, delay);
            };

            node.addEventListener('mouseenter', pause);
            node.addEventListener('mouseleave', resume);

            return () => {
                node.removeEventListener('mouseenter', pause);
                node.removeEventListener('mouseleave', resume);
                clearInterval(intervalRef.current);
            };
        }

        return () => clearInterval(intervalRef.current);

    }, [responsiveCardDistance, responsiveVerticalDistance, delay, pauseOnHover, skewAmount, easing]);

    const rendered = childArr.map((child, i) =>
        isValidElement(child)
            ? cloneElement(child, {
                key: i,
                ref: refs[i],
                style: { width: responsiveWidth, height: responsiveHeight, ...(child.props.style ?? {}) },
                onClick: e => {
                    child.props.onClick?.(e);
                    onCardClick?.(i);
                }
            })
            : child
    );

    return (
        <div className="tw-absolute tw-inset-x-0 tw-bottom-0 tw-flex tw-justify-center tw-overflow-visible tw-perspective-[900px]">
            <div
                ref={container}
                className="
          tw-relative tw-origin-bottom tw-overflow-visible
          tw-scale-[0.82] md:tw-scale-100
          max-[480px]:tw-scale-[0.64]
        "
                style={{ width: responsiveWidth, height: responsiveHeight }}
            >
                {rendered}
            </div>
        </div>
    );
};

export default CardSwap;
