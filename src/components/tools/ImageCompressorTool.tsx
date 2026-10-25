import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Eye,
  Trash2,
  Layers
} from 'lucide-react';

interface CompressedResult {
  file: File;
  originalSize: number;
  compressedBlob: Blob;
  compressedSize: number;
  previewUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  qualityUsed: number;
}

export default function ImageCompressorTool() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetKb, setTargetKb] = useState<number | 'custom'>(50);
  const [customKb, setCustomKb] = useState<number>(35);
  const [mode, setMode] = useState<'target' | 'manual'>('target');
  const [manualQuality, setManualQuality] = useState<number>(75);
  const [maxDimension, setMaxDimension] = useState<number>(1600);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const TARGET_PRESETS = [20, 50, 100, 200, 500];

  const handleFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setWarningMessage('Please upload valid JPG, PNG, or WebP image files.');
      return;
    }
    setWarningMessage(null);
    setSelectedFiles(valid);
    setResults([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Binary search compression to hit desired target size
  const compressSingleImage = useCallback(async (file: File): Promise<CompressedResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = async () => {
          const originalUrl = e.target?.result as string;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          // Downscale if exceeds maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          // Fill white background for transparent images converted to JPEG
          if (outputFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);

          const desiredKb = mode === 'target' 
            ? (targetKb === 'custom' ? customKb : targetKb)
            : null;

          if (desiredKb && outputFormat !== 'image/png') {
            // Target KB Binary Search
            let minQ = 0.05;
            let maxQ = 0.98;
            let bestBlob: Blob | null = null;
            let bestQ = 0.7;

            // Attempt 6 binary search iterations
            for (let i = 0; i < 6; i++) {
              const testQ = (minQ + maxQ) / 2;
              const blob = await new Promise<Blob | null>((res) => 
                canvas.toBlob(res, outputFormat, testQ)
              );
              if (!blob) break;

              const sizeKb = blob.size / 1024;
              bestBlob = blob;
              bestQ = testQ;

              if (sizeKb > desiredKb) {
                maxQ = testQ; // Need lower quality
              } else {
                minQ = testQ; // Can try slightly higher quality
              }
            }

            // If still exceeding target KB after minimum quality, downscale canvas
            if (bestBlob && (bestBlob.size / 1024) > desiredKb * 1.1) {
              const scaleDownFactor = Math.sqrt(desiredKb / (bestBlob.size / 1024));
              const newW = Math.max(100, Math.round(width * Math.min(0.85, scaleDownFactor)));
              const newH = Math.max(100, Math.round(height * Math.min(0.85, scaleDownFactor)));

              const smallCanvas = document.createElement('canvas');
              smallCanvas.width = newW;
              smallCanvas.height = newH;
              const smallCtx = smallCanvas.getContext('2d');
              if (smallCtx) {
                if (outputFormat === 'image/jpeg') {
                  smallCtx.fillStyle = '#FFFFFF';
                  smallCtx.fillRect(0, 0, newW, newH);
                }
                smallCtx.drawImage(canvas, 0, 0, newW, newH);
                const secondBlob = await new Promise<Blob | null>((res) => 
                  smallCanvas.toBlob(res, outputFormat, 0.7)
                );
                if (secondBlob) {
                  bestBlob = secondBlob;
                  width = newW;
                  height = newH;
                }
              }
            }

            if (!bestBlob) {
              bestBlob = await new Promise<Blob | null>((res) => 
                canvas.toBlob(res, outputFormat, 0.7)
              );
            }

            const finalBlob = bestBlob || new Blob();
            resolve({
              file,
              originalSize: file.size,
              compressedBlob: finalBlob,
              compressedSize: finalBlob.size,
              previewUrl: URL.createObjectURL(finalBlob),
              originalUrl,
              width,
              height,
              qualityUsed: Math.round(bestQ * 100)
            });
          } else {
            // Manual Quality Mode or PNG
            const q = mode === 'manual' ? manualQuality / 100 : 0.8;
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Failed to encode image'));
                return;
              }
              resolve({
                file,
                originalSize: file.size,
                compressedBlob: blob,
                compressedSize: blob.size,
                previewUrl: URL.createObjectURL(blob),
                originalUrl,
                width,
                height,
                qualityUsed: Math.round(q * 100)
              });
            }, outputFormat, q);
          }
        };
        img.onerror = () => reject(new Error('Failed to read image source'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File reader error'));
      reader.readAsDataURL(file);
    });
  }, [mode, targetKb, customKb, manualQuality, maxDimension, outputFormat]);

  const processAll = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setWarningMessage(null);
    try {
      const outputResults: CompressedResult[] = [];
      for (const file of selectedFiles) {
        const res = await compressSingleImage(file);
        outputResults.push(res);
      }
      setResults(outputResults);

      // Check if target was hard to achieve
      const effectiveDesired = targetKb === 'custom' ? customKb : targetKb;
      if (mode === 'target' && typeof effectiveDesired === 'number') {
        const missed = outputResults.some(r => r.compressedSize / 1024 > effectiveDesired * 1.15);
        if (missed) {
          setWarningMessage(`Some images could not be compressed under ${effectiveDesired} KB without heavy resolution downscaling.`);
        }
      }
    } catch (err: any) {
      setWarningMessage(err.message || 'Error occurred while compressing images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOne = (res: CompressedResult) => {
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp';
    const originalName = res.file.name.replace(/\.[^/.]+$/, '');
    const filename = `${originalName}-compressed-${Math.round(res.compressedSize / 1024)}kb.${ext}`;
    const a = document.createElement('a');
    a.href = res.previewUrl;
    a.download = filename;
    a.click();
  };

  const downloadAll = () => {
    results.forEach(res => downloadOne(res));
  };

  const formatKb = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const calcReduction = (orig: number, comp: number) => {
    if (orig <= 0) return 0;
    const diff = orig - comp;
    return Math.round((diff / orig) * 100);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Iterative Target Size &amp; Quality Compression</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          Image Compressor (Target KB &amp; Quality)
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Compress JPG, PNG, and WebP images to exact recruitment file limits (20 KB, 50 KB, 100 KB, or custom KB) with live before/after comparison. All processing runs privately inside your browser.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#BFDBFE] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF]/40 rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#102A56]">
          Click or Drag &amp; Drop Images to Compress
        </h3>
        <p className="text-xs text-[#64748B] mt-1">
          Supports JPG, PNG, and WebP files up to 30 MB each. Multiple files supported.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Settings Grid */}
      {selectedFiles.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold text-[#102A56] block">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} loaded
              </span>
              <span className="text-[11px] text-[#64748B]">
                Total Original Size: {formatKb(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>

            <div className="inline-flex p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start sm:self-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('target')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'target' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Target File Size (KB)
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'manual' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Manual Quality Slider
              </button>
            </div>
          </div>

          {/* Mode 1: Target KB Settings */}
          {mode === 'target' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#102A56]">
                Select Target File Size Preset:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {TARGET_PRESETS.map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setTargetKb(kb)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      targetKb === kb
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    Under {kb} KB
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTargetKb('custom')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    targetKb === 'custom'
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                      : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                >
                  Custom Target
                </button>
              </div>

              {targetKb === 'custom' && (
                <div className="pt-2 flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="5"
                    max="5000"
                    value={customKb}
                    onChange={(e) => setCustomKb(Math.max(5, Number(e.target.value)))}
                    className="w-32 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-[#64748B]">Target KB</span>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Manual Quality Settings */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#102A56]">
                <span>Compression Quality:</span>
                <span className="text-[#2563EB] font-mono text-sm">{manualQuality}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="98"
                value={manualQuality}
                onChange={(e) => setManualQuality(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B]">
                <span>Smallest File Size (High Compression)</span>
                <span>Best Visual Quality</span>
              </div>
            </div>
          )}

          {/* Advanced Controls: Format & Max Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0]">
            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Output Image Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="image/jpeg">JPEG (.jpg) - Recommended for Govt Portals</option>
                <option value="image/webp">WebP (.webp) - Maximum Compression Efficiency</option>
                <option value="image/png">PNG (.png) - Lossless</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Max Dimension Constraint
              </label>
              <select
                value={maxDimension}
                onChange={(e) => setMaxDimension(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value={1920}>1920px (Full HD)</option>
                <option value={1200}>1200px (Balanced)</option>
                <option value={800}>800px (Compact / Signature / Portal)</option>
                <option value={400}>400px (Passport Size Portrait)</option>
              </select>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={processAll}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compressing {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compress Images Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {warningMessage && (
        <div className="flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#102A56]">
                Compressed Results ({results.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                Review compression ratios and download optimized images.
              </p>
            </div>
            {results.length > 1 && (
              <button
                type="button"
                onClick={downloadAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download All ({results.length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res, idx) => {
              const reduction = calcReduction(res.originalSize, res.compressedSize);
              return (
                <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 text-xs">
                    <span className="font-bold text-[#102A56] truncate max-w-[200px]" title={res.file.name}>
                      {res.file.name}
                    </span>
                    <span className="font-bold text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded">
                      -{reduction}%
                    </span>
                  </div>

                  {/* Side-by-Side Thumbnails */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] font-semibold text-[#64748B] uppercase">Original</span>
                      <div className="h-32 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-[#E2E8F0]">
                        <img src={res.originalUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-[#0F172A] block">{formatKb(res.originalSize)}</span>
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[10px] font-semibold text-[#2563EB] uppercase">Compressed</span>
                      <div className="h-32 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-[#BFDBFE]">
                        <img src={res.previewUrl} alt="Compressed" className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-xs font-extrabold text-[#2563EB] block">{formatKb(res.compressedSize)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                    <span>Dimensions: {res.width} × {res.height} px</span>
                    <span>Quality used: {res.qualityUsed}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadOne(res)}
                    className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Compressed Image</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helpful FAQs & Portal Specifications */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-[#102A56] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Image Compression Tips for Recruitment Portals</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#64748B] leading-relaxed">
          <div className="space-y-1">
            <h4 className="font-bold text-[#0F172A]">Why does my upload get rejected?</h4>
            <p>
              Most Indian government portals (JKSSB, SSC, UPSC, RRB) strictly require photographs between <strong>20 KB and 50 KB</strong>, and candidate signatures between <strong>10 KB and 20 KB</strong>. Images above 50 KB trigger an automated portal rejection.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-[#0F172A]">Is my photo uploaded to a server?</h4>
            <p>
              <strong>Never.</strong> This tool processes every image directly in your browser's local memory via Canvas. No images leave your computer or phone.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
