import { useRef, useEffect } from 'react';

export function CuttingVisualizer({ result, config }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Drawing settings
    const padding = 60;
    const maxPlateWidth = canvas.width - 2 * padding;
    const maxPlateHeight = 300;
    
    // Calculate scale to fit plate dimensions
    const scaleX = maxPlateWidth / config.plateLength;
    const scaleY = maxPlateHeight / config.plateWidth;
    const scale = Math.min(scaleX, scaleY);

    const plateVisualWidth = config.plateLength * scale;
    const plateVisualHeight = config.plateWidth * scale;
    const plateSpacing = plateVisualHeight + 80;

    // Colors
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#ef4444', // red
      '#14b8a6', // teal
    ];

    result.plates.forEach((plate, plateIndex) => {
      const plateY = padding + plateIndex * plateSpacing;

      // Draw plate background
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(padding, plateY, plateVisualWidth, plateVisualHeight);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, plateY, plateVisualWidth, plateVisualHeight);

      // Draw plate label
      ctx.fillStyle = '#374151';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Plate ${plate.plateNumber}`, padding - 10, plateY + 20);

      // Draw dimensions
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      // Length dimension
      ctx.fillText(
        `${config.plateLength}mm`,
        padding + plateVisualWidth / 2,
        plateY + plateVisualHeight + 15
      );
      // Width dimension
      ctx.save();
      ctx.translate(padding - 30, plateY + plateVisualHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${config.plateWidth}mm`, 0, 0);
      ctx.restore();

      // Draw cut pieces
      plate.cuts.forEach((cut, cutIndex) => {
        const x = padding + cut.x * scale;
        const y = plateY + cut.y * scale;
        const width = cut.length * scale;
        const height = cut.width * scale;

        // Draw piece with color
        const colorIndex = parseInt(cut.pieceId.split('-')[0]) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, width, height);

        // Draw piece outline
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw dimensions on piece
        if (width > 50 && height > 30) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${cut.length} × ${cut.width}`,
            x + width / 2,
            y + height / 2
          );

          // Show rotation indicator if rotated
          if (cut.rotated) {
            ctx.font = '10px sans-serif';
            ctx.fillText('↻', x + width / 2, y + height / 2 + 15);
          }
        }

        // Draw saw kerf indicators (spacing between pieces)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        
        // Show kerf margin around piece
        const kerfMargin = config.sawWidth * scale;
        if (kerfMargin > 1) {
          ctx.strokeRect(
            x - kerfMargin,
            y - kerfMargin,
            width + 2 * kerfMargin,
            height + 2 * kerfMargin
          );
        }
        ctx.setLineDash([]);
      });

      // Draw efficiency info
      const efficiency = (plate.usedArea / plate.totalArea) * 100;
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Efficiency: ${efficiency.toFixed(1)}% | Waste: ${(plate.totalArea - plate.usedArea).toFixed(0)} mm²`,
        padding,
        plateY + plateVisualHeight + 35
      );
    });

    // Draw legend
    const legendY = padding + result.plates.length * plateSpacing + 20;
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', padding, legendY);

    // Cut piece example
    ctx.fillStyle = colors[0];
    ctx.fillRect(padding + 60, legendY - 12, 40, 20);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding + 60, legendY - 12, 40, 20);
    ctx.fillStyle = '#374151';
    ctx.fillText('Cut piece', padding + 110, legendY + 3);

    // Kerf margin example
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(padding + 220, legendY - 15, 46, 26);
    ctx.setLineDash([]);
    ctx.fillStyle = '#374151';
    ctx.fillText('Saw kerf margin', padding + 275, legendY + 3);

  }, [result, config]);

  // Calculate canvas height based on number of plates
  const maxPlateHeight = 300;
  const plateSpacing = maxPlateHeight + 80;
  const canvasHeight = 120 + result.plates.length * plateSpacing + 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-gray-900 font-medium mb-4">Cutting Layout</h2>
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          width={1000}
          height={canvasHeight}
          className="border border-gray-200 rounded"
        />
      </div>
    </div>
  );
}