import React, { useRef, useState, useEffect, useCallback } from "react";
import { ncsToHex } from './colorCodes/ncsColors';
import { ralToHex } from './colorCodes/ralColors';

// Modern styled components
const styles = {
  // Design system colors
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#8b5cf6',
    secondaryDark: '#7c3aed',
    success: '#10b981',
    successDark: '#059669',
    danger: '#ef4444',
    dangerDark: '#dc2626',
    neutral: '#6b7280',
    neutralLight: '#f3f4f6',
    neutralDark: '#374151',
    white: '#ffffff',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Spacing system
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  // Component styles
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100vh',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gap: '16px',
  },
  
  sidebar: {
    width: '320px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px 12px 0 0',
  },
  
  sidebarTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  
  sidebarContent: {
    padding: '16px',
    flex: 1,
  },
  
  section: {
    marginBottom: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
  },
  
  sectionHeader: {
    padding: '12px 16px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151',
    transition: 'background-color 0.2s ease',
    userSelect: 'none',
  },
  
  sectionHeaderHover: {
    backgroundColor: '#f3f4f6',
  },
  
  sectionContent: {
    padding: '16px',
  },
  
  canvas: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  
  canvasHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  canvasContent: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    overflow: 'auto',
  },
  
  inputGroup: {
    marginBottom: '12px',
  },
  
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },
  
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  
  buttonPrimaryHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  
  buttonSecondary: {
    backgroundColor: '#8b5cf6',
    color: 'white',
  },
  
  buttonSecondaryHover: {
    backgroundColor: '#7c3aed',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  
  buttonSuccess: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  
  buttonSuccessHover: {
    backgroundColor: '#059669',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  
  buttonDanger: {
    backgroundColor: '#ef4444',
    color: 'white',
  },
  
  buttonDangerHover: {
    backgroundColor: '#dc2626',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
  
  colorPicker: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  colorPickerHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  
  colorPickerSelected: {
    border: '3px solid #3b82f6',
    boxShadow: '0 0 0 2px white, 0 0 0 4px #3b82f6',
  },
};

export default function MosaicDesigner() {
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const [mode, setMode] = useState("custom");

  // Parametry
  const [roomWidthCm, setRoomWidthCm] = useState(500);
  const [roomHeightCm, setRoomHeightCm] = useState(300);
  const [tileSizeCm, setTileSizeCm] = useState(5);
  const [tileCount, setTileCount] = useState(5);
  const [customPalette, setCustomPalette] = useState(
    Array(5).fill("#cccccc")
  );
  const [showGrid, setShowGrid] = useState(true);
  const [symmetryType, setSymmetryType] = useState('none');
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [groutWidth, setGroutWidth] = useState(0.1); // in cm
  const [groutColor, setGroutColor] = useState('#808080'); // gray default
  const [patternWidth, setPatternWidth] = useState(3);
  const [patternHeight, setPatternHeight] = useState(3);
  const [patternGrid, setPatternGrid] = useState([]);
  const [selectedPatternColor, setSelectedPatternColor] = useState(0);
  const [patternSymmetryType, setPatternSymmetryType] = useState('none');
  const [tempPalette, setTempPalette] = useState([]);
  const [selectedMainColor, setSelectedMainColor] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showColorCodeModal, setShowColorCodeModal] = useState(false);
  const [selectedTileForColorCode, setSelectedTileForColorCode] = useState(null);
  const [colorCodeInput, setColorCodeInput] = useState('');
  const [colorCodeType, setColorCodeType] = useState('NCS');
  const [isDragging, setIsDragging] = useState(false);
  const [isPatternDragging, setIsPatternDragging] = useState(false);
  const [previousMosaicPattern, setPreviousMosaicPattern] = useState(null);
  const [previousPatternGrid, setPreviousPatternGrid] = useState(null);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    canvas: true,
    palette: true,
    design: true,
    edit: false,
    actions: true,
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Debounce timer ref for auto-regeneration
  const regenerateTimerRef = useRef(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Track custom pattern template for extending canvas
  const patternTemplateRef = useRef(null);
  
  // Performance optimization refs
  const animationFrameRef = useRef(null);
  const cachedGridPathRef = useRef(null);
  const lastGridDimensionsRef = useRef({ cols: 0, rows: 0, tilePx: 0 });
  const mosaicDataRef = useRef(null);
  const hasGeneratedRef = useRef(false);

  // 1 cm ≈ 37.8 px (96 DPI)
  const CM_TO_PX = 37.7952755906;
  
  // Initialize pattern grid when dimensions change
  useEffect(() => {
    const newGrid = Array(patternHeight).fill(null).map(() => 
      Array(patternWidth).fill(0)
    );
    setPatternGrid(newGrid);
  }, [patternWidth, patternHeight]);
  
  // Initialize temp palette when modal opens
  useEffect(() => {
    if (showPatternModal) {
      setTempPalette([...customPalette]);
    }
  }, [showPatternModal, customPalette]);
  
  // Color code conversion functions - now using imported functions
  
  const convertColorCode = (code, type) => {
    if (type === 'NCS') {
      return ncsToHex(code);
    } else if (type === 'RAL') {
      // Add "RAL " prefix if not present
      const ralCode = code.toUpperCase().startsWith('RAL ') ? code : `RAL ${code}`;
      return ralToHex(ralCode);
    }
    return null;
  };
  
  const handleColorCodeSubmit = () => {
    const hexColor = convertColorCode(colorCodeInput, colorCodeType);
    if (hexColor && selectedTileForColorCode !== null) {
      if (showPatternModal) {
        // Update temp palette for pattern designer
        const newTempPalette = [...tempPalette];
        newTempPalette[selectedTileForColorCode] = hexColor;
        setTempPalette(newTempPalette);
      } else {
        // Update main palette
        const newPalette = [...customPalette];
        newPalette[selectedTileForColorCode] = hexColor;
        setCustomPalette(newPalette);
      }
      setShowColorCodeModal(false);
      setColorCodeInput('');
      setSelectedTileForColorCode(null);
    } else {
      alert(`Invalid ${colorCodeType} color code. Please check the code and try again.`);
    }
  };

  // Redraw function needs to be defined before useEffect
  const redrawExistingMosaic = useCallback(() => {
    if (!mosaicDataRef.current) return;
    
    const data = mosaicDataRef.current;
    drawMosaicFromData(data);
  }, [showGrid, groutWidth, groutColor]);
  
  // Only redraw the existing mosaic when display parameters change
  useEffect(() => {
    if (hasGeneratedRef.current && mosaicDataRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        redrawExistingMosaic();
      });
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showGrid, groutWidth, groutColor, redrawExistingMosaic]);
  
  // Create a memoized regeneration function that has access to current state
  const autoRegenerateMosaic = useCallback(() => {
    try {
      if (mode === "custom" && customPalette.length === tileCount) {
        if (hasGeneratedRef.current) {
          // Try to preserve the existing pattern with new dimensions
          const success = redrawExistingPattern();
          if (!success) {
            // If pattern can't be preserved, draw empty canvas
            drawEmptyCanvas();
            // Reset the generation flag since we cleared the mosaic
            hasGeneratedRef.current = false;
          }
        } else {
          // If no mosaic yet, just draw empty canvas with correct dimensions
          drawEmptyCanvas();
        }
      }
    } catch (error) {
      console.error("Error regenerating mosaic:", error);
      // On error, fallback to empty canvas
      drawEmptyCanvas();
      hasGeneratedRef.current = false;
    } finally {
      setIsRegenerating(false);
    }
  }, [mode, customPalette, tileCount, roomWidthCm, roomHeightCm, tileSizeCm, symmetryType, groutWidth, groutColor]);

  // Auto-regenerate canvas when dimensions change
  useEffect(() => {
    // Clear any existing timer
    if (regenerateTimerRef.current) {
      clearTimeout(regenerateTimerRef.current);
    }
    
    // Show regenerating indicator
    setIsRegenerating(true);
    
    // Set a new timer with debounce
    regenerateTimerRef.current = setTimeout(() => {
      autoRegenerateMosaic();
    }, 500); // 500ms debounce delay
    
    // Cleanup function
    return () => {
      if (regenerateTimerRef.current) {
        clearTimeout(regenerateTimerRef.current);
      }
      setIsRegenerating(false);
    };
  }, [roomWidthCm, roomHeightCm, tileSizeCm, autoRegenerateMosaic]);

  // Draw empty canvas on initial load
  useEffect(() => {
    if (mode === "custom" && !hasGeneratedRef.current && previewRef.current && customPalette.length === tileCount) {
      drawEmptyCanvas();
    }
  }, [mode, customPalette.length, tileCount]);


  function generateMosaicData() {
    const tilePx = tileSizeCm * CM_TO_PX;
    const widthPx = roomWidthCm * CM_TO_PX;
    const heightPx = roomHeightCm * CM_TO_PX;
    const cols = Math.floor(widthPx / tilePx);
    const rows = Math.floor(heightPx / tilePx);
    
    // Generate and store the mosaic pattern
    const pattern = [];
    for (let y = 0; y < rows; y++) {
      pattern[y] = [];
      for (let x = 0; x < cols; x++) {
        pattern[y][x] = -1; // Initialize with -1
      }
    }
    
    // Apply symmetry based on type
    if (symmetryType === 'horizontal') {
      // Fill left half randomly, mirror to right
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x <= Math.floor(cols / 2); x++) {
          const colorIndex = Math.floor(Math.random() * customPalette.length);
          pattern[y][x] = colorIndex;
          const mirrorX = cols - 1 - x;
          if (mirrorX !== x) {
            pattern[y][mirrorX] = colorIndex;
          }
        }
      }
    } else if (symmetryType === 'vertical') {
      // Fill top half randomly, mirror to bottom
      for (let y = 0; y <= Math.floor(rows / 2); y++) {
        for (let x = 0; x < cols; x++) {
          const colorIndex = Math.floor(Math.random() * customPalette.length);
          pattern[y][x] = colorIndex;
          const mirrorY = rows - 1 - y;
          if (mirrorY !== y) {
            pattern[mirrorY][x] = colorIndex;
          }
        }
      }
    } else if (symmetryType === 'central') {
      // Fill top-left quadrant randomly, mirror to all quadrants
      for (let y = 0; y <= Math.floor(rows / 2); y++) {
        for (let x = 0; x <= Math.floor(cols / 2); x++) {
          const colorIndex = Math.floor(Math.random() * customPalette.length);
          pattern[y][x] = colorIndex;
          const mirrorX = cols - 1 - x;
          const mirrorY = rows - 1 - y;
          if (mirrorX !== x) {
            pattern[y][mirrorX] = colorIndex;
          }
          if (mirrorY !== y) {
            pattern[mirrorY][x] = colorIndex;
          }
          if (mirrorX !== x && mirrorY !== y) {
            pattern[mirrorY][mirrorX] = colorIndex;
          }
        }
      }
    } else {
      // No symmetry - fully random
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          pattern[y][x] = Math.floor(Math.random() * customPalette.length);
        }
      }
    }
    
    // Store the generated data
    mosaicDataRef.current = {
      pattern,
      cols,
      rows,
      palette: [...customPalette],
      tileSizeCm,
      roomWidthCm,
      roomHeightCm
    };
    hasGeneratedRef.current = true;
    
    return mosaicDataRef.current;
  }
  
  function calculateScaleFactor(canvasWidth, canvasHeight) {
    if (!containerRef.current) return 1;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxWidth = containerRect.width - 32; // Account for padding
    const maxHeight = containerRect.height - 32; // Account for padding
    
    const scaleX = maxWidth / canvasWidth;
    const scaleY = maxHeight / canvasHeight;
    
    return Math.min(scaleX, scaleY, 1); // Never scale up, only down
  }
  
  function drawMosaicFromData(data) {
    const { pattern, cols, rows, palette } = data;
    const tilePx = data.tileSizeCm * CM_TO_PX;
    const groutPx = groutWidth * CM_TO_PX;
    
    // Draw to main canvas with grout
    const ctx = previewRef.current.getContext("2d", { alpha: false });
    const canvasWidth = cols * tilePx + (cols - 1) * groutPx;
    const canvasHeight = rows * tilePx + (rows - 1) * groutPx;
    
    if (previewRef.current.width !== canvasWidth || previewRef.current.height !== canvasHeight) {
      previewRef.current.width = canvasWidth;
      previewRef.current.height = canvasHeight;
    }
    
    // Fill background with grout color
    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw tiles with grout spacing
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const colorIndex = pattern[y][x];
        ctx.fillStyle = palette[colorIndex];
        
        const tileX = x * (tilePx + groutPx);
        const tileY = y * (tilePx + groutPx);
        
        ctx.fillRect(tileX, tileY, tilePx, tilePx);
      }
    }
    
      // Apply scaling to fit viewport
    const scale = calculateScaleFactor(canvasWidth, canvasHeight);
    if (scale < 1) {
      previewRef.current.style.transform = `scale(${scale})`;
      previewRef.current.style.transformOrigin = 'top left';
      // Adjust container dimensions to account for scaling
      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;
      previewRef.current.style.width = canvasWidth + 'px';
      previewRef.current.style.height = canvasHeight + 'px';
      if (previewRef.current.parentElement) {
        previewRef.current.parentElement.style.width = scaledWidth + 'px';
        previewRef.current.parentElement.style.height = scaledHeight + 'px';
      }
    } else {
      previewRef.current.style.transform = '';
      previewRef.current.style.width = '';
      previewRef.current.style.height = '';
      if (previewRef.current.parentElement) {
        previewRef.current.parentElement.style.width = '';
        previewRef.current.parentElement.style.height = '';
      }
    }
    
    // Draw grid if enabled - only when there's no grout (grout provides natural separation)
    if (showGrid && groutPx === 0) {
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      
      // Draw lines between tiles only when there's no grout
      // Vertical lines
      for (let x = 1; x < cols; x++) {
        const lineX = x * tilePx;
        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 1; y < rows; y++) {
        const lineY = y * tilePx;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(canvasWidth, lineY);
        ctx.stroke();
      }
    }
  }
  
  function drawEmptyCanvas() {
    if (!previewRef.current) return;
    
    const tilePx = tileSizeCm * CM_TO_PX;
    const groutPx = groutWidth * CM_TO_PX;
    const widthPx = roomWidthCm * CM_TO_PX;
    const heightPx = roomHeightCm * CM_TO_PX;
    const cols = Math.floor(widthPx / tilePx);
    const rows = Math.floor(heightPx / tilePx);
    
    const ctx = previewRef.current.getContext("2d", { alpha: false });
    const canvasWidth = cols * tilePx + (cols - 1) * groutPx;
    const canvasHeight = rows * tilePx + (rows - 1) * groutPx;
    
    // Set canvas dimensions
    if (previewRef.current.width !== canvasWidth || previewRef.current.height !== canvasHeight) {
      previewRef.current.width = canvasWidth;
      previewRef.current.height = canvasHeight;
    }
    
    // Fill with a light background to show canvas dimensions
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw tile grid outline to show what the mosaic will look like
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw tile boundaries with correct grout spacing
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const tileX = x * (tilePx + groutPx);
        const tileY = y * (tilePx + groutPx);
        ctx.strokeRect(tileX, tileY, tilePx, tilePx);
      }
    }
    
    // Apply scaling to fit viewport
    const scale = calculateScaleFactor(canvasWidth, canvasHeight);
    if (scale < 1) {
      previewRef.current.style.transform = `scale(${scale})`;
      previewRef.current.style.transformOrigin = 'top left';
      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;
      previewRef.current.style.width = canvasWidth + 'px';
      previewRef.current.style.height = canvasHeight + 'px';
      if (previewRef.current.parentElement) {
        previewRef.current.parentElement.style.width = scaledWidth + 'px';
        previewRef.current.parentElement.style.height = scaledHeight + 'px';
      }
    } else {
      previewRef.current.style.transform = '';
      previewRef.current.style.width = '';
      previewRef.current.style.height = '';
      if (previewRef.current.parentElement) {
        previewRef.current.parentElement.style.width = '';
        previewRef.current.parentElement.style.height = '';
      }
    }
  }

  function redrawExistingPattern() {
    if (!mosaicDataRef.current) return false;
    
    const currentData = mosaicDataRef.current;
    const tilePx = tileSizeCm * CM_TO_PX;
    const widthPx = roomWidthCm * CM_TO_PX;
    const heightPx = roomHeightCm * CM_TO_PX;
    const newCols = Math.floor(widthPx / tilePx);
    const newRows = Math.floor(heightPx / tilePx);
    
    const oldCols = currentData.cols;
    const oldRows = currentData.rows;
    const oldPattern = currentData.pattern;
    
    // Check if the existing pattern can fit in the new dimensions
    if (oldCols <= newCols && oldRows <= newRows) {
      // Pattern fits - create new pattern with existing tiles preserved
      const newPattern = [];
      for (let y = 0; y < newRows; y++) {
        newPattern[y] = [];
        for (let x = 0; x < newCols; x++) {
          if (y < oldRows && x < oldCols) {
            // Keep existing tile
            newPattern[y][x] = oldPattern[y][x];
          } else {
            // Fill new areas using the custom pattern if available
            if (patternTemplateRef.current) {
              const template = patternTemplateRef.current;
              const patternX = x % template.width;
              const patternY = y % template.height;
              newPattern[y][x] = template.grid[patternY][patternX];
            } else {
              // Fallback to random colors if no pattern template
              newPattern[y][x] = Math.floor(Math.random() * customPalette.length);
            }
          }
        }
      }
      
      // Update stored data with new dimensions but preserved pattern
      mosaicDataRef.current = {
        ...currentData,
        pattern: newPattern,
        cols: newCols,
        rows: newRows,
        tileSizeCm,
        roomWidthCm,
        roomHeightCm
      };
      
      drawMosaicFromData(mosaicDataRef.current);
      return true;
    } else {
      // Pattern doesn't fit - need to truncate or reset
      if (newCols > 0 && newRows > 0) {
        // Truncate existing pattern to fit new dimensions
        const newPattern = [];
        for (let y = 0; y < newRows; y++) {
          newPattern[y] = [];
          for (let x = 0; x < newCols; x++) {
            if (y < oldRows && x < oldCols) {
              // Keep existing tile if it fits
              newPattern[y][x] = oldPattern[y][x];
            } else {
              // Fill new areas using the custom pattern if available
              if (patternTemplateRef.current) {
                const template = patternTemplateRef.current;
                const patternX = x % template.width;
                const patternY = y % template.height;
                newPattern[y][x] = template.grid[patternY][patternX];
              } else {
                // Fallback to random colors if no pattern template
                newPattern[y][x] = Math.floor(Math.random() * customPalette.length);
              }
            }
          }
        }
        
        // Update stored data
        mosaicDataRef.current = {
          ...currentData,
          pattern: newPattern,
          cols: newCols,
          rows: newRows,
          tileSizeCm,
          roomWidthCm,
          roomHeightCm
        };
        
        drawMosaicFromData(mosaicDataRef.current);
        return true;
      } else {
        // Invalid dimensions
        return false;
      }
    }
  }

  function drawCustomMosaic() {
    // Clear pattern template since we're generating a new random mosaic
    patternTemplateRef.current = null;
    
    const data = generateMosaicData();
    drawMosaicFromData(data);
  }
  
  function applyPattern() {
    // Update the main palette with temp palette
    setCustomPalette([...tempPalette]);
    
    // Store the pattern template for later use when resizing
    patternTemplateRef.current = {
      grid: patternGrid.map(row => [...row]),
      width: patternWidth,
      height: patternHeight,
      palette: [...tempPalette]
    };
    
    const tilePx = tileSizeCm * CM_TO_PX;
    const widthPx = roomWidthCm * CM_TO_PX;
    const heightPx = roomHeightCm * CM_TO_PX;
    const cols = Math.floor(widthPx / tilePx);
    const rows = Math.floor(heightPx / tilePx);
    
    // Generate pattern data
    const pattern = [];
    for (let y = 0; y < rows; y++) {
      pattern[y] = [];
      for (let x = 0; x < cols; x++) {
        const patternX = x % patternWidth;
        const patternY = y % patternHeight;
        pattern[y][x] = patternGrid[patternY][patternX];
      }
    }
    
    // Store the generated data with the updated palette
    mosaicDataRef.current = {
      pattern,
      cols,
      rows,
      palette: [...tempPalette],
      tileSizeCm,
      roomWidthCm,
      roomHeightCm
    };
    hasGeneratedRef.current = true;
    
    drawMosaicFromData(mosaicDataRef.current);
    setShowPatternModal(false);
  }
  
  function colorPatternTile(row, col) {
    const newGrid = patternGrid.map(r => [...r]);
    newGrid[row][col] = selectedPatternColor;
    
    // Apply symmetry if enabled
    if (patternSymmetryType === 'horizontal') {
      const mirrorCol = patternWidth - 1 - col;
      newGrid[row][mirrorCol] = selectedPatternColor;
    } else if (patternSymmetryType === 'vertical') {
      const mirrorRow = patternHeight - 1 - row;
      newGrid[mirrorRow][col] = selectedPatternColor;
    } else if (patternSymmetryType === 'central') {
      const mirrorCol = patternWidth - 1 - col;
      const mirrorRow = patternHeight - 1 - row;
      newGrid[row][mirrorCol] = selectedPatternColor;
      newGrid[mirrorRow][col] = selectedPatternColor;
      newGrid[mirrorRow][mirrorCol] = selectedPatternColor;
    }
    
    setPatternGrid(newGrid);
  }

  function handlePatternTileClick(row, col) {
    colorPatternTile(row, col);
  }

  function handlePatternMouseDown(row, col) {
    // Save current state before making changes
    setPreviousPatternGrid(patternGrid.map(row => [...row]));
    
    setIsPatternDragging(true);
    colorPatternTile(row, col);
  }

  function handlePatternMouseEnter(row, col) {
    if (isPatternDragging) {
      colorPatternTile(row, col);
    }
  }

  function handlePatternMouseUp() {
    setIsPatternDragging(false);
  }

  function undoLastMosaicPaint() {
    if (previousMosaicPattern && mosaicDataRef.current) {
      mosaicDataRef.current = {
        ...mosaicDataRef.current,
        pattern: previousMosaicPattern
      };
      drawMosaicFromData(mosaicDataRef.current);
      setPreviousMosaicPattern(null); // Clear the undo state after using it
    }
  }

  function undoLastPatternPaint() {
    if (previousPatternGrid) {
      setPatternGrid(previousPatternGrid);
      setPreviousPatternGrid(null); // Clear the undo state after using it
    }
  }
  
  function colorTileAtPosition(x, y) {
    if (!isEditMode || !mosaicDataRef.current) return;
    
    const data = mosaicDataRef.current;
    const tilePx = data.tileSizeCm * CM_TO_PX;
    const groutPx = groutWidth * CM_TO_PX;
    
    // Calculate which tile was clicked with corrected positioning
    const tileCol = Math.floor(x / (tilePx + groutPx));
    const tileRow = Math.floor(y / (tilePx + groutPx));
    
    // Check if click is within valid tile bounds
    if (tileCol >= 0 && tileCol < data.cols && tileRow >= 0 && tileRow < data.rows) {
      // Check if click is actually on a tile (not on grout)
      const tileX = tileCol * (tilePx + groutPx);
      const tileY = tileRow * (tilePx + groutPx);
      
      if (x >= tileX && x <= tileX + tilePx && y >= tileY && y <= tileY + tilePx) {
        // Update the pattern with symmetry
        const newPattern = data.pattern.map(row => [...row]);
        newPattern[tileRow][tileCol] = selectedMainColor;
        
        // Apply symmetry if enabled
        if (symmetryType === 'horizontal') {
          const mirrorCol = data.cols - 1 - tileCol;
          newPattern[tileRow][mirrorCol] = selectedMainColor;
        } else if (symmetryType === 'vertical') {
          const mirrorRow = data.rows - 1 - tileRow;
          newPattern[mirrorRow][tileCol] = selectedMainColor;
        } else if (symmetryType === 'central') {
          const mirrorCol = data.cols - 1 - tileCol;
          const mirrorRow = data.rows - 1 - tileRow;
          newPattern[tileRow][mirrorCol] = selectedMainColor;
          newPattern[mirrorRow][tileCol] = selectedMainColor;
          newPattern[mirrorRow][mirrorCol] = selectedMainColor;
        }
        
        // Update stored data
        mosaicDataRef.current = {
          ...data,
          pattern: newPattern
        };
        
        // Redraw
        drawMosaicFromData(mosaicDataRef.current);
        return true; // Return true if a tile was colored
      }
    }
    return false;
  }

  function handleMainTileClick(event) {
    const canvas = previewRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = parseFloat(canvas.style.transform.match(/scale\(([^)]+)\)/)?.[1]) || 1;
    
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    
    colorTileAtPosition(x, y);
  }

  function handleMouseDown(event) {
    if (!isEditMode || !mosaicDataRef.current) return;
    
    // Save current state before making changes
    setPreviousMosaicPattern(mosaicDataRef.current.pattern.map(row => [...row]));
    
    const canvas = previewRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = parseFloat(canvas.style.transform.match(/scale\(([^)]+)\)/)?.[1]) || 1;
    
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    
    setIsDragging(true);
    colorTileAtPosition(x, y);
  }

  function handleMouseMove(event) {
    if (!isDragging || !isEditMode || !mosaicDataRef.current) return;
    
    const canvas = previewRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = parseFloat(canvas.style.transform.match(/scale\(([^)]+)\)/)?.[1]) || 1;
    
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    
    colorTileAtPosition(x, y);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }
  
  function generateSymmetricPattern() {
    const newGrid = Array(patternHeight).fill(null).map(() => 
      Array(patternWidth).fill(0)
    );
    
    // Generate random pattern based on symmetry type
    if (patternSymmetryType === 'horizontal') {
      // Fill left half randomly, mirror to right
      for (let y = 0; y < patternHeight; y++) {
        for (let x = 0; x <= Math.floor(patternWidth / 2); x++) {
          const colorIndex = Math.floor(Math.random() * tempPalette.length);
          newGrid[y][x] = colorIndex;
          const mirrorX = patternWidth - 1 - x;
          if (mirrorX !== x) {
            newGrid[y][mirrorX] = colorIndex;
          }
        }
      }
    } else if (patternSymmetryType === 'vertical') {
      // Fill top half randomly, mirror to bottom
      for (let y = 0; y <= Math.floor(patternHeight / 2); y++) {
        for (let x = 0; x < patternWidth; x++) {
          const colorIndex = Math.floor(Math.random() * tempPalette.length);
          newGrid[y][x] = colorIndex;
          const mirrorY = patternHeight - 1 - y;
          if (mirrorY !== y) {
            newGrid[mirrorY][x] = colorIndex;
          }
        }
      }
    } else if (patternSymmetryType === 'central') {
      // Fill top-left quadrant randomly, mirror to all quadrants
      for (let y = 0; y <= Math.floor(patternHeight / 2); y++) {
        for (let x = 0; x <= Math.floor(patternWidth / 2); x++) {
          const colorIndex = Math.floor(Math.random() * tempPalette.length);
          newGrid[y][x] = colorIndex;
          const mirrorX = patternWidth - 1 - x;
          const mirrorY = patternHeight - 1 - y;
          if (mirrorX !== x) {
            newGrid[y][mirrorX] = colorIndex;
          }
          if (mirrorY !== y) {
            newGrid[mirrorY][x] = colorIndex;
          }
          if (mirrorX !== x && mirrorY !== y) {
            newGrid[mirrorY][mirrorX] = colorIndex;
          }
        }
      }
    } else {
      // No symmetry - fully random
      for (let y = 0; y < patternHeight; y++) {
        for (let x = 0; x < patternWidth; x++) {
          newGrid[y][x] = Math.floor(Math.random() * tempPalette.length);
        }
      }
    }
    
    setPatternGrid(newGrid);
  }


  const newLayout = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (mode === "custom" && customPalette.length === tileCount) {
        drawCustomMosaic();
      }
    });
  }, [mode, customPalette, tileCount, tileSizeCm, roomWidthCm, roomHeightCm, symmetryType]);

  function exportPNG() {
    const url = previewRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "mosaic.png";
    a.click();
  }

  return (
    <div style={styles.container}>
      {/* Modern Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.sidebarTitle}>
            🎨 Mosaic Designer
          </h1>
        </div>
        
        <div style={styles.sidebarContent}>
          {mode === "custom" && (
            <>
              {/* Canvas Settings Section */}
              <div style={styles.section}>
                <div 
                  style={styles.sectionHeader}
                  onClick={() => toggleSection('canvas')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.sectionHeaderHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span>📐 Canvas Settings</span>
                  <span>{expandedSections.canvas ? '▼' : '▶'}</span>
                </div>
                {expandedSections.canvas && (
                  <div style={styles.sectionContent}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Room Width (cm)</label>
                      <input
                        type="number"
                        value={roomWidthCm}
                        onChange={(e) => setRoomWidthCm(Number(e.target.value))}
                        min={1}
                        style={styles.input}
                        onFocus={(e) => {
                          e.target.style.borderColor = styles.inputFocus.borderColor;
                          e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Room Height (cm)</label>
                      <input
                        type="number"
                        value={roomHeightCm}
                        onChange={(e) => setRoomHeightCm(Number(e.target.value))}
                        min={1}
                        style={styles.input}
                        onFocus={(e) => {
                          e.target.style.borderColor = styles.inputFocus.borderColor;
                          e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Tile Size (cm)</label>
                      <input
                        type="number"
                        value={tileSizeCm}
                        onChange={(e) => setTileSizeCm(Number(e.target.value))}
                        min={1}
                        style={styles.input}
                        onFocus={(e) => {
                          e.target.style.borderColor = styles.inputFocus.borderColor;
                          e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Color Palette Section */}
              <div style={styles.section}>
                <div 
                  style={styles.sectionHeader}
                  onClick={() => toggleSection('palette')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.sectionHeaderHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span>🎨 Color Palette</span>
                  <span>{expandedSections.palette ? '▼' : '▶'}</span>
                </div>
                {expandedSections.palette && (
                  <div style={styles.sectionContent}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Number of Colors</label>
                      <input
                        type="number"
                        value={tileCount}
                        min={1}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          setTileCount(count);
                          setCustomPalette(Array(count).fill("#cccccc"));
                        }}
                        style={styles.input}
                        onFocus={(e) => {
                          e.target.style.borderColor = styles.inputFocus.borderColor;
                          e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div style={{ marginTop: '12px' }}>
                      <label style={styles.label}>Color Selection</label>
                      {Array.from({ length: tileCount }, (_, i) => (
                        <div key={i} style={{ 
                          marginTop: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          padding: '8px',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '50px' }}>
                            Color {i + 1}
                          </span>
                          <input
                            type="color"
                            value={customPalette[i] || "#cccccc"}
                            onChange={(e) => {
                              const newPalette = [...customPalette];
                              newPalette[i] = e.target.value;
                              setCustomPalette(newPalette);
                            }}
                            style={{
                              width: '40px',
                              height: '32px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                              cursor: 'pointer'
                            }}
                          />
                          <button
                            onClick={() => {
                              setSelectedTileForColorCode(i);
                              setShowColorCodeModal(true);
                            }}
                            style={{
                              ...styles.button,
                              padding: '4px 10px',
                              backgroundColor: styles.colors.neutralDark,
                              color: 'white',
                              fontSize: '12px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#1f2937';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = styles.colors.neutralDark;
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            NCS/RAL
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Design Options Section */}
              <div style={styles.section}>
                <div 
                  style={styles.sectionHeader}
                  onClick={() => toggleSection('design')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.sectionHeaderHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span>⚙️ Design Options</span>
                  <span>{expandedSections.design ? '▼' : '▶'}</span>
                </div>
                {expandedSections.design && (
                  <div style={styles.sectionContent}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Grout Width (cm)</label>
                      <input
                        type="number"
                        value={groutWidth}
                        onChange={(e) => setGroutWidth(Math.max(0, Number(e.target.value)))}
                        min={0}
                        max={2}
                        step={0.05}
                        style={styles.input}
                        onFocus={(e) => {
                          e.target.style.borderColor = styles.inputFocus.borderColor;
                          e.target.style.boxShadow = styles.inputFocus.boxShadow;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Grout Color</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={groutColor}
                          onChange={(e) => setGroutColor(e.target.value)}
                          style={{
                            width: '60px',
                            height: '36px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{groutColor}</span>
                      </div>
                    </div>
                    
                    <div style={{ ...styles.inputGroup, marginTop: '16px' }}>
                      <label style={{ ...styles.label, marginBottom: '8px' }}>Symmetry Type</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                          { value: 'none', label: '◻ None', desc: 'Random placement' },
                          { value: 'horizontal', label: '↔️ Horizontal', desc: 'Mirror left-right' },
                          { value: 'vertical', label: '↕️ Vertical', desc: 'Mirror top-bottom' },
                          { value: 'central', label: '✦ Central', desc: '4-way symmetry' }
                        ].map(option => (
                          <label key={option.value} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: symmetryType === option.value ? '#eff6ff' : 'white',
                            border: `1px solid ${symmetryType === option.value ? '#3b82f6' : '#e5e7eb'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}>
                            <input
                              type="radio"
                              value={option.value}
                              checked={symmetryType === option.value}
                              onChange={(e) => setSymmetryType(e.target.value)}
                              style={{ marginRight: '8px' }}
                            />
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500' }}>{option.label}</div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        <input
                          type="checkbox"
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                          style={{ marginRight: '8px' }}
                        />
                        Show Grid Lines
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Tools Section */}
              <div style={styles.section}>
                <div 
                  style={styles.sectionHeader}
                  onClick={() => toggleSection('edit')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.sectionHeaderHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span>🖌️ Edit Tools</span>
                  <span>{expandedSections.edit ? '▼' : '▶'}</span>
                </div>
                {expandedSections.edit && (
                  <div style={styles.sectionContent}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: isEditMode ? '#eff6ff' : '#f9fafb',
                      border: `2px solid ${isEditMode ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '12px'
                    }}>
                      <input
                        type="checkbox"
                        checked={isEditMode}
                        onChange={(e) => setIsEditMode(e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          Edit Mode {isEditMode && '✓'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Click and drag to paint tiles
                        </div>
                      </div>
                    </label>
                    
                    {isEditMode && (
                      <>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={styles.label}>Select Paint Color</label>
                          <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            flexWrap: 'wrap',
                            padding: '12px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            {customPalette.map((color, index) => (
                              <div
                                key={index}
                                onClick={() => setSelectedMainColor(index)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = selectedMainColor === index ? '0 0 0 2px white, 0 0 0 4px #3b82f6' : 'none';
                                }}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  backgroundColor: color,
                                  border: selectedMainColor === index ? '3px solid #3b82f6' : '2px solid #e5e7eb',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: selectedMainColor === index ? '0 0 0 2px white, 0 0 0 4px #3b82f6' : 'none'
                                }}
                                title={`Color ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div style={{
                          padding: '8px 12px',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fbbf24',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#92400e',
                          marginBottom: '12px'
                        }}>
                          💡 Symmetry mode: <strong>{symmetryType}</strong>
                        </div>
                        
                        {previousMosaicPattern && (
                          <button
                            onClick={undoLastMosaicPaint}
                            style={{
                              ...styles.button,
                              ...styles.buttonDanger,
                              width: '100%',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              Object.assign(e.currentTarget.style, styles.buttonDangerHover);
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(e.currentTarget.style, styles.buttonDanger);
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            ↩️ Undo Last Paint
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div style={styles.section}>
                <div 
                  style={styles.sectionHeader}
                  onClick={() => toggleSection('actions')}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.sectionHeaderHover.backgroundColor}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span>💾 Actions</span>
                  <span>{expandedSections.actions ? '▼' : '▶'}</span>
                </div>
                {expandedSections.actions && (
                  <div style={styles.sectionContent}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={newLayout}
                        style={{
                          ...styles.button,
                          ...styles.buttonSuccess,
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          Object.assign(e.currentTarget.style, styles.buttonSuccessHover);
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.currentTarget.style, styles.buttonSuccess);
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        🎲 Generate New Layout
                      </button>
                      
                      <button
                        onClick={() => setShowPatternModal(true)}
                        style={{
                          ...styles.button,
                          ...styles.buttonSecondary,
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          Object.assign(e.currentTarget.style, styles.buttonSecondaryHover);
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.currentTarget.style, styles.buttonSecondary);
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        🎨 Design Custom Pattern
                      </button>
                      
                      <button
                        onClick={exportPNG}
                        style={{
                          ...styles.button,
                          ...styles.buttonPrimary,
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          Object.assign(e.currentTarget.style, styles.buttonPrimaryHover);
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.currentTarget.style, styles.buttonPrimary);
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        📥 Export as PNG
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div style={styles.canvas}>
        <div style={styles.canvasHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Preview</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
              {roomWidthCm}cm × {roomHeightCm}cm • {tileSizeCm}cm tiles
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isRegenerating && (
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                ⏳ Updating...
              </span>
            )}
            {isEditMode && (
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                🖌️ Edit Mode Active
              </span>
            )}
          </div>
        </div>
        <div ref={containerRef} style={styles.canvasContent}>
          <div style={{ display: 'inline-block' }}>
            <canvas 
              ref={previewRef} 
              style={{ 
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                display: 'block',
                cursor: isEditMode ? 'crosshair' : 'default',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }} 
              onClick={handleMainTileClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      </div>
      
      {/* Color Code Input Modal */}
      {showColorCodeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>Enter Color Code</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px' }}>Color System:</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label>
                  <input
                    type="radio"
                    value="NCS"
                    checked={colorCodeType === 'NCS'}
                    onChange={(e) => setColorCodeType(e.target.value)}
                  /> NCS
                </label>
                <label>
                  <input
                    type="radio"
                    value="RAL"
                    checked={colorCodeType === 'RAL'}
                    onChange={(e) => setColorCodeType(e.target.value)}
                  /> RAL
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label>
                {colorCodeType} Color Code:
                <input
                  type="text"
                  value={colorCodeInput}
                  onChange={(e) => setColorCodeInput(e.target.value)}
                  placeholder={colorCodeType === 'NCS' ? 'e.g., S 2010-B' : 'e.g., 5015'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </label>
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
              {colorCodeType === 'NCS' ? (
                <div>
                  <strong>NCS Examples:</strong><br/>
                  S 0300-N (Light Gray), S 2010-B (Blue), S 3010-G (Green), S 4020-Y10R (Brown)
                </div>
              ) : (
                <div>
                  <strong>RAL Examples:</strong><br/>
                  5015 (Sky Blue), 6018 (Yellow Green), 3020 (Traffic Red), 9010 (Pure White)
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowColorCodeModal(false);
                  setColorCodeInput('');
                  setSelectedTileForColorCode(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleColorCodeSubmit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Pattern Designer Modal */}
      {showPatternModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>Design Pattern</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label>
                Pattern Width (tiles): 
                <input
                  type="number"
                  value={patternWidth}
                  onChange={(e) => setPatternWidth(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={20}
                  style={{ marginLeft: '8px', width: '60px' }}
                />
              </label>
              <label style={{ marginLeft: '16px' }}>
                Pattern Height (tiles): 
                <input
                  type="number"
                  value={patternHeight}
                  onChange={(e) => setPatternHeight(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={20}
                  style={{ marginLeft: '8px', width: '60px' }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div>Symmetry Type:</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', marginBottom: '16px' }}>
                <label>
                  <input
                    type="radio"
                    value="none"
                    checked={patternSymmetryType === 'none'}
                    onChange={(e) => setPatternSymmetryType(e.target.value)}
                  /> None
                </label>
                <label>
                  <input
                    type="radio"
                    value="horizontal"
                    checked={patternSymmetryType === 'horizontal'}
                    onChange={(e) => setPatternSymmetryType(e.target.value)}
                  /> Horizontal
                </label>
                <label>
                  <input
                    type="radio"
                    value="vertical"
                    checked={patternSymmetryType === 'vertical'}
                    onChange={(e) => setPatternSymmetryType(e.target.value)}
                  /> Vertical
                </label>
                <label>
                  <input
                    type="radio"
                    value="central"
                    checked={patternSymmetryType === 'central'}
                    onChange={(e) => setPatternSymmetryType(e.target.value)}
                  /> Central (4-way)
                </label>
              </div>
              <button
                onClick={generateSymmetricPattern}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Generate Symmetric Pattern
              </button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div>Tile Colors (click to select for painting, edit to change):</div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                {tempPalette.map((color, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div
                      onClick={() => setSelectedPatternColor(index)}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: color,
                        border: selectedPatternColor === index ? '3px solid #000' : '1px solid #ccc',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      title={`Click to select Tile ${index + 1}`}
                    />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newPalette = [...tempPalette];
                        newPalette[index] = e.target.value;
                        setTempPalette(newPalette);
                      }}
                      style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                      title={`Edit color for Tile ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        setSelectedTileForColorCode(index);
                        setShowColorCodeModal(true);
                      }}
                      style={{
                        padding: '4px 6px',
                        backgroundColor: '#374151',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '10px',
                        marginLeft: '4px'
                      }}
                    >
                      NCS/RAL
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Click tiles to color them:</span>
                {previousPatternGrid && (
                  <button
                    onClick={undoLastPatternPaint}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Undo Last Paint
                  </button>
                )}
              </div>
              <div 
                style={{
                  display: 'inline-block',
                  border: '2px solid #333',
                  marginTop: '8px'
                }}
                onMouseLeave={handlePatternMouseUp}
              >
                {patternGrid.map((row, rowIndex) => (
                  <div key={rowIndex} style={{ display: 'flex' }}>
                    {row.map((colorIndex, colIndex) => (
                      <div
                        key={colIndex}
                        onClick={() => handlePatternTileClick(rowIndex, colIndex)}
                        onMouseDown={() => handlePatternMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handlePatternMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handlePatternMouseUp}
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: tempPalette[colorIndex] || '#cccccc',
                          border: '1px solid #666',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPatternModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={applyPattern}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Apply Pattern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

