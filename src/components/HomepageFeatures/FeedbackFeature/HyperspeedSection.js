import { useRef } from 'react';
import Hyperspeed from '@site/src/components/HomepageFeatures/Reactbits/hyperSpeed'

export default function HyperspeedSection() {
  const speedRef = useRef(2);

  const handleMouseEnter = () => {
    speedRef.current = 4;
  };

  const handleMouseLeave = () => {
    speedRef.current = 4;
  };

  return (
    <div className="tw-relative tw-w-full tw-h-full">
      <div
        className="tw-w-full tw-h-full tw-rounded-2xl tw-animate-fadeIn tw-animate-float-slow tw-overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => { },
            onSlowDown: () => { },
            distortion: 'mountainDistortion',
            length: 400,
            roadWidth: 9,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 50,
            lightPairsPerRoadWay: 50,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],

            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.05, 400 * 0.15],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.2, 0.2],
            carFloorSeparation: [0.05, 1],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0x131318,
              brokenLines: 0x131318,
              leftCars: [0xff102a, 0xeb383e, 0xff102a],
              rightCars: [0xdadafa, 0xbebae3, 0x8f97e4],
              sticks: 0xdadafa
            }
          }}
        />

        {/* Your content goes here */}
        <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-z-10">
          <h1 className="tw-text-white tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-center tw-drop-shadow-lg">Your Input Matters.</h1>
        </div>
      </div>
    </div>
  );
}