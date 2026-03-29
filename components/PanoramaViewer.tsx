import React, { useEffect, useRef } from 'react';

// Declaration to satisfy TypeScript since Pannellum is loaded via script tag
declare global {
  interface Window {
    pannellum: any;
  }
}

interface PanoramaViewerProps {
  imageUrl: string;
  initialYaw?: number;   // Rotação horizontal inicial (0 a 360)
  initialPitch?: number; // Rotação vertical inicial (-90 a 90)
  initialHfov?: number;  // Campo de visão (Zoom inicial)
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ 
  imageUrl, 
  initialYaw = 0, 
  initialPitch = -5, // Levemente inclinado para baixo para dar sensação de "chão" e estabilidade
  initialHfov = 100  // Reduzido de 110 para 100 para diminuir distorção (efeito olho de peixe)
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerIdRef = useRef(`panorama-${Math.random().toString(36).substr(2, 9)}`);
  const viewerId = viewerIdRef.current;
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    let viewer: any = null;
    setError(null);

    if (window.pannellum && viewerRef.current) {
      try {
        viewer = window.pannellum.viewer(viewerId, {
          type: "equirectangular",
          panorama: imageUrl,
          autoLoad: true,
          autoRotate: -2,
          compass: false,
          showControls: true,
          mouseZoom: false,
          hfov: initialHfov,
          pitch: initialPitch,
          yaw: initialYaw,
          backgroundColor: [240, 240, 240],
          strings: {
             loadingLabel: "Carregando 360º...",
             loadButtonLabel: "Clique para carregar",
             genericWebGLError: "Seu navegador não suporta WebGL.",
             textureLoadError: "A imagem 360º expirou ou não pôde ser carregada. Por favor, atualize o link da imagem."
          },
          errorHandler: function(err: any) {
            console.error("Pannellum Error:", err);
            setError(typeof err === 'string' ? err : "Erro ao carregar a imagem 360º. O link pode ter expirado.");
          }
        });
      } catch (error) {
        console.error("Erro ao inicializar Pannellum:", error);
        setError("Erro ao inicializar o visualizador 360º.");
      }
    }

    return () => {
      if (viewer && typeof viewer.destroy === 'function') {
        try {
          viewer.destroy();
        } catch (e) {
          console.error("Erro ao destruir Pannellum:", e);
        }
      }
    };
  }, [imageUrl, viewerId, initialYaw, initialPitch, initialHfov]);

  return (
    <div className="relative w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group border border-gray-100 bg-gray-100 flex items-center justify-center">
         {/* Container do Pannellum (Sempre renderizado para evitar erros do Pannellum ao manipular o DOM) */}
         <div 
            id={viewerId} 
            ref={viewerRef} 
            className={`w-full h-full focus:outline-none ${error ? 'hidden' : 'block'}`}
            style={{ outline: 'none' }}
         ></div>
         
         {error ? (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center text-red-600 bg-red-50">
             <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             <h3 className="text-lg font-bold mb-2">Erro no Tour 360º</h3>
             <p className="text-sm">{error}</p>
             <p className="text-xs mt-4 text-red-400 max-w-md">O link da imagem do Google Fotos expirou. Por favor, hospede a imagem em um serviço definitivo (como Imgur) e atualize o link.</p>
           </div>
         ) : (
           /* Overlay de Instrução (Desaparece ao interagir ou apenas visual) */
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-xs md:text-sm px-4 py-2 rounded-full pointer-events-none z-10 flex items-center gap-2 border border-white/20 shadow-lg whitespace-nowrap">
              <svg className="w-5 h-5 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium tracking-wide">Tour Virtual: Arraste para girar</span>
           </div>
         )}
    </div>
  );
};