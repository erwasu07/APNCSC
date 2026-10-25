import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Split, 
  CheckCircle2, 
  AlertCircle, 
  Archive, 
  FileText, 
  RefreshCw, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultPdfBlob, setResultPdfBlob] = useState<Blob | null>(null);
  const [customFilename, setCustomFilename] = useState('csc-dost-extracted');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse page range string (e.g. "1-3, 5, 8-10") into array of 1-based indices
  const parsePageRange = (input: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',').map(p => p.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(maxPages, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            pages.add(i);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pages.add(p);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }

    setErrorMessage(null);
    setFile(uploadedFile);
    setResultPdfBlob(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
      const count = doc.getPageCount();
      setTotalPages(count);
      const defaultRange = count === 1 ? '1' : `1-${Math.min(3, count)}`;
      setRangeInput(defaultRange);
      setSelectedPages(parsePageRange(defaultRange, count));
    } catch (err: any) {
      setErrorMessage(err.message?.includes('encrypt') 
        ? 'This PDF is password-protected. Please unlock it before extracting.' 
        : 'Could not parse PDF. File may be corrupted.'
      );
    }
  };

  const handleRangeChange = (val: string) => {
    setRangeInput(val);
    const parsed = parsePageRange(val, totalPages);
    setSelectedPages(parsed);
  };

  const togglePage = (pageNum: number) => {
    let next: number[];
    if (selectedPages.includes(pageNum)) {
      next = selectedPages.filter(p => p !== pageNum);
    } else {
      next = [...selectedPages, pageNum].sort((a, b) => a - b);
    }
    setSelectedPages(next);
    setRangeInput(next.join(', '));
  };

  // Option 1: Extract as Single Combined PDF
  const extractAsSinglePdf = async () => {
    if (!file || selectedPages.length === 0) {
      setErrorMessage('Please select at least one valid page to extract.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const newDoc = await PDFDocument.create();

      // Convert 1-based page numbers to 0-based indices
      const indices = selectedPages.map(p => p - 1);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach(p => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultPdfBlob(blob);
      setResultPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while splitting PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Option 2: Extract each page as individual PDF and download ZIP
  const extractAsZip = async () => {
    if (!file || selectedPages.length === 0) {
      setErrorMessage('Please select at least one valid page to extract.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const zip = new JSZip();
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);

      for (const pageNum of selectedPages) {
        const singlePageDoc = await PDFDocument.create();
        const [copied] = await singlePageDoc.copyPages(srcDoc, [pageNum - 1]);
        singlePageDoc.addPage(copied);
        const bytes = await singlePageDoc.save();
        zip.file(`page-${pageNum}.pdf`, bytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${customFilename || 'extracted-pages'}.zip`;
      a.click();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while packaging ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSinglePdf = () => {
    if (!resultPdfUrl) return;
    const a = document.createElement('a');
    a.href = resultPdfUrl;
    a.download = `${customFilename || 'extracted-document'}.pdf`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <Split className="w-3.5 h-3.5" />
          <span>Page Range &amp; ZIP Extraction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          PDF Split &amp; Page Extractor
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Extract specific pages or page ranges (e.g., 1-3, 5, 8-10) from large gazettes, application notifications, or marksheets. Download as a single extracted PDF or as individual pages in a ZIP archive.
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
            <Split className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload PDF Document to Split
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
        /* Document Control & Page Selection */
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
                setResultPdfBlob(null);
              }}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer self-start sm:self-auto"
            >
              Choose Different PDF
            </button>
          </div>

          {/* Range String Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#102A56]">
              Enter Page Range (e.g. 1-3, 5, 8-10):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => handleRangeChange(e.target.value)}
                placeholder="1-3, 5, 8"
                className="w-full max-w-md px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
              />
              <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">
                {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>

          {/* Visual Page Selector Grid */}
          <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#102A56] block">
              Quick Click Page Selector (Total {totalPages} Pages):
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-48 overflow-y-auto p-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isSelected = selectedPages.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePage(p)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    p. {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output Filename */}
          <div>
            <label className="block text-xs font-bold text-[#102A56] mb-1">Output File Name</label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="w-full max-w-md px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isProcessing || selectedPages.length === 0}
              onClick={extractAsSinglePdf}
              className="py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Extraction...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Extract as Single PDF ({selectedPages.length} Pages)</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isProcessing || selectedPages.length === 0}
              onClick={extractAsZip}
              className="py-3 bg-white hover:bg-[#F8FAFC] disabled:opacity-40 text-[#102A56] border border-[#E2E8F0] hover:border-[#CBD5E1] text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Archive className="w-4 h-4 text-[#2563EB]" />
              <span>Download Individual Pages as ZIP</span>
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
      {resultPdfBlob && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Extracted PDF Ready for Download!
              </h3>
              <p className="text-xs text-emerald-800">
                {selectedPages.length} Pages Extracted • Size: {(resultPdfBlob.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadSinglePdf}
              className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download {customFilename || 'extracted'}.pdf</span>
            </button>

            {resultPdfUrl && (
              <a
                href={resultPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
              >
                Preview Extracted PDF
              </a>
            )}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>How to Extract Gazette &amp; Notification Pages</span>
        </h4>
        <p className="leading-relaxed">
          Government selection lists (such as JKSSB merit lists or Army rally circulars) often span 100+ pages. Type your specific page number (e.g. <code>42</code>) or range (e.g. <code>1-3, 42</code>) to isolate only your relevant certificate and result pages.
        </p>
      </div>

    </div>
  );
}
