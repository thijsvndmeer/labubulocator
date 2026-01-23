import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wheel } from 'react-custom-roulette';
import { api } from '@/lib/api';
import { Labubu } from '@labubu/common';
import { VariantCard } from '@/components/VariantCard';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Confetti from 'react-confetti';
import { useQuery } from '@tanstack/react-query';
import { BackendStartupMessage } from '@/components/BackendStartupMessage';

// Define a color palette for the wheel
const colorPalette = [
  '#FFC107', // Amber
  '#FF5722', // Deep Orange
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#FF9800', // Orange
  '#8BC34A', // Light Green
  '#3F51B5', // Indigo
];

const Random: React.FC = () => {
  const { data: variants = [], isLoading, isError } = useQuery<Labubu[]>({
    queryKey: ['variants'],
    queryFn: () => api.labubus.get(),
  });

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Labubu | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sound effect placeholders
  const spinSoundRef = useRef<HTMLAudioElement>(null);
  const winSoundRef = useRef<HTMLAudioElement>(null);

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  if (isError) {
    return <BackendStartupMessage />;
  }

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * variants.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setSelectedVariant(null);
      setShowConfetti(false);
      // Play spin sound
      spinSoundRef.current?.play();
    }
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setSelectedVariant(variants[prizeNumber]);
    setShowConfetti(true);
    // Play win sound
    winSoundRef.current?.play();
  };

  const wheelData = variants.map((variant, index) => ({
    option: variant.name,
    style: {
      backgroundColor: colorPalette[index % colorPalette.length],
      textColor: 'white',
    },
  }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 overflow-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "#111827",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 200,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <div className="absolute top-4 left-0 w-full flex items-center justify-center z-20">
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">Wheel of Labubu</h1>
      </div>
      <div className="z-10 flex flex-col items-center justify-center w-full h-full">
        {variants.length > 0 ? (
          <>
            <div className="absolute top-[calc(50%+5rem)] left-1/2 -translate-x-1/2 -translate-y-1/2 transform scale-[3]">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={wheelData}
                onStopSpinning={onStopSpinning}
                backgroundColors={['#f8d7da', '#fce3e6', '#f2f2f2']}
                textColors={['#ffffff']}
                outerBorderColor={'#eeeeee'}
                outerBorderWidth={15}
                innerBorderColor={'#dddddd'}
                innerBorderWidth={15}
                radiusLineColor={'#cccccc'}
                radiusLineWidth={4}
                fontSize={14}
                textDistance={70}
              />
            </div>
            <button
              className="absolute bottom-10 right-10 px-16 py-8 text-4xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 animate-bounce z-20"
              onClick={handleSpinClick}
              disabled={mustSpin}
            >
              Spin
            </button>
          </>
        ) : (
          <p className="text-white">Loading variants...</p>
        )}
        {selectedVariant && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in transform scale-75 shadow-lg rounded-lg overflow-hidden ring-8 ring-purple-500 ring-opacity-75 z-30">
            <VariantCard variant={selectedVariant} />
          </div>
        )}
      </div>

      {/* Audio elements for sound effects (replace with actual sound files) */}
      <audio ref={spinSoundRef} src="/path/to/spin-sound.mp3" />
      <audio ref={winSoundRef} src="/path/to/win-sound.mp3" />
    </div>
  );
};

export default Random;