import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Grid, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

export default function PassportPhotoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [preset, setPreset] = useState<'35x45' | '2x2' | 'custom'>('35x45');
  const [copiesPerSheet, setCopiesPerSheet] = useState<number>(8); // 6, 8, 12, 16
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [bgColor, setBgColor] = useState<'original' | 'white' | 'blue' | 'grey'>('white');
  const [addBorder, setAddBorder] = useState(true);
  const [singlePhotoUrl, setSinglePhotoUrl] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleFileUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) return;
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setZoom(1);
      setRotation(0);
      setPanX(0);
      setPanY(0);
    };
    reader.readAsDataURL(uploadedFile);
  };

  // Target aspect ratio
  const getAspectRatio = () => {
    if (preset === '35x45') return 35 / 45; // 0.777
    if (preset === '2x2') return 1; // Square 1.0
    return 35 / 45;
  };

  // Render cropped preview to canvas
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ratio = getAspectRatio();
      // Passport render dimensions (e.g. 350 x 450 px)
      const targetW = 350;
      const targetH = Math.round(targetW / ratio);
      canvas.width = targetW;
      canvas.height = targetH;

      // Fill background
      if (bgColor === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (bgColor === 'blue') {
        ctx.fillStyle = '#93C5FD';
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (bgColor === 'grey') {
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(0, 0, targetW, targetH);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // Draw transformed image
      ctx.save();
      ctx.translate(targetW / 2 + panX, targetH / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Fit base
      const scaleFit = Math.max(targetW / img.width, targetH / img.height);
      const drawW = img.width * scaleFit;
      const drawH = img.height * scaleFit;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Border outline for cut guides
      if (addBorder) {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, targetW - 1, targetH - 1);
      }

      // Generate single photo download url
      setSinglePhotoUrl(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = imageSrc;
  }, [imageSrc, preset, zoom, rotation, panX, panY, bgColor, addBorder]);

  // Generate Multi-Photo Printable A4 Sheet
  const generateA4Sheet = () => {
    if (!previewCanvasRef.current) return;
    const sourceCanvas = previewCanvasRef.current;

    // A4 at 300 DPI: 2480 × 3508 pixels
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 2480;
    sheetCanvas.height = 3508;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return;

    // Clean white paper
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    // Header label
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('CSC DOST — Passport Photo Print Sheet (300 DPI A4)', 120, 140);
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Print at 100% Scale / Actual Size • Preset: ${preset === '35x45' ? '35x45 mm' : '2x2 inch'} • ${copiesPerSheet} Copies`, 120, 185);

    // Dimensions in pixels at 300 DPI:
    // 35 mm = ~413 px, 45 mm = ~531 px
    // 2 inch = ~600 px
    const photoW = preset === '35x45' ? 413 : 590;
    const photoH = preset === '35x45' ? 531 : 590;
    const gapX = 60;
    const gapY = 70;
    const startX = 120;
    const startY = 260;

    const cols = preset === '35x45' ? 4 : 3;
    const rows = Math.ceil(copiesPerSheet / cols);

    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count >= copiesPerSheet) break;
        const x = startX + c * (photoW + gapX);
        const y = startY + r * (photoH + gapY);

        ctx.drawImage(sourceCanvas, x, y, photoW, photoH);

        // Thin dashed cutting guides
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(x - 2, y - 2, photoW + 4, photoH + 4);
        ctx.setLineDash([]);

        count++;
      }
    }

    const sheetDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.98);
    setSheetUrl(sheetDataUrl);

    // Trigger download
    const a = document.createElement('a');
    a.href = sheetDataUrl;
    a.download = `passport-photo-sheet-${copiesPerSheet}-copies.jpg`;
    a.click();
  };

  const downloadSingle = () => {
    if (!singlePhotoUrl) return;
    const a = document.createElement('a');
    a.href = singlePhotoUrl;
    a.download = `passport-photo-${preset}.jpg`;
    a.click();
  };

  // Drag pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPanX(e.clientX - dragStart.current.x);
    setPanY(e.clientY - dragStart.current.y);
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Official 35×45mm &amp; 2×2 Inch Standards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          Passport Photo Maker &amp; Printable Sheet
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Crop and align your photo according to strict government recruitment standards (JKSSB, SSC, Indian Army, Passport/Visa). Download a single cropped photo or a printable A4 sheet with 6, 8, 12, or 16 copies.
        </p>
      </div>

      {/* Upload Box */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#BFDBFE] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF]/40 rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload Photograph to Format
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Drag and drop portrait photo from camera or phone (JPG, PNG)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        /* Interactive Editor Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Canvas Preview */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-xs text-center">
            <div className="flex items-center justify-between text-xs border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#102A56]">Interactive Crop Canvas</span>
              <span className="text-[#64748B]">Click &amp; drag photo to center face</span>
            </div>

            <div
              className="bg-slate-100 rounded-xl p-4 flex items-center justify-center cursor-move overflow-hidden select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <canvas
                ref={previewCanvasRef}
                className="max-h-80 shadow-md rounded border border-slate-300"
              />
            </div>

            {/* Quick Adjustment Slider & Controls */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#102A56]">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom / Scale:</span>
                </span>
                <span className="font-mono text-[#2563EB]">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-xs font-bold text-[#0F172A] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                    setRotation(0);
                  }}
                  className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                >
                  Reset Position
                </button>
              </div>
            </div>
          </div>

          {/* Right Controls & Sheet Generator */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
            
            {/* Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#102A56]">
                Select Dimension Standard:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreset('35x45')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preset === '35x45'
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#102A56] font-bold'
                      : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="text-xs block">35 × 45 mm (Standard)</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">JKSSB, SSC, UPSC, Indian Passport</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreset('2x2')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    preset === '2x2'
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#102A56] font-bold'
                      : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="text-xs block">2 × 2 Inch (Square)</span>
                  <span className="text-[10px] text-[#64748B] block mt-0.5">US Visa, OCI Card, International</span>
                </button>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#102A56]">
                Background Tone:
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'white', label: 'White' },
                  { id: 'blue', label: 'Light Blue' },
                  { id: 'grey', label: 'Light Grey' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgColor(b.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      bgColor === b.id
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Photo Sheet Copies */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <label className="block text-xs font-bold text-[#102A56]">
                Printable A4 Sheet Options:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCopiesPerSheet(num)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      copiesPerSheet === num
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    {num} Photos
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={downloadSingle}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Single Passport Photo (JPG)</span>
              </button>

              <button
                type="button"
                onClick={generateA4Sheet}
                className="w-full py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Download Printable A4 Sheet ({copiesPerSheet} Copies, 300 DPI)</span>
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Natural Identity Standard:</strong> CSC DOST strictly preserves your natural facial proportions and features without distortion, complying with official Indian biometric photograph requirements.
              </span>
            </div>

          </div>

        </div>
      )}

      {/* Helpful Requirements Guidance */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Official Guidelines for Passport Size Photos</span>
        </h4>
        <p className="leading-relaxed">
          For JKSSB, Staff Selection Commission (SSC), UPSC, and Police recruitments, ensure:
          (1) Both ears must be clearly visible, (2) Eyes looking straight into the lens with a neutral expression, (3) No caps, dark tinted sunglasses, or heavy face-covering scarves (religious turbans allowed), and (4) Head size should occupy 60% to 70% of the photo height.
        </p>
      </div>

    </div>
  );
}
