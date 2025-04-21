import { OpenAIMessage, sendMessage } from './openaiService';

/**
 * Generate a creative name for a color palette using OpenAI
 * @param colors Array of hex color codes in the palette
 * @returns A creative name for the color palette
 */
export async function generatePaletteName(colors: string[]): Promise<string> {
  try {
    // Create a prompt that describes the task
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are a creative assistant that specializes in naming color palettes. ' +
          'Generate a short, catchy, and evocative name that captures the mood or theme suggested by these colors. ' +
          'Keep the name between 2-5 words. Do not include explanations, just return the name.'
      },
      {
        role: 'user',
        content: `Create a name for a color palette with these colors: ${colors.join(', ')}`
      }
    ];

    // Call the OpenAI API
    const response = await sendMessage(messages, {
      temperature: 0.8, // Higher temperature for more creativity
      max_tokens: 50,   // Limit token usage
    });

    // Clean up and return the response
    return response.content.trim().replace(/"/g, '');
  } catch (error) {
    console.error('Error generating palette name:', error);
    return 'Unnamed Palette';
  }
} 