import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  RotateCw, 
  Trash2, 
  FileImage, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { PDFDocument, PageSizes, degrees } from 'pdf-lib';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export default function ImageToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(15); // points
  const [fitMode, setFitMode] = useState<'fit' | 'fill'>('fit');
  const [customFilename, setCustomFilename] = useState<string>('csc-dost-document');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setErrorMessage('Please upload valid image files (JPG, PNG, WebP).');
      return;
    }
    setErrorMessage(null);

    const newItems: ImageItem[] = valid.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      rotation: 0
    }));

    setImages((prev) => [...prev, ...newItems]);
    setGeneratedPdfBlob(null);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index >= images.length - 1) return;
    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const rotateImage = (index: number) => {
    setImages(prev => {
      const copy = [...prev];
      copy[index].rotation = (copy[index].rotation + 90) % 360;
      return copy;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setGeneratedPdfBlob(null);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        // Read file bytes
        const arrayBuffer = await item.file.arrayBuffer();
        let imageEmbed;

        // If WebP, convert to PNG via canvas first because pdf-lib embeds JPG and PNG natively
        if (item.file.type === 'image/webp' || item.rotation !== 0) {
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = item.previewUrl;
          });

          const canvas = document.createElement('canvas');
          if (item.rotation === 90 || item.rotation === 270) {
            canvas.width = img.naturalHeight;
            canvas.height = img.naturalWidth;
          } else {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
          }
          const ctx = canvas.getContext('2d')!;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((item.rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBytes = await (await fetch(pngDataUrl)).arrayBuffer();
          imageEmbed = await pdfDoc.embedPng(pngBytes);
        } else if (item.file.type === 'image/png') {
          imageEmbed = await pdfDoc.embedPng(arrayBuffer);
        } else {
          imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
        }

        // Determine Page Size
        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === 'A4') {
          pageWidth = PageSizes.A4[0];
          pageHeight = PageSizes.A4[1];
        } else if (pageSize === 'Letter') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        } else {
          // Fit page to image dimensions
          pageWidth = imageEmbed.width + margin * 2;
          pageHeight = imageEmbed.height + margin * 2;
        }

        if (orientation === 'landscape' && pageSize !== 'Fit') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted image dimensions inside margins
        const availableW = pageWidth - margin * 2;
        const availableH = pageHeight - margin * 2;

        const imgRatio = imageEmbed.width / imageEmbed.height;
        const pageRatio = availableW / availableH;

        let drawW = availableW;
        let drawH = availableH;

        if (fitMode === 'fit') {
          if (imgRatio > pageRatio) {
            drawW = availableW;
            drawH = availableW / imgRatio;
          } else {
            drawH = availableH;
            drawW = availableH * imgRatio;
          }
        }

        // Center on page
        const drawX = margin + (availableW - drawW) / 2;
        const drawY = margin + (availableH - drawH) / 2;

        page.drawImage(imageEmbed, {
          x: drawX,
          y: drawY,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setGeneratedPdfBlob(blob);
      setGeneratedPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while generating PDF document.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPdf = () => {
    if (!generatedPdfUrl) return;
    const a = document.createElement('a');
    a.href = generatedPdfUrl;
    a.download = `${customFilename || 'document'}.pdf`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <FileImage className="w-3.5 h-3.5" />
          <span>Multi-Image Document Stitcher</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          Image to PDF Maker (A4 / Letter)
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Convert photographs, marksheet scans, certificates, and ID cards into a single standardized PDF file. Reorder pages, rotate scans, and adjust margins before download.
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
          Upload Images to Convert into PDF
        </h3>
        <p className="text-xs text-[#64748B] mt-1">
          Select multiple JPG, PNG, or WebP images. You can reorder pages after uploading.
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

      {/* Document Settings */}
      {images.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="A4">A4 (Standard 210 × 297 mm)</option>
                <option value="Letter">US Letter</option>
                <option value="Fit">Fit Page to Image Dimensions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="portrait">Portrait (Vertical)</option>
                <option value="landscape">Landscape (Horizontal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">Page Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value={0}>No Margins (Edge-to-Edge)</option>
                <option value={15}>Small Margin (15pt)</option>
                <option value={30}>Standard Margin (30pt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">Output File Name</label>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="document-name"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Reordering & Thumbnails */}
          <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#102A56]">
                Pages in PDF ({images.length} pages)
              </span>
              <span className="text-[11px] text-[#64748B]">
                Use arrows to change page order
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((item, idx) => (
                <div key={item.id} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 space-y-2 relative group">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#2563EB]">
                    <span>Page {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-28 bg-white border border-[#E2E8F0] rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={item.previewUrl}
                      alt={`Page ${idx + 1}`}
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                      className="max-h-full max-w-full object-contain transition-transform"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveUp(idx)}
                      className="p-1 text-slate-500 hover:text-[#102A56] disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateImage(idx)}
                      className="p-1 text-slate-500 hover:text-[#2563EB] cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveDown(idx)}
                      className="p-1 text-slate-500 hover:text-[#102A56] disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={generatePdf}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Standard PDF Document...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Create PDF Document ({images.length} Pages)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Generated PDF Download Card */}
      {generatedPdfBlob && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  PDF Generated Successfully!
                </h3>
                <p className="text-xs text-emerald-800">
                  {images.length} pages combined • Total Size: {(generatedPdfBlob.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadPdf}
              className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download {customFilename || 'document'}.pdf</span>
            </button>

            {generatedPdfUrl && (
              <a
                href={generatedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
              >
                Preview in New Tab
              </a>
            )}
          </div>
        </div>
      )}

      {/* Tips & Guidance */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-3 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5 text-sm">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Helpful Tips for Combining Multi-page Applications</span>
        </h4>
        <p className="leading-relaxed">
          When applying for government jobs or college admissions that require a single combined PDF (such as 10th marksheet + 12th marksheet + Domicile Certificate + Category Certificate), upload all your scan images here, arrange them in chronological order using the arrow buttons, and download your ready-to-upload single A4 PDF.
        </p>
      </div>

    </div>
  );
}
