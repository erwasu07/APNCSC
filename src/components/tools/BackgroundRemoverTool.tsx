import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Eye, 
  HelpCircle,
  Palette
} from 'lucide-react';

export default function BackgroundRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bgChoice, setBgChoice] = useState<'transparent' | 'white' | 'blue' | 'custom'>('transparent');
  const [customColor, setCustomColor] = useState('#2563EB');
  const [tolerance, setTolerance] = useState<number>(32);
  const [edgeSmoothing, setEdgeSmoothing] = useState<number>(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const handleFileUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);
    setFile(uploadedFile);
    setResultUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOriginalUrl(url);
      const img = new Image();
      img.onload = () => {
        sourceImageRef.current = img;
        runCutout(img, tolerance, edgeSmoothing, bgChoice, customColor);
      };
      img.src = url;
    };
    reader.readAsDataURL(uploadedFile);
  };

  // High-precision canvas edge-aware background segmentation
  const runCutout = async (
    img: HTMLImageElement,
    tol: number,
    smooth: number,
    bgType: 'transparent' | 'white' | 'blue' | 'custom',
    bgColor: string
  ) => {
    setIsProcessing(true);
    setProgress(15);

    try {
      // Create work canvas
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // Limit max processing dimension for smooth browser execution
      const maxDim = 1600;
      let w = width;
      let h = height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      setProgress(40);

      // Sample perimeter colors to determine background palette
      const samplePoints = [
        [0, 0],
        [w - 1, 0],
        [Math.floor(w / 2), 0],
        [0, Math.floor(h / 4)],
        [w - 1, Math.floor(h / 4)],
        [0, h - 1],
        [w - 1, h - 1],
      ];

      const bgSamples: number[][] = [];
      for (const [x, y] of samplePoints) {
        const idx = (y * w + x) * 4;
        bgSamples.push([d[idx], d[idx + 1], d[idx + 2]]);
      }

      // Calculate euclidean color distance from sampled background
      const isBgPixel = (r: number, g: number, b: number): number => {
        let minDiff = 999999;
        for (const s of bgSamples) {
          // Weighted perceptual color distance
          const rmean = (r + s[0]) / 2;
          const dr = r - s[0];
          const dg = g - s[1];
          const db = b - s[2];
          const diff = Math.sqrt(
            (((512 + rmean) * dr * dr) >> 8) +
            4 * dg * dg +
            (((767 - rmean) * db * db) >> 8)
          );
          if (diff < minDiff) minDiff = diff;
        }
        return minDiff;
      };

      setProgress(60);

      // Create alpha mask using flood and edge distance
      const mask = new Uint8Array(w * h);
      const threshold = tol * 2.2;
      const featherBand = 18;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const diff = isBgPixel(d[i], d[i + 1], d[i + 2]);

          if (diff < threshold) {
            mask[y * w + x] = 0; // Background
          } else if (diff < threshold + featherBand) {
            // Feathered soft edge
            const alphaRatio = (diff - threshold) / featherBand;
            mask[y * w + x] = Math.round(alphaRatio * 255);
          } else {
            mask[y * w + x] = 255; // Foreground
          }
        }
      }

      setProgress(80);

      // Prepare destination canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = w;
      outCanvas.height = h;
      const outCtx = outCanvas.getContext('2d')!;

      // Apply background color if not transparent
      if (bgType === 'white') {
        outCtx.fillStyle = '#FFFFFF';
        outCtx.fillRect(0, 0, w, h);
      } else if (bgType === 'blue') {
        outCtx.fillStyle = '#93C5FD'; // Light studio blue
        outCtx.fillRect(0, 0, w, h);
      } else if (bgType === 'custom') {
        outCtx.fillStyle = bgColor;
        outCtx.fillRect(0, 0, w, h);
      }

      // Apply mask to original pixel data
      for (let i = 0; i < w * h; i++) {
        const p = i * 4;
        const alpha = mask[i];
        if (bgType === 'transparent') {
          d[p + 3] = alpha;
        } else {
          // Blend with solid background
          const origA = alpha / 255;
          const bgA = 1 - origA;
          // outCtx already holds background, we can paint with globalCompositeOperation
        }
      }

      if (bgType === 'transparent') {
        outCtx.putImageData(imgData, 0, 0);
      } else {
        // Draw masked foreground over background
        const fgCanvas = document.createElement('canvas');
        fgCanvas.width = w;
        fgCanvas.height = h;
        const fgCtx = fgCanvas.getContext('2d')!;
        for (let i = 0; i < w * h; i++) {
          d[i * 4 + 3] = mask[i];
        }
        fgCtx.putImageData(imgData, 0, 0);
        outCtx.drawImage(fgCanvas, 0, 0);
      }

      setProgress(100);

      const mimeType = bgType === 'transparent' ? 'image/png' : 'image/jpeg';
      const resultData = outCanvas.toDataURL(mimeType, 0.95);
      setResultUrl(resultData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during cutout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reprocessWithSettings = (newBg: any = bgChoice, newTol: number = tolerance, newCol: string = customColor) => {
    if (sourceImageRef.current) {
      runCutout(sourceImageRef.current, newTol, edgeSmoothing, newBg, newCol);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const ext = bgChoice === 'transparent' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-no-bg.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <Scissors className="w-3.5 h-3.5" />
          <span>Local Browser Segmentation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          Background Remover &amp; Studio Backdrop
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Instantly isolate subjects, eliminate busy backgrounds, and replace them with transparent PNGs or official exam-compliant white/studio-blue backdrops. 100% processed on your device.
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
            <Scissors className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload Photo to Remove Background
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Drag and drop portrait or signature image (JPG, PNG, WebP)
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
        /* Workspace Controls & Comparison */
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-xs font-bold text-[#102A56] block truncate max-w-md">
                  {file.name}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Local Browser Cutout Active
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResultUrl(null);
                  setOriginalUrl(null);
                }}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Upload Different Photo
              </button>
            </div>

            {/* Background Output Choice */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#102A56]">
                Select New Background Style:
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBgChoice('transparent');
                    reprocessWithSettings('transparent');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    bgChoice === 'transparent'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                >
                  Transparent (PNG)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBgChoice('white');
                    reprocessWithSettings('white');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    bgChoice === 'white'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                >
                  Pure White (Govt / Exam Standard)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBgChoice('blue');
                    reprocessWithSettings('blue');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    bgChoice === 'blue'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                >
                  Studio Light Blue
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBgChoice('custom');
                      reprocessWithSettings('custom', tolerance, customColor);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      bgChoice === 'custom'
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    Custom Color
                  </button>
                  {bgChoice === 'custom' && (
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        reprocessWithSettings('custom', tolerance, e.target.value);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E2E8F0] p-0.5"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Edge Tolerance Tuning */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between text-xs font-bold text-[#102A56]">
                <span>Edge Sensitivity (Tolerance):</span>
                <span className="font-mono text-[#2563EB]">{tolerance}</span>
              </div>
              <input
                type="range"
                min="10"
                max="75"
                value={tolerance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTolerance(val);
                  reprocessWithSettings(bgChoice, val);
                }}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B]">
                <span>Strict (Preserves hair details)</span>
                <span>Aggressive (Cuts through noisy backdrops)</span>
              </div>
            </div>

          </div>

          {/* Comparison View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Original */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2 text-center shadow-xs">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Original Image
              </span>
              <div className="h-64 sm:h-80 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2">
                {originalUrl && (
                  <img src={originalUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                )}
              </div>
            </div>

            {/* Processed Result */}
            <div className="bg-white border border-[#BFDBFE] rounded-2xl p-4 space-y-2 text-center shadow-xs">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Processed Cutout
              </span>
              <div className="h-64 sm:h-80 rounded-xl overflow-hidden flex items-center justify-center p-2 relative"
                style={{
                  backgroundImage: bgChoice === 'transparent'
                    ? 'repeating-conic-gradient(#E2E8F0 0% 25%, #FFFFFF 0% 50%)'
                    : 'none',
                  backgroundSize: '16px 16px'
                }}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2 text-xs font-bold text-[#2563EB]">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Processing edge segmentation...</span>
                  </div>
                ) : resultUrl ? (
                  <img src={resultUrl} alt="Processed Cutout" className="max-h-full max-w-full object-contain" />
                ) : null}
              </div>
            </div>

          </div>

          {/* Download Action Bar */}
          {resultUrl && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-[#102A56]">
                  Image cutout ready for download ({bgChoice.toUpperCase()} background)
                </span>
              </div>

              <button
                type="button"
                onClick={downloadResult}
                className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Cutout ({bgChoice === 'transparent' ? 'PNG' : 'JPG'})</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Helpful Info */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Portal Photograph Requirements</span>
        </h4>
        <p className="leading-relaxed">
          Almost all government job portals (UPSC, SSC, JKSSB, Railways) strictly require applicants to submit passport photos against a <strong>plain white or light-coloured uniform background</strong>. Photos taken against household walls, curtains, or outdoor landscapes can lead to application disqualification. Use this tool to cleanly switch your background to crisp studio white in seconds.
        </p>
      </div>

    </div>
  );
}
