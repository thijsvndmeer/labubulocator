import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home: React.FC = () => {
  const main = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context((self) => {
      if (!self.selector) return;
      const sections = self.selector('.panel');
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: '.container',
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => '+=' + document.querySelector('.container')?.offsetWidth,
        },
      });
    }, main);
    return () => ctx.revert();
  }, []);

  const images = [
    'LBB-PFL-A.png',
    'LBB-PFL-B.png',
    'LBB-PFL-C.png',
    'LBB-PFL-D.png',
    'LBB-PFL-E.png',
    'LBB-PFL-F.png',
    'LBB-PFL-G.png',
    'LBB-PFL-H.png',
    'LBB-PFL-I.png',
    'LBB-PFL-J.png',
    'LBB-PFL-K.png',
    'LBB-PFL-L.png',
  ];

  return (
    <div ref={main}>
      <div className="container flex flex-nowrap">
        <div className="panel w-screen h-screen flex-shrink-0 flex items-center justify-center text-white bg-black">
          <h1 className="text-4xl font-bold text-center">Scroll to discover the Labubu A-L series</h1>
        </div>
        {images.map((image, index) => (
          <div key={index} className="panel w-screen h-screen flex-shrink-0 flex items-center justify-center bg-black">
            <img src={`https://api.labubulocator.me/images/${image}`} alt={`Labubu ${image}`} className="max-h-full" />
          </div>
        ))}
        <div className="panel w-screen h-screen flex-shrink-0 flex items-center justify-center text-white bg-black">
          <h2 className="text-2xl font-bold text-center">More to come...</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;