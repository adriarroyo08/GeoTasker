import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Use a dummy key if missing to prevent crash on startup, actual calls will fail and trigger fallback
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "dummy_key";
const ai = new GoogleGenAI({ apiKey });

export const parseTaskWithGemini = async (input: string): Promise<{ title: string; description: string; hasLocation: boolean; suggestedLocationName?: string; dueDate?: string }> => {
  try {
    if (apiKey === "dummy_key") throw new Error("No API Key");

    const sanitizedInput = JSON.stringify(input);

    const currentDate = new Date().toISOString();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analiza la siguiente entrada de usuario para una aplicación de tareas y extrae la información en formato JSON.
      Entrada: ${sanitizedInput}
      Fecha actual del sistema: ${currentDate}
      Si el usuario menciona un lugar, extráelo en "suggestedLocationName". Si no, déjalo vacío.
      Si el usuario menciona una fecha o un momento en el tiempo (como "mañana", "el viernes", "la próxima semana"), utiliza la fecha actual del sistema para calcular y extraer esa fecha exacta en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) en el campo "dueDate". Si no se menciona fecha, omítelo o devuélvelo nulo.
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
            dueDate: { type: Type.STRING, nullable: true },
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
      description: "Generado automáticamente",
      hasLocation: false
    };
  }
};