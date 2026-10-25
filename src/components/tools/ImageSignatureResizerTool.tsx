import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Lock, 
  Unlock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  HelpCircle,
  Crop,
  PenTool
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  w: number;
  h: number;
  minKb: number;
  maxKb: number;
}

interface ImageSignatureResizerToolProps {
  initialMode?: 'signature' | 'image';
}

export default function ImageSignatureResizerTool({ initialMode = 'signature' }: ImageSignatureResizerToolProps) {
  const [activeTab, setActiveTab] = useState<'signature' | 'image'>(initialMode);
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState<number>(0);
  const [naturalH, setNaturalH] = useState<number>(0);

  const [width, setWidth] = useState<number>(140);
  const [height, setHeight] = useState<number>(60);
  const [lockRatio, setLockRatio] = useState<boolean>(false);
  const [targetKb, setTargetKb] = useState<number>(15);

  // Signature Specific Enhancements
  const [cleanWhiteBg, setCleanWhiteBg] = useState<boolean>(true);
  const [autoCropMargins, setAutoCropMargins] = useState<boolean>(true);
  const [inkContrast, setInkContrast] = useState<number>(130); // percentage

  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const SIGNATURE_PRESETS: Preset[] = [
    { id: 'ssc', name: 'SSC Portal (140 × 60 px)', w: 140, h: 60, minKb: 10, maxKb: 20 },
    { id: 'jkssb', name: 'JKSSB Portal (100 × 40 px)', w: 100, h: 40, minKb: 10, maxKb: 20 },
    { id: 'army', name: 'Indian Army (160 × 60 px)', w: 160, h: 60, minKb: 160, maxKb: 10 },
    { id: 'rrb', name: 'Railway RRB (160 × 56 px)', w: 160, h: 56, minKb: 30, maxKb: 70 },
  ];

  const handleFileUpload = (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG or PNG).');
      return;
    }
    setErrorMessage(null);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      const img = new Image();
      img.onload = () => {
        setNaturalW(img.naturalWidth);
        setNaturalH(img.naturalHeight);
        if (activeTab === 'image') {
          setWidth(img.naturalWidth);
          setHeight(img.naturalHeight);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(uploadedFile);
  };

  const applyPreset = (p: Preset) => {
    setWidth(p.w);
    setHeight(p.h);
    setTargetKb(Math.round((p.minKb + p.maxKb) / 2));
  };

  // Re-run resizing and enhancements
  const processResize = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageSrc;
      });

      // Canvas for source
      let srcCanvas = document.createElement('canvas');
      srcCanvas.width = img.naturalWidth;
      srcCanvas.height = img.naturalHeight;
      let srcCtx = srcCanvas.getContext('2d')!;
      srcCtx.drawImage(img, 0, 0);

      // Signature White Paper Cleaner & Margin Cropping
      if (activeTab === 'signature' && (cleanWhiteBg || autoCropMargins)) {
        const imgData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
        const d = imgData.data;

        // Auto Margin Detection
        let minX = srcCanvas.width;
        let minY = srcCanvas.height;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < srcCanvas.height; y++) {
          for (let x = 0; x < srcCanvas.width; x++) {
            const idx = (y * srcCanvas.width + x) * 4;
            const r = d[idx];
            const g = d[idx + 1];
            const b = d[idx + 2];
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // If dark pixel (ink stroke)
            if (brightness < 185) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }

            // Clean background noise to pure white if option enabled
            if (cleanWhiteBg) {
              if (brightness > 195) {
                d[idx] = 255;
                d[idx + 1] = 255;
                d[idx + 2] = 255;
              } else {
                // Enhance ink contrast
                const factor = inkContrast / 100;
                d[idx] = Math.max(0, Math.min(255, Math.round((r - 128) * factor + 128)));
                d[idx + 1] = Math.max(0, Math.min(255, Math.round((g - 128) * factor + 128)));
                d[idx + 2] = Math.max(0, Math.min(255, Math.round((b - 128) * factor + 128)));
              }
            }
          }
        }

        srcCtx.putImageData(imgData, 0, 0);

        // Crop whitespace if strokes were found
        if (autoCropMargins && minX < maxX && minY < maxY) {
          const pad = 12;
          const cropX = Math.max(0, minX - pad);
          const cropY = Math.max(0, minY - pad);
          const cropW = Math.min(srcCanvas.width - cropX, maxX - minX + pad * 2);
          const cropH = Math.min(srcCanvas.height - cropY, maxY - minY + pad * 2);

          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = cropW;
          croppedCanvas.height = cropH;
          const cCtx = croppedCanvas.getContext('2d')!;
          cCtx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          srcCanvas = croppedCanvas;
        }
      }

      // Final Target Dimension Canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = width;
      finalCanvas.height = height;
      const fCtx = finalCanvas.getContext('2d')!;

      // Fill pure white backdrop
      fCtx.fillStyle = '#FFFFFF';
      fCtx.fillRect(0, 0, width, height);

      // Fit inside target dimensions
      const scale = Math.min(width / srcCanvas.width, height / srcCanvas.height);
      const drawW = srcCanvas.width * scale;
      const drawH = srcCanvas.height * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;

      fCtx.drawImage(srcCanvas, drawX, drawY, drawW, drawH);

      // Binary search quality for target KB
      let bestBlob: Blob | null = null;
      let minQ = 0.1;
      let maxQ = 0.98;

      for (let i = 0; i < 5; i++) {
        const testQ = (minQ + maxQ) / 2;
        const b = await new Promise<Blob | null>((res) => 
          finalCanvas.toBlob(res, outputFormat, testQ)
        );
        if (!b) break;
        bestBlob = b;
        if (b.size / 1024 > targetKb) {
          maxQ = testQ;
        } else {
          minQ = testQ;
        }
      }

      const resBlob = bestBlob || await new Promise<Blob | null>((res) => 
        finalCanvas.toBlob(res, outputFormat, 0.8)
      );

      if (resBlob) {
        setOutputBlob(resBlob);
        setPreviewUrl(URL.createObjectURL(resBlob));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while resizing.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (imageSrc) {
      processResize();
    }
  }, [imageSrc, width, height, activeTab, cleanWhiteBg, autoCropMargins, inkContrast, outputFormat, targetKb]);

  const downloadResized = () => {
    if (!previewUrl || !file) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-${width}x${height}.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <PenTool className="w-3.5 h-3.5" />
          <span>Government Portal Signature &amp; Image Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          Image &amp; Signature Resizer
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Eliminate camera paper shadows, crop excess whitespace from signatures, and scale images to exact government recruitment dimensions (JKSSB, SSC, Army, RRB) within strict 10–20 KB file limits.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="inline-flex p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('signature');
            setWidth(140);
            setHeight(60);
            setTargetKb(15);
          }}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'signature'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Candidate Signature Resizer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'image'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Crop className="w-3.5 h-3.5" />
          <span>General Photo Resizer</span>
        </button>
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
            <PenTool className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload {activeTab === 'signature' ? 'Signature Photo' : 'Image to Resize'}
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            JPG or PNG files supported. Phone camera snapshots welcome.
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
        /* Workspace Editor */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Preview */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-xs text-center">
            <div className="flex items-center justify-between text-xs border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#102A56]">Live Scaled Preview</span>
              <span className="text-[#2563EB] font-bold">
                {width} × {height} px
              </span>
            </div>

            <div className="h-44 bg-slate-100 rounded-xl flex items-center justify-center p-3 border border-slate-200 overflow-hidden">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Resized Result"
                  className="max-h-full max-w-full object-contain shadow-xs border border-slate-300 bg-white"
                />
              )}
            </div>

            {outputBlob && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Calculated Size:</span>
                  <span className="font-extrabold text-[#2563EB]">
                    {(outputBlob.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Target Limit:</span>
                  <span className="font-semibold text-[#0F172A]">&le; {targetKb} KB</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={downloadResized}
              className="w-full py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Ready File ({(outputBlob?.size ? (outputBlob.size / 1024).toFixed(1) : '0')} KB)</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-xs">
            
            {/* Presets for Signatures */}
            {activeTab === 'signature' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#102A56]">
                  Recruitment Portal Presets:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SIGNATURE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        width === p.w && height === p.h
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#102A56] font-bold'
                          : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <span className="text-xs block">{p.name}</span>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">
                        Target: {p.minKb}-{p.maxKb} KB
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Pixel Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102A56] mb-1">
                  Width (Pixels)
                </label>
                <input
                  type="number"
                  min="20"
                  max="4000"
                  value={width}
                  onChange={(e) => setWidth(Math.max(20, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A56] mb-1">
                  Height (Pixels)
                </label>
                <input
                  type="number"
                  min="20"
                  max="4000"
                  value={height}
                  onChange={(e) => setHeight(Math.max(20, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            {/* Target KB */}
            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Target File Size Limit (KB)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="5"
                  max="2000"
                  value={targetKb}
                  onChange={(e) => setTargetKb(Math.max(5, Number(e.target.value)))}
                  className="w-32 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">
                  Most portals strictly require 10 KB - 20 KB
                </span>
              </div>
            </div>

            {/* Signature Enhancement Toggles */}
            {activeTab === 'signature' && (
              <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                <span className="text-xs font-bold text-[#102A56] block">
                  Automatic Paper Cleanups:
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleanWhiteBg}
                    onChange={(e) => setCleanWhiteBg(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#0F172A]">
                    Clean Paper Background (Removes shadows &amp; yellowish desk tint)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCropMargins}
                    onChange={(e) => setAutoCropMargins(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#0F172A]">
                    Auto-Crop Empty Margins (Trims excess blank space around ink)
                  </span>
                </label>
              </div>
            )}

            <div className="pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setImageSrc(null);
                  setPreviewUrl(null);
                }}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Upload Different File
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Helpful Instructions */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>How to Take a Perfect Signature Photo with Your Phone</span>
        </h4>
        <p className="leading-relaxed">
          Sign on a clean sheet of unruled plain white paper using a dark black or blue ballpoint pen. Hold your smartphone directly overhead avoiding shadows. Once uploaded, our engine will automatically crop the outer blank paper and whiten the background to match official portal standards.
        </p>
      </div>

    </div>
  );
}
