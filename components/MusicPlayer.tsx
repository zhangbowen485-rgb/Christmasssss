import React, { useEffect, useRef, useState } from 'react';

export const MusicPlayer: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.4);

  // Merry Christmas Mr. Lawrence
  const MUSIC_URL = "https://ia800806.us.archive.org/18/items/RyuichiSakamoto-MerryChristmasMrLawrence/Ryuichi%20Sakamoto%20-%20Merry%20Christmas%20Mr%20Lawrence.mp3";

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Attempt to play on mount
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlaying(true);
      }).catch((error) => {
        console.log("Autoplay prevented. Waiting for user interaction.");
        setPlaying(false);
      });
    }

    // Global listener to start music on first click if not playing
    const handleFirstInteraction = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().then(() => setPlaying(true)).catch(e => console.error(e));
        }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      audio.pause();
      audio.src = "";
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
      if(audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tree interaction
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 pointer-events-auto">
       <button 
         onClick={togglePlay}
         className={`
            w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500
            ${playing 
                ? 'bg-red-900/40 border-yellow-400/50 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                : 'bg-black/40 border-white/20 text-white/40'
            }
         `}
       >
         {playing ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-pulse">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
             </svg>
         ) : (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
             </svg>
         )}
       </button>
    </div>
  );
};