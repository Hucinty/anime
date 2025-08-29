import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateImage = async (imageFile: File, style: string, aspectRatio: string): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);

    if (style.toLowerCase() === 'doodle') {
        // Use the image editing model to add doodles directly to the image
        const editModel = 'gemini-2.5-flash-image-preview';
        const response = await ai.models.generateContent({
            model: editModel,
            contents: {
                parts: [
                    imagePart,
                    {
                        text: 'Overlay the image with playful, hand-drawn, white line-art doodles that interact with the scene, without changing the original image in any other way.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("Doodle generation failed. No image was returned by the API.");
    } else {
        const visionModel = 'gemini-2.5-flash';
        let promptForVision: string;

        if (style.toLowerCase() === 'bio-mechanical') {
            promptForVision = `Analyze the main subject of this image. Generate a detailed, descriptive prompt for an AI image generator to recreate the subject. The final image must have a specific "bio-mechanical schematic" aesthetic: the main subject should be depicted as if it is a biological specimen being analyzed, surrounded by intricate sci-fi UI elements, glowing green data readouts, complex charts, technical annotations, and smaller related inset images. The entire composition should be on a dark, near-black background, giving it a futuristic, high-tech laboratory feel. The prompt should be a single, concise paragraph focusing on the main subject within this detailed, sci-fi schematic context. Do not include any introductory text, titles, or markdown formatting—only the prompt itself.`;
        } else {
            promptForVision = `Analyze this image and generate a detailed, descriptive prompt for an AI image generator to recreate it in a "${style}" style. Focus on the main subject, background, colors, and overall mood. The prompt should be a single, concise paragraph. Do not include any introductory text, titles, or markdown formatting—only the prompt itself.`;
        }
        
        // Step 1: Get a descriptive prompt from Gemini Vision
        const visionResponse = await ai.models.generateContent({
            model: visionModel,
            contents: { parts: [imagePart, { text: promptForVision }] },
        });
        
        const generatedPrompt = visionResponse.text;

        // Step 2: Generate image using Imagen from the generated prompt
        const imageModel = 'imagen-4.0-generate-001';
        
        const imageResponse = await ai.models.generateImages({
            model: imageModel,
            prompt: generatedPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            return imageResponse.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("Image generation failed. No images were returned by the API.");
        }
    }
};