import React, { useState } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { Button } from './Button';

export const ImageEditor: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="p-8 border-b border-gray-100 bg-gray-50">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Simulador de Capachos IA</h3>
        <p className="text-gray-600">
          Envie uma imagem e descreva o capacho que você deseja visualizar para nossa IA fazer a simulação.
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Original Image */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sua Imagem</span>
              {selectedImage ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
                  <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                  <button onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs">X</button>
                </div>
              ) : (
                <div className="relative aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-gray-400 text-center px-4">Clique ou arraste uma imagem aqui</p>
                </div>
              )}
            </div>

            {/* Generated Image */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Resultado IA</span>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                    <p className="text-sm text-gray-500 animate-pulse">A IA está trabalhando no seu design...</p>
                  </div>
                ) : generatedImage ? (
                  <img src={generatedImage} alt="Gerada pela IA" className="w-full h-full object-cover" />
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
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <strong>Erro:</strong> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};