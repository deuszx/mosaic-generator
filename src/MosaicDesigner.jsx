import React, { useRef, useState, useEffect, useCallback } from "react";
import { ncsToHex } from './colorCodes/ncsColors';
import { ralToHex } from './colorCodes/ralColors';

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
      return ralToHex(code);
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
    const canvasWidth = cols * tilePx + (cols + 1) * groutPx;
    const canvasHeight = rows * tilePx + (rows + 1) * groutPx;
    
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
        
        const tileX = x * (tilePx + groutPx) + groutPx;
        const tileY = y * (tilePx + groutPx) + groutPx;
        
        ctx.fillRect(tileX, tileY, tilePx, tilePx);
        
        // Add subtle border in edit mode for better tile visibility
        if (isEditMode) {
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tileX, tileY, tilePx, tilePx);
        }
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
    
    // Draw grid if enabled (adjusted for grout)
    if (showGrid) {
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x <= cols; x++) {
        const lineX = x * tilePx + (x + 1) * groutPx - groutPx / 2;
        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= rows; y++) {
        const lineY = y * tilePx + (y + 1) * groutPx - groutPx / 2;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(canvasWidth, lineY);
        ctx.stroke();
      }
    }
  }
  
  function drawCustomMosaic() {
    const data = generateMosaicData();
    drawMosaicFromData(data);
  }
  
  function applyPattern() {
    // Update the main palette with temp palette
    setCustomPalette([...tempPalette]);
    
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
    
    // Calculate which tile was clicked
    const tileCol = Math.floor((x - groutPx) / (tilePx + groutPx));
    const tileRow = Math.floor((y - groutPx) / (tilePx + groutPx));
    
    // Check if click is within valid tile bounds
    if (tileCol >= 0 && tileCol < data.cols && tileRow >= 0 && tileRow < data.rows) {
      // Check if click is actually on a tile (not on grout)
      const tileX = tileCol * (tilePx + groutPx) + groutPx;
      const tileY = tileRow * (tilePx + groutPx) + groutPx;
      
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
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100vh', padding: '16px', backgroundColor: '#f3f4f6' }}>
      {/* Panel menu po lewej - 20% */}
      <div style={{ width: '20%', backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto', marginRight: '16px' }}>
        <div>
          <label>
            <input
              type="radio"
              value="custom"
              checked={mode === "custom"}
              onChange={() => setMode("custom")}
            />{" "}
            Custom Mosaic
          </label>
        </div>

        {mode === "custom" && (
          <>
            <div style={{ marginTop: '12px' }}>
              Room width (cm):{" "}
              <input
                type="number"
                value={roomWidthCm}
                onChange={(e) => setRoomWidthCm(Number(e.target.value))}
                min={1}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              Room height (cm):{" "}
              <input
                type="number"
                value={roomHeightCm}
                onChange={(e) => setRoomHeightCm(Number(e.target.value))}
                min={1}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              Tile size (cm):{" "}
              <input
                type="number"
                value={tileSizeCm}
                onChange={(e) => setTileSizeCm(Number(e.target.value))}
                min={1}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              Number of tile types:{" "}
              <input
                type="number"
                value={tileCount}
                min={1}
                onChange={(e) => {
                  const count = Number(e.target.value);
                  setTileCount(count);
                  setCustomPalette(Array(count).fill("#cccccc"));
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              {Array.from({ length: tileCount }, (_, i) => (
                <div key={i} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Tile {i + 1}:</span>
                  <input
                    type="color"
                    value={customPalette[i] || "#cccccc"}
                    onChange={(e) => {
                      const newPalette = [...customPalette];
                      newPalette[i] = e.target.value;
                      setCustomPalette(newPalette);
                    }}
                    style={{ width: '40px', height: '30px' }}
                  />
                  <button
                    onClick={() => {
                      setSelectedTileForColorCode(i);
                      setShowColorCodeModal(true);
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#374151',
                      color: 'white',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    NCS/RAL
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px' }}>
              Grout width (cm):{" "}
              <input
                type="number"
                value={groutWidth}
                onChange={(e) => setGroutWidth(Math.max(0, Number(e.target.value)))}
                min={0}
                max={2}
                step={0.05}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              Grout color:{" "}
              <input
                type="color"
                value={groutColor}
                onChange={(e) => setGroutColor(e.target.value)}
                style={{ marginLeft: '8px' }}
              />
            </div>
            <div style={{ marginTop: '12px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />{" "}
                Show grid
              </label>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div>Symmetry Type:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                <label>
                  <input
                    type="radio"
                    value="none"
                    checked={symmetryType === 'none'}
                    onChange={(e) => setSymmetryType(e.target.value)}
                  /> None
                </label>
                <label>
                  <input
                    type="radio"
                    value="horizontal"
                    checked={symmetryType === 'horizontal'}
                    onChange={(e) => setSymmetryType(e.target.value)}
                  /> Horizontal
                </label>
                <label>
                  <input
                    type="radio"
                    value="vertical"
                    checked={symmetryType === 'vertical'}
                    onChange={(e) => setSymmetryType(e.target.value)}
                  /> Vertical
                </label>
                <label>
                  <input
                    type="radio"
                    value="central"
                    checked={symmetryType === 'central'}
                    onChange={(e) => setSymmetryType(e.target.value)}
                  /> Central (4-way)
                </label>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={isEditMode}
                    onChange={(e) => setIsEditMode(e.target.checked)}
                  />{" "}
                  Edit Mode (click tiles to color)
                </label>
              </div>
              
              {isEditMode && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px' }}>Select color for painting:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {customPalette.map((color, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedMainColor(index)}
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: color,
                          border: selectedMainColor === index ? '3px solid #000' : '1px solid #ccc',
                          cursor: 'pointer',
                          borderRadius: '4px'
                        }}
                        title={`Tile ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Symmetry ({symmetryType}) will be applied when coloring tiles
                  </div>
                  {previousMosaicPattern && (
                    <button
                      onClick={undoLastMosaicPaint}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '8px',
                        fontSize: '12px'
                      }}
                    >
                      Undo Last Paint
                    </button>
                  )}
                </div>
              )}
              
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={newLayout}
                  style={{ padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                >
                  New Layout
                </button>
                <button
                  onClick={() => setShowPatternModal(true)}
                  style={{ padding: '8px 12px', backgroundColor: '#9333ea', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                >
                  Design Pattern
                </button>
                <button
                  onClick={exportPNG}
                  style={{ padding: '8px 12px', backgroundColor: '#2563eb', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                >
                  Export PNG
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Podgląd po prawej - 80% */}
      <div ref={containerRef} style={{ width: '80%', backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <div style={{ display: 'inline-block' }}>
          <canvas 
            ref={previewRef} 
            style={{ 
              border: '1px solid #ccc', 
              display: 'block',
              cursor: isEditMode ? 'crosshair' : 'default'
            }} 
            onClick={handleMainTileClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
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
                  placeholder={colorCodeType === 'NCS' ? 'e.g., S 2010-B' : 'e.g., RAL 5015'}
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
                  RAL 5015 (Sky Blue), RAL 6018 (Yellow Green), RAL 3020 (Traffic Red), RAL 9010 (Pure White)
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

