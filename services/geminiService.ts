import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface GenerateImageResult {
  imageUrl: string | null;
  error: string | null;
}

export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<GenerateImageResult> => {
  try {
    // Remove header from base64 string if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let imageUrl: string | null = null;

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                // Assuming PNG output for now, or we could try to infer from response if available, 
                // but usually the model returns a compatible format.
                imageUrl = `data:image/png;base64,${base64EncodeString}`;
                break;
            }
        }
    }

    if (!imageUrl) {
      throw new Error("Nenhuma imagem foi gerada pelo modelo.");
    }

    return { imageUrl, error: null };
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return {
      imageUrl: null,
      error: err.message || "Falha ao processar a imagem. Tente novamente.",
    };
  }
};