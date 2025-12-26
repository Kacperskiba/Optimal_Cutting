import { useRef, useEffect } from 'react';

export function CuttingVisualizer({ result, config }) {
  const canvasRef = useRef(null);

  // Stałe do obliczeń wizualnych
  const padding = 40;
  const canvasWidth = 1000;

  // Obliczanie skali
  const availableWidth = canvasWidth - (2 * padding);
  const scale = availableWidth / config.plateLength;

  const plateVisualHeight = config.plateWidth * scale;
  const plateVisualWidth = config.plateLength * scale;

  const gapBetweenPlates = 60;
  const headerHeight = 40;
  const footerHeight = 40;
  const onePlateSectionHeight = headerHeight + plateVisualHeight + footerHeight + gapBetweenPlates;
  const totalCanvasHeight = (result.plates.length * onePlateSectionHeight) + 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Czyścimy canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colors = [
      '#60a5fa', '#34d399', '#fbbf24', '#a78bfa',
      '#f472b6', '#22d3ee', '#f87171', '#2dd4bf',
    ];

    result.plates.forEach((plate, plateIndex) => {
      const startY = padding + (plateIndex * onePlateSectionHeight);

      // --- TŁUMACZENIE 1: Nagłówek płyty ---
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Płyta nr ${plate.plateNumber}`, padding, startY + 15);

      // Rysowanie płyty matki
      const boardY = startY + headerHeight;
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(padding, boardY, plateVisualWidth, plateVisualHeight);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, boardY, plateVisualWidth, plateVisualHeight);

      // Wymiary zewnętrzne
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${config.plateLength}mm`, padding + plateVisualWidth/2, boardY - 8);

      ctx.save();
      ctx.translate(padding - 10, boardY + plateVisualHeight/2);
      ctx.rotate(-Math.PI/2);
      ctx.fillText(`${config.plateWidth}mm`, 0, 0);
      ctx.restore();

      // Rysowanie elementów (Formatek)
      plate.cuts.forEach((cut) => {
        const x = padding + (cut.x * scale);
        const y = boardY + (cut.y * scale);
        const w = cut.length * scale;
        const h = cut.width * scale;

        const colorIndex = parseInt(cut.pieceId.split('-')[0]) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Napisy na elemencie
        if (w > 40 && h > 20) {
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const centerX = x + w / 2;
          const centerY = y + h / 2;

          ctx.fillText(`${cut.length}x${cut.width}`, centerX, centerY - 5);

          let subText = cut.pieceId.split('-')[0];
          if (cut.rotated) subText += ' ↻';

          ctx.font = '10px sans-serif';
          ctx.fillText(subText, centerX, centerY + 8);
        }
      });

      // --- TŁUMACZENIE 2: Statystyki ---
      const statsY = boardY + plateVisualHeight + 25;
      const efficiency = (plate.usedArea / plate.totalArea) * 100;

      ctx.fillStyle = '#4b5563';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(
        `Wydajność: ${efficiency.toFixed(1)}%  |  Odpady: ${(plate.totalArea - plate.usedArea).toFixed(0)} mm²`,
        padding,
        statsY
      );
    });

    // --- TŁUMACZENIE 3: Legenda ---
    const legendY = (result.plates.length * onePlateSectionHeight) + 40;
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Legenda:  ↻ = Element obrócony', padding, legendY);

  }, [result, config, scale, onePlateSectionHeight, plateVisualWidth, plateVisualHeight]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900 font-medium">Schemat Rozkroju (2D)</h2>
        <span className="text-sm text-gray-500">Skala: {(scale * 100).toFixed(1)}%</span>
      </div>

      <div className="overflow-x-auto flex justify-center bg-gray-50 border border-gray-200 rounded p-4">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={totalCanvasHeight}
          className="bg-white shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}