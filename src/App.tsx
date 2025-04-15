import { useState, useEffect } from 'react'
import './App.css'

// Types
type PaletteStyle = 'retro' | 'modern' | 'pastel' | 'vibrant'
type ColorHarmony = 'random' | 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary'
type ColorPalette = {
  id: string
  colors: string[]
  style: PaletteStyle
  harmony: ColorHarmony
}
type Toast = {
  id: string
  message: string
  type: 'success' | 'error'
}

// Utility functions
const generateRandomHex = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

const generatePaletteColors = (count: number = 5): string[] => {
  return Array.from({ length: count }, () => generateRandomHex())
}

// Color manipulation functions
const hexToHsl = (hex: string): [number, number, number] => {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  
  // Find max and min values to calculate lightness
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

const hslToHex = (h: number, s: number, l: number): string => {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Style filters
const applyStyleFilter = (colors: string[], style: PaletteStyle): string[] => {
  switch(style) {
    case 'retro':
      // Muted, slightly desaturated colors with warm undertones
      return colors.map(color => {
        const [h, s, l] = hexToHsl(color);
        const newHue = (h + 15) % 360;
        const newSat = Math.min(s, 65);
        const newLight = Math.min(Math.max(l - 5, 30), 70);
        return hslToHex(newHue, newSat, newLight);
      });
      
    case 'modern':
      // Crisp, clean colors with high contrast
      return colors.map(color => {
        const [h, s, l] = hexToHsl(color);
        const newSat = Math.min(s + 10, 90);
        const newLight = l > 50 ? Math.min(l + 10, 90) : Math.max(l - 10, 15);
        return hslToHex(h, newSat, newLight);
      });
      
    case 'pastel':
      // Soft, high-lightness, low-saturation colors
      return colors.map(color => {
        const [h, s, l] = hexToHsl(color);
        const newSat = Math.min(s, 40);
        const newLight = Math.min(Math.max(l + 20, 70), 90);
        return hslToHex(h, newSat, newLight);
      });
      
    case 'vibrant':
      // High-saturation, bright colors
      return colors.map(color => {
        const [h, s, l] = hexToHsl(color);
        const newSat = Math.min(s + 30, 100);
        const newLight = Math.min(Math.max(l, 45), 65);
        return hslToHex(h, newSat, newLight);
      });
      
    default:
      return colors;
  }
};

// Color wheel harmony functions
const getComplementaryColor = (h: number): number => {
  return (h + 180) % 360;
}

const getAnalogousColors = (h: number): [number, number, number] => {
  const h1 = h;
  const h2 = (h + 30) % 360;
  const h3 = (h + 330) % 360; // -30 degrees, adjusted to positive
  return [h1, h2, h3];
}

const getTriadicColors = (h: number): [number, number, number] => {
  const h1 = h;
  const h2 = (h + 120) % 360;
  const h3 = (h + 240) % 360;
  return [h1, h2, h3];
}

const getSplitComplementaryColors = (h: number): [number, number, number] => {
  const h1 = h;
  const h2 = (h + 150) % 360;
  const h3 = (h + 210) % 360;
  return [h1, h2, h3];
}

const getMonochromaticShades = (h: number, s: number, l: number): [number, number, number, number, number] => {
  // Keep hue the same, vary saturation and lightness
  return [
    h,
    h,
    h,
    h,
    h
  ];
}

// Generate palette with specific harmony
const generateHarmonyPalette = (harmony: ColorHarmony, count: number = 5): string[] => {
  // Start with a random base color
  const baseColor = generateRandomHex();
  const [h, s, l] = hexToHsl(baseColor);
  
  // Apply the selected harmony
  let hues: number[] = [];
  
  switch(harmony) {
    case 'monochromatic':
      // Same hue, different saturation/lightness
      hues = Array(count).fill(h);
      return hues.map((hue, i) => {
        const newSat = Math.max(30, Math.min(90, s + (i - 2) * 15));
        const newLight = Math.max(25, Math.min(75, l + (i - 2) * 10));
        return hslToHex(hue, newSat, newLight);
      });
      
    case 'complementary':
      // Base color + complement, with variations
      const complement = getComplementaryColor(h);
      hues = [h, h, complement, complement, h];
      return hues.map((hue, i) => {
        const newSat = Math.max(30, Math.min(90, s + (i % 2) * 10));
        const newLight = Math.max(25, Math.min(75, l + (i % 3 - 1) * 15));
        return hslToHex(hue, newSat, newLight);
      });
      
    case 'analogous':
      // Three adjacent colors on the wheel
      const [h1, h2, h3] = getAnalogousColors(h);
      hues = [h1, h1, h2, h3, h3];
      return hues.map((hue, i) => {
        const newSat = Math.max(40, Math.min(90, s));
        const newLight = Math.max(35, Math.min(65, l + (i % 3 - 1) * 10));
        return hslToHex(hue, newSat, newLight);
      });
      
    case 'triadic':
      // Three colors evenly spaced on the wheel
      const [t1, t2, t3] = getTriadicColors(h);
      hues = [t1, t2, t3, t1, t2];
      return hues.map((hue, i) => {
        const newSat = Math.max(40, Math.min(90, s));
        const newLight = Math.max(35, Math.min(65, l));
        return hslToHex(hue, newSat, newLight);
      });
      
    case 'split-complementary':
      // Base color + two adjacent to its complement
      const [s1, s2, s3] = getSplitComplementaryColors(h);
      hues = [s1, s1, s2, s3, s1];
      return hues.map((hue, i) => {
        const newSat = Math.max(40, Math.min(90, s));
        const newLight = Math.max(35, Math.min(65, l));
        return hslToHex(hue, newSat, newLight);
      });
      
    case 'random':
    default:
      return generatePaletteColors(count);
  }
}

// Helper functions for UI
const getHarmonyDescription = (harmony: ColorHarmony): string => {
  switch(harmony) {
    case 'monochromatic':
      return 'Uses one color in different shades. Clean, harmonious, easy on the eyes.';
    case 'complementary':
      return 'Uses two colors opposite on the color wheel. Bold, high-contrast, attention-grabbing.';
    case 'analogous':
      return 'Uses three adjacent colors on the wheel. Natural, cohesive, soft transitions.';
    case 'triadic':
      return 'Uses three colors evenly spaced around the wheel. Balanced but colorful.';
    case 'split-complementary':
      return 'One base color plus two colors next to its opposite. Dynamic but less intense.';
    case 'random':
    default:
      return 'Random colors with no specific harmony.';
  }
};

function App() {
  const [currentPalette, setCurrentPalette] = useState<string[]>([])
  const [currentStyle, setCurrentStyle] = useState<PaletteStyle>('retro')
  const [currentHarmony, setCurrentHarmony] = useState<ColorHarmony>('random')
  const [favorites, setFavorites] = useState<ColorPalette[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [saveButtonSelected, setSaveButtonSelected] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [isRemovingFavorite, setIsRemovingFavorite] = useState(false)

  // Generate initial palette on mount
  useEffect(() => {
    generateNewPalette()
  }, [])

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('colorPaletteFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Debug dimensions
  useEffect(() => {
    const logDimensions = () => {
      console.log('Viewport width:', window.innerWidth)
      console.log('Viewport height:', window.innerHeight)
      const container = document.querySelector('.container')
      if (container) {
        console.log('Container width:', container.clientWidth)
        console.log('Container offset:', container.getBoundingClientRect().left)
      }
    }
    
    logDimensions()
    window.addEventListener('resize', logDimensions)
    return () => window.removeEventListener('resize', logDimensions)
  }, [])

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('colorPaletteFavorites', JSON.stringify(favorites))
  }, [favorites])

  // Toast handler
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Update background gradient with palette colors
  useEffect(() => {
    if (currentPalette.length > 0) {
      // Create a 4-point gradient with colors at each corner
      const topLeft = currentPalette[0] || '#000000';
      const topRight = currentPalette[1] || topLeft;
      const bottomRight = currentPalette[2] || topLeft;
      const bottomLeft = currentPalette[3] || topRight;
      const center = currentPalette[4] || topLeft;
      
      // Create the background with softer, more fluid radial gradients at each corner
      const background = `
        radial-gradient(circle at 0 0, ${topLeft}, transparent 70%),
        radial-gradient(circle at 100% 0, ${topRight}, transparent 70%),
        radial-gradient(circle at 100% 100%, ${bottomRight}, transparent 70%),
        radial-gradient(circle at 0 100%, ${bottomLeft}, transparent 70%),
        radial-gradient(circle at 50% 50%, ${center}, transparent 60%)
      `;
      
      // Apply the background with a more fluid animation
      document.body.style.background = background;
      document.body.style.backgroundSize = '200% 200%';
      document.body.style.animation = 'gradient 12s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite alternate';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundBlendMode = 'overlay';
    }
  }, [currentPalette]);

  // Check computed style of palette circles
  useEffect(() => {
    if (favorites.length > 0 && showFavorites) {
      setTimeout(() => {
        // Check palette container spacing
        const paletteContainers = document.querySelectorAll('.space-y-4 > div');
        console.log('Number of palette containers:', paletteContainers.length);
        if (paletteContainers.length > 0) {
          const firstContainer = paletteContainers[0] as HTMLElement;
          console.log('Container classes:', firstContainer.className);
          console.log('Container computed style:', {
            padding: window.getComputedStyle(firstContainer).padding,
            marginBottom: window.getComputedStyle(firstContainer).marginBottom,
            paddingBottom: window.getComputedStyle(firstContainer).paddingBottom
          });
        }

        // Check circle spacing
        const circleContainers = document.querySelectorAll('.flex.gap-3');
        console.log('Number of circle containers:', circleContainers.length);
        if (circleContainers.length > 0) {
          const firstCircleContainer = circleContainers[0] as HTMLElement;
          console.log('Circle container computed gap:', window.getComputedStyle(firstCircleContainer).gap);
          
          const circles = firstCircleContainer.querySelectorAll('.palette-thumbnail');
          console.log('Number of circles in first container:', circles.length);
          if (circles.length >= 2) {
            const firstCircle = circles[0] as HTMLElement;
            const secondCircle = circles[1] as HTMLElement;
            console.log('Distance between circles:', {
              firstRect: firstCircle.getBoundingClientRect(),
              secondRect: secondCircle.getBoundingClientRect()
            });
          }
        }
      }, 500);
    }
  }, [favorites, showFavorites]);

  // Check if current palette is in favorites
  const isCurrentPaletteInFavorites = (): boolean => {
    // Convert current palette to a string for comparison
    const currentPaletteStr = JSON.stringify([...currentPalette].sort());
    
    return favorites.some(fav => {
      const favColorsStr = JSON.stringify([...fav.colors].sort());
      return favColorsStr === currentPaletteStr && 
             fav.style === currentStyle && 
             fav.harmony === currentHarmony;
    });
  }

  const generateNewPalette = () => {
    // Generate colors based on harmony, then apply style filter
    const newColors = generateHarmonyPalette(currentHarmony, 5)
    setCurrentPalette(applyStyleFilter(newColors, currentStyle))
  }

  const cycleStyle = () => {
    const styles: PaletteStyle[] = ['retro', 'modern', 'pastel', 'vibrant']
    const currentIndex = styles.indexOf(currentStyle)
    const nextIndex = (currentIndex + 1) % styles.length
    setCurrentStyle(styles[nextIndex])
    
    // Apply the new style to current colors
    setCurrentPalette(applyStyleFilter(currentPalette, styles[nextIndex]))
  }
  
  const cycleHarmony = () => {
    const harmonies: ColorHarmony[] = [
      'random',
      'monochromatic', 
      'complementary', 
      'analogous', 
      'triadic', 
      'split-complementary'
    ]
    const currentIndex = harmonies.indexOf(currentHarmony)
    const nextIndex = (currentIndex + 1) % harmonies.length
    setCurrentHarmony(harmonies[nextIndex])
    
    // Generate a new palette with the new harmony and current style
    const newColors = generateHarmonyPalette(harmonies[nextIndex], 5)
    setCurrentPalette(applyStyleFilter(newColors, currentStyle))
  }

  const savePalette = () => {
    const isPaletteInFavorites = isCurrentPaletteInFavorites();
    
    if (isPaletteInFavorites) {
      // Remove from favorites
      setIsRemovingFavorite(true);
      
      // Find and remove the palette
      setFavorites(favorites.filter(fav => {
        const favColorsStr = JSON.stringify([...fav.colors].sort());
        const currentPaletteStr = JSON.stringify([...currentPalette].sort());
        return !(favColorsStr === currentPaletteStr && 
                fav.style === currentStyle && 
                fav.harmony === currentHarmony);
      }));
      
      // Animation for removal
      setSaveButtonSelected(true);
      
      // Reset states
      setTimeout(() => {
        setSaveButtonSelected(false);
        setIsRemovingFavorite(false);
      }, 800);
    } else {
      // Add to favorites
      const newPalette: ColorPalette = {
        id: Date.now().toString(),
        colors: [...currentPalette],
        style: currentStyle,
        harmony: currentHarmony
      }
      setFavorites([...favorites, newPalette]);
      
      // Animation effects
      setSaveButtonSelected(true);
      setShowHearts(true);
      
      // Reset button state after animation
      setTimeout(() => {
        setSaveButtonSelected(false);
      }, 800);
      
      setTimeout(() => {
        setShowHearts(false);
      }, 1500);
    }
  }

  const copyHexToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
      .then(() => {
        setToast({
          id: Date.now().toString(),
          message: `Copied ${hex} to clipboard!`,
          type: 'success'
        })
      })
      .catch(err => {
        console.error('Failed to copy: ', err)
        setToast({
          id: Date.now().toString(),
          message: 'Failed to copy to clipboard',
          type: 'error'
        })
      })
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-white text-black">
      {/* Toast notification */}
      {toast && (
        <div className="toast-notification animate-fade-in">
          {toast.message}
        </div>
      )}
      
      {/* Favorites Toggle - Tab Style */}
      <button
        onClick={() => setShowFavorites(!showFavorites)}
        className="favorites-tab"
      >
        {showFavorites ? "Hide favorites" : "View favorites"}
      </button>
      
      <div className="container">
        <div style={{ paddingTop: "2rem", paddingBottom: showFavorites ? "2rem" : "4rem" }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            Color palette generator
          </h1>
          
          {/* Color Circles with Hex Codes Below */}
          <div className="color-circles-container">
            {currentPalette.map((color, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="rounded-full cursor-pointer mb-3"
                  style={{ backgroundColor: color }}
                  onClick={() => copyHexToClipboard(color)}
                />
                <div className="color-code">
                  {color}
                </div>
              </div>
            ))}
          </div>
          
          {/* Style & Harmony Indicators */}
          <div className="flex justify-center space-x-8 mb-12 text-center" style={{ paddingBottom: '20px' }}>
            <p className="text-neutral-700 style-harmony-label">
              Style: {currentStyle}
            </p>
            <p className="text-neutral-700 style-harmony-label harmony-info" 
               data-tooltip={getHarmonyDescription(currentHarmony)}>
              Harmony: {currentHarmony}
            </p>
          </div>
          
          {/* Control Buttons */}
          <div className="control-buttons-container">
            {/* Shuffle Button */}
            <button 
              onClick={generateNewPalette}
              className="control-btn"
              aria-label="Shuffle Colors"
            >
              🔀
            </button>
            
            {/* Cycle Style Button */}
            <button 
              onClick={cycleStyle}
              className="control-btn"
              aria-label="Change Style"
            >
              🌈
            </button>
            
            {/* Cycle Harmony Button */}
            <button 
              onClick={cycleHarmony}
              className="control-btn"
              aria-label="Change Harmony"
            >
              🎨
            </button>
            
            {/* Save Button */}
            <button 
              onClick={savePalette}
              className={`control-btn ${saveButtonSelected ? 'selected' : ''} ${isCurrentPaletteInFavorites() ? 'in-favorites' : ''}`}
              aria-label={isCurrentPaletteInFavorites() ? "Remove from Favorites" : "Save to Favorites"}
              style={{ position: 'relative' }}
            >
              ❤️
              {showHearts && !isRemovingFavorite && (
                <>
                  <span className="heart-animation" style={{ transform: 'rotate(-15deg)' }}>❤️</span>
                  <span className="heart-animation" style={{ transform: 'rotate(5deg)' }}>❤️</span>
                  <span className="heart-animation" style={{ transform: 'rotate(15deg)' }}>❤️</span>
                </>
              )}
              {isRemovingFavorite && (
                <span className="heart-animation removing">💔</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Favorites Panel */}
        {showFavorites && (
          <div className="w-full mt-4" style={{ maxWidth: '800px' }}>
            <hr style={{ width: '100%', margin: '0 auto 1rem auto', border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />
            <h2 className="text-xl font-semibold mb-4 text-center">Saved Palettes</h2>
            {favorites.length === 0 ? (
              <p className="text-center text-neutral-500">No saved palettes yet</p>
            ) : (
              <div className="space-y-4" style={{ maxHeight: '30vh', overflowY: 'auto' }}>
                {favorites.map((palette) => (
                  <div key={palette.id} className="saved-palette-item">
                    <div className="flex items-center justify-between mb-2" style={{ padding: '8px 0' }}>
                      <div className="palette-colors-container" style={{ margin: '0 10px' }}>
                        {palette.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="palette-thumbnail cursor-pointer"
                            style={{ 
                              backgroundColor: color,
                            }}
                            onClick={() => copyHexToClipboard(color)}
                          ></div>
                        ))}
                      </div>
                      <div className="flex flex-col items-start mx-4">
                        <span className="text-sm text-neutral-500">Style: {palette.style}</span>
                        <span className="text-sm text-neutral-500">Harmony: {palette.harmony || 'random'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setFavorites(favorites.filter(fav => fav.id !== palette.id))
                        }}
                        className="text-xs text-red-500 border border-red-300 rounded"
                        style={{ 
                          height: '24px', 
                          fontSize: '0.7rem',
                          padding: '0 8px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
