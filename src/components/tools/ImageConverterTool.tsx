import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileImage,
  Sparkles,
  Layers
} from 'lucide-react';

interface ConvertedItem {
  file: File;
  previewUrl: string;
  blob: Blob;
  outputName: string;
  sizeKb: number;
}

export default function ImageConverterTool() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(90);
  const [transparencyBg, setTransparencyBg] = useState<string>('#FFFFFF');
  const [isConverting, setIsConverting] = useState(false);
  const [results, setResults] = useState<ConvertedItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setErrorMessage('Please upload valid JPG, PNG, or WebP images.');
      return;
    }
    setErrorMessage(null);
    setSelectedFiles(valid);
    setResults([]);
  };

  const convertAll = async () => {
    if (selectedFiles.length === 0) return;
    setIsConverting(true);
    setErrorMessage(null);

    try {
      const outputList: ConvertedItem[] = [];

      for (const file of selectedFiles) {
        const item = await convertSingle(file);
        outputList.push(item);
      }

      setResults(outputList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error converting images.');
    } finally {
      setIsConverting(false);
    }
  };

  const convertSingle = (file: File): Promise<ConvertedItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // If converting to JPEG, fill transparency with background color
          if (targetFormat === 'image/jpeg') {
            ctx.fillStyle = transparencyBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          const q = quality / 100;
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }

            const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/png' ? 'png' : 'webp';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const outputName = `${baseName}.${ext}`;

            resolve({
              file,
              previewUrl: URL.createObjectURL(blob),
              blob,
              outputName,
              sizeKb: Math.round(blob.size / 1024)
            });
          }, targetFormat, q);
        };
        img.onerror = () => reject(new Error('Image decode failed'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File reader failed'));
      reader.readAsDataURL(file);
    });
  };

  const downloadOne = (item: ConvertedItem) => {
    const a = document.createElement('a');
    a.href = item.previewUrl;
    a.download = item.outputName;
    a.click();
  };

  const downloadAll = () => {
    results.forEach(item => downloadOne(item));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Universal Format Transcoder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          Image Format Converter (JPG / PNG / WebP)
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Convert PNG to JPG, WebP to JPG, or JPG to PNG in batch. Adjust background fill color when converting transparent logos and signatures to standard JPG format.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#BFDBFE] hover:border-[#2563EB] bg-[#F8FAFC] hover:bg-[#EFF6FF]/40 rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <FileImage className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#102A56]">
          Upload Images to Convert Format
        </h3>
        <p className="text-xs text-[#64748B] mt-1">
          Supports PNG, JPG, JPEG, and WebP images. Batch conversion supported.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold text-[#102A56] block">
                {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''} Selected
              </span>
              <span className="text-[11px] text-[#64748B]">
                Configure output format and quality settings below
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
                setResults([]);
              }}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Convert To:
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="image/jpeg">JPG / JPEG (Standard)</option>
                <option value="image/png">PNG (Preserves Transparency)</option>
                <option value="image/webp">WebP (Modern Compact)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer mt-2"
              />
            </div>

            {targetFormat === 'image/jpeg' && (
              <div>
                <label className="block text-xs font-bold text-[#102A56] mb-1">
                  Fill Transparent Pixels With:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={transparencyBg}
                    onChange={(e) => setTransparencyBg(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-[#E2E8F0] p-0.5"
                  />
                  <span className="text-xs text-[#64748B]">
                    {transparencyBg === '#FFFFFF' ? 'White Background' : transparencyBg}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isConverting}
            onClick={convertAll}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Converting {selectedFiles.length} Images...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Convert Images to {targetFormat === 'image/jpeg' ? 'JPG' : targetFormat === 'image/png' ? 'PNG' : 'WebP'}</span>
              </>
            )}
          </button>

        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#102A56]">
              Converted Images ({results.length})
            </h3>
            {results.length > 1 && (
              <button
                type="button"
                onClick={downloadAll}
                className="px-4 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Download All ({results.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#102A56] border-b border-[#E2E8F0] pb-2">
                  <span className="truncate max-w-[180px]">{item.outputName}</span>
                  <span className="text-[#2563EB]">{item.sizeKb} KB</span>
                </div>

                <div className="h-40 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-200">
                  <img src={item.previewUrl} alt={item.outputName} className="max-h-full max-w-full object-contain" />
                </div>

                <button
                  type="button"
                  onClick={() => downloadOne(item)}
                  className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {item.outputName}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
