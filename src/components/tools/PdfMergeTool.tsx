import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Files, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface LoadedPdf {
  id: string;
  file: File;
  pageCount: number;
  sizeKb: number;
}

export default function PdfMergeTool() {
  const [pdfFiles, setPdfFiles] = useState<LoadedPdf[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [customFilename, setCustomFilename] = useState('csc-dost-merged-document');
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedPdfBlob, setMergedPdfBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const valid = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (valid.length === 0) {
      setErrorMessage('Please upload valid PDF documents (.pdf).');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    const loadedList: LoadedPdf[] = [];
    const errors: string[] = [];

    for (const f of valid) {
      try {
        const buffer = await f.arrayBuffer();
        // Load with pdf-lib to verify and count pages
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
        loadedList.push({
          id: Math.random().toString(36).substring(2, 9),
          file: f,
          pageCount: doc.getPageCount(),
          sizeKb: Math.round(f.size / 1024)
        });
      } catch (err: any) {
        if (err.message?.includes('encrypt') || err.message?.includes('password')) {
          errors.push(`"${f.name}" is password-protected/encrypted. Please decrypt it first.`);
        } else {
          errors.push(`"${f.name}" is corrupted or unreadable.`);
        }
      }
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    }

    setPdfFiles(prev => [...prev, ...loadedList]);
    setMergedPdfBlob(null);
    setIsAnalyzing(false);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setPdfFiles(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index >= pdfFiles.length - 1) return;
    setPdfFiles(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
    setMergedPdfBlob(null);
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage('Please upload at least 2 PDF documents to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMessage(null);

    try {
      const mergedDoc = await PDFDocument.create();

      for (const item of pdfFiles) {
        const buffer = await item.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer);
        const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach(p => mergedDoc.addPage(p));
      }

      const mergedBytes = await mergedDoc.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      setMergedPdfBlob(blob);
      setMergedPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while merging PDF files.');
    } finally {
      setIsMerging(false);
    }
  };

  const downloadMerged = () => {
    if (!mergedPdfUrl) return;
    const a = document.createElement('a');
    a.href = mergedPdfUrl;
    a.download = `${customFilename || 'merged-document'}.pdf`;
    a.click();
  };

  const totalPages = pdfFiles.reduce((acc, f) => acc + f.pageCount, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <Files className="w-3.5 h-3.5" />
          <span>Local Document Stitching</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          PDF Merge Tool
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Combine multiple PDF certificates, resumes, marks cards, and official forms into one unified PDF. Fast, secure, and processed completely in your browser.
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
          <Files className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#102A56]">
          Click or Drag &amp; Drop PDF Files to Merge
        </h3>
        <p className="text-xs text-[#64748B] mt-1">
          Select two or more PDF files. You can arrange their final sequence below.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2563EB] p-4 bg-blue-50 rounded-xl">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Analyzing document page counts and structures...</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Reordering List */}
      {pdfFiles.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-xs font-bold text-[#102A56] block">
                {pdfFiles.length} Documents Selected • {totalPages} Total Pages
              </span>
              <span className="text-[11px] text-[#64748B]">
                Documents will be merged in the top-to-bottom sequence shown below
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#102A56]">Output Name:</label>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:ring-2 focus:ring-[#2563EB] w-48"
              />
            </div>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {pdfFiles.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-tight">
                      {item.file.name}
                    </h4>
                    <span className="text-[11px] text-[#64748B]">
                      {item.pageCount} page{item.pageCount > 1 ? 's' : ''} • {item.sizeKb} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveUp(idx)}
                    className="p-1.5 text-slate-500 hover:text-[#102A56] disabled:opacity-30 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Move higher"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === pdfFiles.length - 1}
                    onClick={() => moveDown(idx)}
                    className="p-1.5 text-slate-500 hover:text-[#102A56] disabled:opacity-30 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Move lower"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePdf(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Remove from merge list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3">
            <button
              type="button"
              disabled={isMerging || pdfFiles.length < 2}
              onClick={mergePdfs}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isMerging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Merging {pdfFiles.length} Documents into Single PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Merge {pdfFiles.length} PDFs into One ({totalPages} Pages)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Merged Success Panel */}
      {mergedPdfBlob && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                PDF Documents Merged Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Total Pages: {totalPages} • Total Merged Size: {(mergedPdfBlob.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadMerged}
              className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download {customFilename || 'merged-document'}.pdf</span>
            </button>

            {mergedPdfUrl && (
              <a
                href={mergedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
              >
                Open in New Tab
              </a>
            )}
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Safe &amp; Confidential Processing</span>
        </h4>
        <p>
          Unlike external online converters, your PDF documents are never uploaded to any remote server or cloud database. All merging happens directly inside your web browser's isolated memory sandbox.
        </p>
      </div>

    </div>
  );
}
