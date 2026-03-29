import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { Button } from './Button';

export const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Estado para o modal de zoom
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setIsLoading(true);
    setError(null);

    // Default MIME type for the uploaded image (simplified)
    const mimeType = selectedImage.substring(selectedImage.indexOf(':') + 1, selectedImage.indexOf(';'));

    const result = await editImageWithGemini(selectedImage, mimeType, prompt);

    if (result.error) {
      setError(result.error);
    } else {
      setGeneratedImage(result.imageUrl);
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-100 bg-gray-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Estúdio de Criação IA - Capachos</h3>
          <p className="text-gray-600">
            Envie uma foto da sua entrada e use nossa IA para visualizar como ficaria um <strong>capacho personalizado</strong>.
            <br/>
            <span className="text-sm italic opacity-75">Nota: Esta ferramenta é otimizada para simular tapetes e capachos no chão.</span>
          </p>
        </div>

        <div className="p-8">
          {!selectedImage ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg text-gray-600 font-medium mb-4">Arraste uma foto da sua entrada</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
                id="image-upload"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                Selecionar Foto
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Original Image */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Original
                    <span className="text-xs font-normal text-gray-400 lowercase">(clique para ampliar)</span>
                  </span>
                  <div 
                    className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner group cursor-zoom-in"
                    onClick={() => setPreviewImage(selectedImage)}
                  >
                    <img src={selectedImage} alt="Original" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                       </svg>
                    </div>
                  </div>
                </div>

                {/* Generated Image */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Resultado IA
                    {generatedImage && <span className="text-xs font-normal text-gray-400 lowercase">(clique para ampliar)</span>}
                  </span>
                  <div 
                    className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner flex items-center justify-center ${generatedImage ? 'group cursor-zoom-in' : ''}`}
                    onClick={() => generatedImage && setPreviewImage(generatedImage)}
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red-600"></div>
                        <p className="text-sm text-gray-500 animate-pulse">A IA está desenhando seu tapete...</p>
                      </div>
                    ) : generatedImage ? (
                      <>
                        <img src={generatedImage} alt="Gerada pela IA" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                           <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                           </svg>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-center px-4">
                        O resultado aparecerá aqui
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-grow w-full">
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    Descreva o capacho que você deseja
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="prompt"
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Adicione um capacho bege com a escrita 'Bem Vindo'..."
                      className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 outline-none text-gray-900 bg-white"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                     Powered by Gemini 2.5 Flash Image
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto mt-6">
                   <Button onClick={handleReset} variant="outline" disabled={isLoading} className="flex-1 md:flex-none">
                    Reiniciar
                  </Button>
                  <Button onClick={handleGenerate} disabled={isLoading || !prompt} className="flex-1 md:flex-none">
                    {isLoading ? 'Gerando...' : 'Visualizar'}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-brand-red-50 text-brand-red-700 rounded-lg border border-brand-red-200">
                  <strong>Erro:</strong> {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-[101]"
            onClick={() => setPreviewImage(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img 
            src={previewImage} 
            alt="Visualização em tela cheia" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-slam-in"
            onClick={(e) => e.stopPropagation()} 
          />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
             Pressione ESC ou clique fora para fechar
          </div>
        </div>
      )}
    </>
  );
};