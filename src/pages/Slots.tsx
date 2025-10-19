import React, { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Labubu } from '@labubu/common/src/types/labubu';
import { VariantCard } from '../components/VariantCard';

const Slots: React.FC = () => {
  const [labubus, setLabubus] = useState<Labubu[]>([]);
  const [reel1Result, setReel1Result] = useState<Labubu | null>(null);
  const [reel2Result, setReel2Result] = useState<Labubu | null>(null);
  const [reel3Result, setReel3Result] = useState<Labubu | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);

  const reelIntervals = useRef<number[]>([]);

  useEffect(() => {
    const fetchLabubus = async () => {
      try {
        const allLabubus = await api.labubus.get();
        setLabubus(allLabubus);
        setLoading(false);
        // Initial display of three random unique variants
        if (allLabubus.length >= 3) {
          const initialResults: Labubu[] = [];
          const usedIndices = new Set<number>();
          while (initialResults.length < 3) {
            const randomIndex = Math.floor(Math.random() * allLabubus.length);
            if (!usedIndices.has(randomIndex)) {
              initialResults.push(allLabubus[randomIndex]);
              usedIndices.add(randomIndex);
            }
          }
          setReel1Result(initialResults[0]);
          setReel2Result(initialResults[1]);
          setReel3Result(initialResults[2]);
        }
      } catch (error) {
        console.error("Failed to fetch Labubus:", error);
        setLoading(false);
      }
    };
    fetchLabubus();

    return () => {
      reelIntervals.current.forEach(clearInterval);
    };
  }, []);

  const spin = (allLabubus: Labubu[] = labubus) => {
    if (isSpinning || allLabubus.length === 0) return;

    setIsSpinning(true);
    setIsWin(false);
    reelIntervals.current.forEach(clearInterval); // Clear any existing intervals
    reelIntervals.current = [];

    let finalResults: Labubu[] = [];

    if (allLabubus.length < 3) {
      // Fallback if not enough labubus for complex logic
      for (let i = 0; i < 3; i++) {
        finalResults.push(allLabubus[i % allLabubus.length]);
      }
    } else {
      // Determine win type based on probabilities
      const winRoll = Math.random();
      let currentIsWin = false;

      if (winRoll < 0.20) { // 20% chance for three-of-a-kind
        const winningLabubu = allLabubus[Math.floor(Math.random() * allLabubus.length)];
        finalResults = [winningLabubu, winningLabubu, winningLabubu];
        currentIsWin = true;
      } else if (winRoll < 0.40) { // 20% chance for two-of-a-kind
        let labubuA = allLabubus[Math.floor(Math.random() * allLabubus.length)];
        let labubuB = allLabubus[Math.floor(Math.random() * allLabubus.length)];

        // Ensure labubuA and labubuB are different
        while (labubuA.sku === labubuB.sku) {
          labubuB = allLabubus[Math.floor(Math.random() * allLabubus.length)];
        }

        // Randomly assign two of labubuA and one of labubuB
        const positions = [0, 1, 2];
        const firstA = positions.splice(Math.floor(Math.random() * positions.length), 1)[0];
        const secondA = positions.splice(Math.floor(Math.random() * positions.length), 1)[0];
        const B = positions[0];

        finalResults[firstA] = labubuA;
        finalResults[secondA] = labubuA;
        finalResults[B] = labubuB;
        currentIsWin = true;
      } else { // 60% chance for no win (all different)
        const losingLabubus: Labubu[] = [];
        const usedIndices = new Set<number>();
        while (losingLabubus.length < 3) {
          const randomIndex = Math.floor(Math.random() * allLabubus.length);
          if (!usedIndices.has(randomIndex)) {
            losingLabubus.push(allLabubus[randomIndex]);
            usedIndices.add(randomIndex);
          }
        }
        finalResults = losingLabubus;
        currentIsWin = false;
      }
    }

    let reelsStoppedCount = 0;
    const totalReels = 3;

    const stopReel = (setReelResult: React.Dispatch<React.SetStateAction<Labubu | null>>, reelIndex: number, intervalId: number, finalLabubu: Labubu) => {
      setTimeout(() => {
        clearInterval(intervalId);
        setReelResult(finalLabubu);
        reelsStoppedCount++;
        if (reelsStoppedCount === totalReels) {
          setIsSpinning(false);
          setIsWin(currentIsWin);
        }
      }, (reelIndex + 1) * 700); // Staggered stop: 0.7s, 1.4s, 2.1s
    };

    const startSpinningReel = (setReelResult: React.Dispatch<React.SetStateAction<Labubu | null>>, reelIndex: number, finalLabubu: Labubu) => {
      const intervalId = window.setInterval(() => {
        setReelResult(allLabubus[Math.floor(Math.random() * allLabubus.length)]);
      }, 100);
      reelIntervals.current.push(intervalId);
      stopReel(setReelResult, reelIndex, intervalId, finalLabubu);
    };

    startSpinningReel(setReel1Result, 0, finalResults[0]);
    startSpinningReel(setReel2Result, 1, finalResults[1]);
    startSpinningReel(setReel3Result, 2, finalResults[2]);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Labubu Slot Machine</h1>
        <p>Loading Labubus...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Labubu Slot Machine</h1>
      <div className="flex justify-center items-center space-x-4 my-8 min-h-[300px]">
        <div className={`w-1/3 ${isWin ? 'animate-win' : ''}`}>
          {reel1Result && <VariantCard variant={reel1Result} />}
        </div>
        <div className={`w-1/3 ${isWin ? 'animate-win' : ''}`}>
          {reel2Result && <VariantCard variant={reel2Result} />}
        </div>
        <div className={`w-1/3 ${isWin ? 'animate-win' : ''}`}>
          {reel3Result && <VariantCard variant={reel3Result} />}
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={() => spin()}
          disabled={isSpinning}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Spinning...' : 'Spin!'}
        </button>
      </div>
      {isWin && (
        <p className="text-center text-2xl font-bold text-green-600 mt-4 animate-pulse">
          🎉 You Win! 🎉
        </p>
      )}
    </div>
  );
};

export default Slots;