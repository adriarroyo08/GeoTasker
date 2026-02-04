import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Use a dummy key if not present to prevent crash on init, but calls will fail (handled in catch)
const apiKey = process.env.API_KEY || "dummy_key_for_init";
const ai = new GoogleGenAI({ apiKey });

export const parseTaskWithGemini = async (input: string): Promise<{ title: string; description: string; hasLocation: boolean; suggestedLocationName?: string }> => {
  try {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza la siguiente entrada de usuario para una aplicación de tareas y extrae la información en formato JSON.
      Entrada: "${input}"
      Si el usuario menciona un lugar, extráelo en "suggestedLocationName". Si no, déjalo vacío.
      Devuelve un título conciso y una descripción si hay detalles extra.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            hasLocation: { type: Type.BOOLEAN },
            suggestedLocationName: { type: Type.STRING, nullable: true },
          },
          required: ["title", "description", "hasLocation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    // Fallback for demo if API key is missing or fails
    return {
      title: input,
      description: "Generado automáticamente (Fallback)",
      hasLocation: false
    };
  }
};