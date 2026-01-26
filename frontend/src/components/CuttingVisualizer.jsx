import { useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

function CuttingVisualizer({ result, config }) {
  const canvasRef = useRef(null);

  const padding = 40;
  const canvasWidth = 1000;
  const availableWidth = canvasWidth - (2 * padding);

  const scale = availableWidth / config.plateLength;

  const plateVisualHeight = config.plateWidth * scale;
  const plateVisualWidth = config.plateLength * scale;
  const gapBetweenPlates = 60;
  const headerHeight = 40;
  const footerHeight = 40;
  const onePlateSectionHeight = headerHeight + plateVisualHeight + footerHeight + gapBetweenPlates;
  const totalCanvasHeight = (result.plates.length * onePlateSectionHeight) + 100;

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    result.plates.forEach((plate, plateIndex) => {
      const startY = padding + (plateIndex * onePlateSectionHeight);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';

      const title = `Płyta #${plate.plateNumber}`;
      const subtitle = plate.quantity > 1
          ? `(Powtórz x${plate.quantity} szt.)`
          : '(Pojedyncza)';

      ctx.fillText(title, padding, startY + 15);

      if (plate.quantity > 1) {
          ctx.fillStyle = '#2563eb';
          ctx.font = 'bold 16px sans-serif';
      } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '14px sans-serif';
      }
      ctx.fillText(subtitle, padding + 120, startY + 15);

      const boardY = startY + headerHeight;

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(padding, boardY, plateVisualWidth, plateVisualHeight);

      if (!config.allowRotation) {
        ctx.save();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let i = 0; i < plateVisualHeight; i += 15) {
             ctx.beginPath();
             ctx.moveTo(padding, boardY + i);
             ctx.lineTo(padding + plateVisualWidth, boardY + i);
             ctx.stroke();
        }
        ctx.restore();
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px sans-serif';
        ctx.fillText("Kierunek słoja ⮕", padding + 10, boardY + plateVisualHeight - 10);
      }

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, boardY, plateVisualWidth, plateVisualHeight);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${config.plateLength}mm`, padding + plateVisualWidth/2, boardY - 8);

      ctx.save();
      ctx.translate(padding - 10, boardY + plateVisualHeight/2);
      ctx.rotate(-Math.PI/2);
      ctx.fillText(`${config.plateWidth}mm`, 0, 0);
      ctx.restore();

      plate.cuts.forEach((cut) => {
        const x = padding + (cut.x * scale);
        const y = boardY + (cut.y * scale);
        const w = cut.length * scale;
        const h = cut.width * scale;

        const baseId = cut.pieceId.replace(/-\d+$/, '');

        ctx.fillStyle = stringToColor(baseId);
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        if (w > 30 && h > 20) {
          ctx.fillStyle = '#000000';

          const fontSize = Math.min(12, Math.max(8, w / 6));
          ctx.font = `bold ${fontSize}px sans-serif`;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = x + w / 2;
          const centerY = y + h / 2;

          ctx.fillText(`${cut.length}x${cut.width}`, centerX, centerY - (fontSize/2));
          let subText = baseId;

          if (subText.length > 12) {
              subText = subText.substring(0, 10) + '..';
          }

          if (cut.rotated) subText += ' ↻';

          ctx.font = `${fontSize - 1}px sans-serif`;
          ctx.fillStyle = '#333333';
          ctx.fillText(subText, centerX, centerY + (fontSize/2) + 2);
        }
      });

      const statsY = boardY + plateVisualHeight + 25;
      const efficiency = (plate.usedArea / plate.totalArea) * 100;
      ctx.fillStyle = '#475569';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`Wydajność: ${efficiency.toFixed(1)}%  |  Odpady: ${(plate.totalArea - plate.usedArea).toFixed(0)} mm²`, padding, statsY);
    });

    const legendY = (result.plates.length * onePlateSectionHeight) + 40;
    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Legenda:  ↻ = Obrót elementu', padding, legendY);

  }, [result, config, scale, onePlateSectionHeight, plateVisualWidth, plateVisualHeight]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-slate-800 font-bold text-lg">Schemat Rozkroju</h2>
          <p className="text-slate-400 text-sm">Wizualizacja cięcia płyt</p>
        </div>
        <button
          onClick={() => window.print()}
          className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Download size={16} /> Drukuj
        </button>
      </div>

      <div className="bg-slate-50 p-8 overflow-x-auto flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={totalCanvasHeight}
          className="bg-white shadow-lg rounded-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}

export default CuttingVisualizer;