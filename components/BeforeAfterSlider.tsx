import React, { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  alt: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeImage, afterImage, alt }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(percentage);
    }
  }, []);

  const onMouseDown = () => (isDragging.current = true);
  const onMouseUp = () => (isDragging.current = false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Prevent default could interrupt scrolling elsewhere, but strict touch-action: none is better via CSS
    handleMove(e.touches[0].clientX);
  };

  // Add global event listeners for smoother drag outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => (isDragging.current = false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleMove(e.clientX);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [handleMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-80 md:h-[600px] rounded-xl overflow-hidden shadow-2xl select-none group cursor-ew-resize border border-gray-200 touch-none"
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
      // Click to jump to position
      onClick={(e) => handleMove(e.clientX)}
    >
      {/* Background Image (After - Full) */}
      <img 
        src={afterImage} 
        alt={`Depois - ${alt}`} 
        className="absolute top-0 left-0 w-full h-full object-cover" 
        draggable={false}
        loading="lazy"
      />
      
      {/* Label After */}
      <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded uppercase tracking-wider z-10 shadow-lg">
        Depois
      </div>

      {/* Foreground Image (Before - Clipped) */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={beforeImage} 
          alt={`Antes - ${alt}`} 
          className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
          draggable={false}
          loading="lazy"
        />
        {/* Label Before */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded uppercase tracking-wider z-10 shadow-lg">
          Antes
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-red-600 transform group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
          </svg>
        </div>
      </div>
      
      {/* Instructions Overlay (Disappears on interaction) */}
      <div className={`absolute bottom-4 left-0 right-0 text-center transition-opacity duration-500 pointer-events-none ${isDragging.current || sliderPosition !== 50 ? 'opacity-0' : 'opacity-100'}`}>
        <span className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/20">
          Arraste para comparar
        </span>
      </div>
    </div>
  );
};