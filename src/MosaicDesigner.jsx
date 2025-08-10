import React, { useRef, useState, useEffect, useCallback } from "react";

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
        const lineX = x * (tilePx + groutPx) + groutPx / 2;
        ctx.beginPath();
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, canvasHeight);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y <= rows; y++) {
        const lineY = y * (tilePx + groutPx) + groutPx / 2;
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
  
  function handlePatternTileClick(row, col) {
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
                <div key={i} style={{ marginTop: '8px' }}>
                  Tile {i + 1} color:{" "}
                  <input
                    type="color"
                    value={customPalette[i] || "#cccccc"}
                    onChange={(e) => {
                      const newPalette = [...customPalette];
                      newPalette[i] = e.target.value;
                      setCustomPalette(newPalette);
                    }}
                  />
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

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
          </>
        )}
      </div>

      {/* Podgląd po prawej - 80% */}
      <div ref={containerRef} style={{ width: '80%', backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
        <div style={{ display: 'inline-block' }}>
          <canvas ref={previewRef} style={{ border: '1px solid #ccc', display: 'block' }} />
        </div>
      </div>
      
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
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div>Click tiles to color them:</div>
              <div style={{
                display: 'inline-block',
                border: '2px solid #333',
                marginTop: '8px'
              }}>
                {patternGrid.map((row, rowIndex) => (
                  <div key={rowIndex} style={{ display: 'flex' }}>
                    {row.map((colorIndex, colIndex) => (
                      <div
                        key={colIndex}
                        onClick={() => handlePatternTileClick(rowIndex, colIndex)}
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

