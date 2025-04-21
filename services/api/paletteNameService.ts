import { OpenAIMessage, sendMessage } from './openaiService';

/**
 * Generate a creative name for a color palette using OpenAI
 * @param colors Array of hex color codes in the palette
 * @returns A creative name for the color palette
 */
export async function generatePaletteName(colors: string[]): Promise<string> {
  if (!colors || colors.length === 0) {
    console.error('No colors provided for naming');
    return 'Color Collection';
  }
  
  try {
    console.log('Generating palette name for colors:', colors);
    
    // Analyze the colors for descriptive terms to use in fallback
    const colorDescriptions = analyzeColors(colors);
    
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
        content: `Create a name for a color palette with these hex colors: ${colors.join(', ')}. Respond only with the name.`
      }
    ];

    // Call the OpenAI API with a timeout
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out')), 5000);
    });

    const responsePromise = sendMessage(messages, {
      temperature: 0.8, // Higher temperature for more creativity
      max_tokens: 50,   // Limit token usage
    });

    // Race between the API call and the timeout
    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    if (typeof response === 'object' && response.content) {
      // Clean up and return the response
      const name = response.content.trim().replace(/"/g, '');
      
      // If we got a meaningful name, return it
      if (name && name.length > 0 && name !== 'Unnamed Palette') {
        return name;
      }
    }
    
    // If we reach here, something went wrong with the API but didn't throw an error
    // Use our fallback
    return generateFallbackName(colorDescriptions);
    
  } catch (error) {
    console.error('Error generating palette name:', error);
    
    // Generate a fallback name based on the colors
    const colorDescriptions = analyzeColors(colors);
    return generateFallbackName(colorDescriptions);
  }
}

/**
 * Analyze colors to generate descriptive terms
 */
function analyzeColors(colors: string[]): string[] {
  const descriptions: string[] = [];
  
  colors.forEach(color => {
    // Remove the # if present
    const hex = color.startsWith('#') ? color.slice(1) : color;
    
    // Convert to RGB
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Check brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    if (brightness < 50) descriptions.push('Dark');
    else if (brightness > 200) descriptions.push('Light');
    
    // Check primary colors
    if (r > g + b) descriptions.push('Red');
    if (g > r + b) descriptions.push('Green');
    if (b > r + g) descriptions.push('Blue');
    
    // Check for pastels
    if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 50 && Math.abs(g - b) < 50 && Math.abs(r - b) < 50) {
      descriptions.push('Pastel');
    }
    
    // Check for earth tones
    if (r > g && g > b && r < 200 && g < 150) {
      descriptions.push('Earthy');
    }
    
    // Check for vibrant colors
    if (Math.max(r, g, b) > 200 && Math.abs(r - g) > 100 || Math.abs(g - b) > 100 || Math.abs(r - b) > 100) {
      descriptions.push('Vibrant');
    }
  });
  
  // Remove duplicates
  return [...new Set(descriptions)];
}

/**
 * Generate a fallback name based on color descriptions
 */
function generateFallbackName(descriptions: string[]): string {
  if (descriptions.length === 0) {
    return 'Color Harmony';
  }
  
  // Get unique descriptors
  const uniqueDescriptors = [...new Set(descriptions)];
  
  // Pick 1-2 descriptors
  const selectedDescriptors = uniqueDescriptors.slice(0, Math.min(2, uniqueDescriptors.length));
  
  // Combine with a random noun
  const nouns = ['Palette', 'Spectrum', 'Harmony', 'Collection', 'Scheme', 'Horizon', 'Vision', 'Tones'];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${selectedDescriptors.join(' ')} ${randomNoun}`;
} 