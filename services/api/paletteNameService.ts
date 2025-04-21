import { OpenAIMessage, sendMessage } from './openaiService';

/**
 * Generate a creative name for a color palette using OpenAI
 * @param colors Array of hex color codes in the palette
 * @returns A creative, funny name with rhyming words for the color palette
 */
export async function generatePaletteName(colors: string[]): Promise<string> {
  if (!colors || colors.length === 0) {
    console.error('No colors provided for naming');
    return 'Funny Bunny Collection';
  }
  
  try {
    console.log('Generating palette name for colors:', colors);
    
    // Analyze the colors for descriptive terms to use in fallback
    const colorDescriptions = analyzeColors(colors);
    
    // Create a prompt that describes the task - now with focus on humor and rhymes
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are a creative assistant that specializes in naming color palettes with humor and rhymes. ' +
          'Generate a funny, memorable name where each word rhymes with at least one other word in the name. ' +
          'For example: "Bright Light Night" or "Mellow Yellow Fellow" or "Blue Hue Stew". ' +
          'Keep the name between 2-4 words. Respond only with the name, no explanations.'
      },
      {
        role: 'user',
        content: `Create a funny, rhyming name for a color palette with these hex colors: ${colors.join(', ')}. Make sure words rhyme with each other.`
      }
    ];

    // Call the OpenAI API with a timeout
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out')), 5000);
    });

    const responsePromise = sendMessage(messages, {
      temperature: 0.9, // Higher temperature for more creativity and humor
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
    // Use our fallback for funny rhyming names
    return generateFunnyRhymingFallback(colorDescriptions);
    
  } catch (error) {
    console.error('Error generating palette name:', error);
    
    // Generate a fallback funny rhyming name based on the colors
    const colorDescriptions = analyzeColors(colors);
    return generateFunnyRhymingFallback(colorDescriptions);
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
 * Generate a funny rhyming name based on color descriptions
 */
function generateFunnyRhymingFallback(descriptions: string[]): string {
  // Rhyming pairs for color descriptions
  const rhymingPairs: Record<string, string[]> = {
    'Dark': ['Bark', 'Park', 'Lark', 'Spark'],
    'Light': ['Bright', 'Night', 'Tight', 'Sight'],
    'Red': ['Bed', 'Fed', 'Shed', 'Fred'],
    'Green': ['Mean', 'Bean', 'Scene', 'Queen'],
    'Blue': ['New', 'True', 'Stew', 'Sue'],
    'Pastel': ['Bell', 'Shell', 'Well', 'Sell'],
    'Earthy': ['Worthy', 'Perthy', 'Mirth-y'],
    'Vibrant': ['Jubilant', 'Brilliant']
  };
  
  // Default funny rhyming pairs if no matching description
  const defaultRhymingPairs = [
    ['Funny', 'Sunny', 'Honey', 'Bunny'],
    ['Cool', 'Rule', 'Tool', 'Pool'],
    ['Sleek', 'Peek', 'Chic', 'Week'],
    ['Bold', 'Gold', 'Fold', 'Told'],
    ['Neat', 'Sweet', 'Treat', 'Fleet']
  ];
  
  // Select a descriptor to build the rhyme from
  let selectedDescriptor = '';
  let rhymingWords: string[] = [];
  
  if (descriptions.length > 0) {
    // Try to use a color description that has rhymes
    for (const desc of descriptions) {
      if (rhymingPairs[desc]) {
        selectedDescriptor = desc;
        rhymingWords = rhymingPairs[desc];
        break;
      }
    }
  }
  
  // If no matching descriptor with rhymes, use a default pair
  if (!selectedDescriptor) {
    const randomPairIndex = Math.floor(Math.random() * defaultRhymingPairs.length);
    rhymingWords = defaultRhymingPairs[randomPairIndex];
  }
  
  // Pick 2-3 rhyming words
  const numWords = Math.floor(Math.random() * 2) + 2; // 2 or 3 words
  const shuffledWords = [...rhymingWords].sort(() => Math.random() - 0.5);
  const selectedWords = shuffledWords.slice(0, numWords);
  
  // If we had a descriptor but it's not in the words, add it
  if (selectedDescriptor && !selectedWords.includes(selectedDescriptor)) {
    if (Math.random() > 0.5) {
      selectedWords.unshift(selectedDescriptor); // Add at beginning
    } else {
      selectedWords.push(selectedDescriptor); // Add at end
    }
  }
  
  // Combine the words
  return selectedWords.join(' ');
} 