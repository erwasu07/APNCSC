import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  FileDown, 
  CheckCircle2, 
  AlertCircle, 
  Archive, 
  RefreshCw, 
  Sliders, 
  HelpCircle,
  Eye,
  FileImage
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure pdfjs worker dynamically
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  // worker fallback
}

interface RenderedPage {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export default function PdfToImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [resolutionScale, setResolutionScale] = useState<number>(1.5); // 1x=72dpi, 1.5x=108dpi, 2x=144dpi, 3x=216dpi
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [currentProgress, setCurrentProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setErrorMessage(null);
    setFile(uploadedFile);
    setRenderedPages([]);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while loading PDF.');
    }
  };

  const renderPdfPages = async () => {
    if (!file) return;
    setIsRendering(true);
    setErrorMessage(null);
    setRenderedPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      const count = pdf.numPages;

      const results: RenderedPage[] = [];

      for (let i = 1; i <= count; i++) {
        setCurrentProgress(`Rendering page ${i} of ${count}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: resolutionScale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          const dataUrl = canvas.toDataURL(format, format === 'image/jpeg' ? 0.92 : undefined);
          const blob = await (await fetch(dataUrl)).blob();

          results.push({
            pageNum: i,
            dataUrl,
            blob,
            width: viewport.width,
            height: viewport.height
          });
        }
      }

      setRenderedPages(results);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while converting pages.');
    } finally {
      setIsRendering(false);
      setCurrentProgress('');
    }
  };

  const downloadSinglePage = (page: RenderedPage) => {
    if (!file) return;
    const a = document.createElement('a');
    a.href = page.dataUrl;
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-page-${page.pageNum}.${ext}`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (!file || renderedPages.length === 0) return;
    const zip = new JSZip();
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    for (const page of renderedPages) {
      zip.file(`${baseName}-page-${page.pageNum}.${ext}`, page.blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${baseName}-images.zip`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <FileDown className="w-3.5 h-3.5" />
          <span>High-DPI PDF Page Rasterizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          PDF to Image Converter (JPG / PNG)
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Convert each page of your PDF into high-resolution JPG or PNG pictures. Perfect for submitting certificates to portals that reject PDF uploads. Download single pages or all as a ZIP archive.
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
            <FileDown className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload PDF Document to Convert to Images
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Drag and drop your PDF here or click to browse.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        /* Conversion Settings */
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold text-[#102A56] block truncate max-w-md">
                {file.name}
              </span>
              <span className="text-[11px] text-[#64748B]">
                {totalPages} Total Pages • {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setRenderedPages([]);
              }}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer self-start sm:self-auto"
            >
              Choose Different PDF
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="image/jpeg">JPG (.jpg) - Universal / Compact</option>
                <option value="image/png">PNG (.png) - Highest Sharpness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A56] mb-1">
                Render Quality / Resolution Scale
              </label>
              <select
                value={resolutionScale}
                onChange={(e) => setResolutionScale(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value={1}>1.0× (Standard 72-100 DPI)</option>
                <option value={1.5}>1.5× (Balanced 150 DPI - Recommended)</option>
                <option value={2}>2.0× (High Resolution 200 DPI)</option>
                <option value={3}>3.0× (Ultra Crisp 300 DPI Print Quality)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            disabled={isRendering}
            onClick={renderPdfPages}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{currentProgress || 'Converting PDF to Images...'}</span>
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4" />
                <span>Convert All {totalPages} Pages to {format === 'image/jpeg' ? 'JPG' : 'PNG'}</span>
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

      {/* Rendered Images Display */}
      {renderedPages.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#102A56]">
                Converted Pages ({renderedPages.length})
              </h2>
              <p className="text-xs text-[#64748B]">
                Download individual pages or get all pages bundled in a single ZIP.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadAllAsZip}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Archive className="w-4 h-4" />
              <span>Download All as ZIP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderedPages.map((page) => (
              <div key={page.pageNum} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#102A56] border-b border-[#E2E8F0] pb-2">
                  <span>Page {page.pageNum}</span>
                  <span className="text-[#64748B] font-medium text-[11px]">
                    {(page.blob.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-200">
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNum}`}
                    className="max-h-full max-w-full object-contain shadow-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => downloadSinglePage(page)}
                  className="w-full py-2 bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:text-[#2563EB] text-[#0F172A] border border-[#E2E8F0] hover:border-[#BFDBFE] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Page {page.pageNum}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Info */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>When to Convert PDF to Image</span>
        </h4>
        <p className="leading-relaxed">
          Many state online portals (such as driving license learner tests, ration card portal uploads, or police verification documents) only permit JPG or PNG uploads with a file limit under 200 KB. This tool extracts your multi-page PDF marksheets and identity cards into separate clean images ready for submission.
        </p>
      </div>

    </div>
  );
}
