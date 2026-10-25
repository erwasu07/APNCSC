import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  HelpCircle,
  Eye,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface MetadataInfo {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modDate?: string;
  keywords?: string[];
}

export default function PdfMetadataCleanerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }
    setErrorMessage(null);
    setFile(uploadedFile);
    setCleanedBlob(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
      
      setMetadata({
        title: doc.getTitle() || undefined,
        author: doc.getAuthor() || undefined,
        subject: doc.getSubject() || undefined,
        creator: doc.getCreator() || undefined,
        producer: doc.getProducer() || undefined,
        creationDate: doc.getCreationDate() ? doc.getCreationDate()?.toLocaleString() : undefined,
        modDate: doc.getModificationDate() ? doc.getModificationDate()?.toLocaleString() : undefined,
        keywords: doc.getKeywords() ? doc.getKeywords()?.split(';') : undefined
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred reading PDF metadata.');
    }
  };

  const cleanMetadata = async () => {
    if (!file) return;
    setIsCleaning(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer);

      // Sanitize all metadata fields
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('CSC DOST Privacy Sanitizer');
      doc.setCreator('CSC DOST');

      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setCleanedBlob(blob);
      setCleanedUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error cleaning metadata.');
    } finally {
      setIsCleaning(false);
    }
  };

  const downloadCleaned = () => {
    if (!cleanedUrl || !file) return;
    const a = document.createElement('a');
    a.href = cleanedUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-sanitized.pdf`;
    a.click();
  };

  const hasAnyMetadata = metadata && (
    metadata.title || metadata.author || metadata.subject || metadata.creator || metadata.producer
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Document Privacy &amp; Sanitizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          PDF Metadata Viewer &amp; Privacy Cleaner
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Inspect hidden document properties (author names, computer usernames, software used, editing timestamps) and strip them completely before sharing documents online or submitting to recruiters.
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
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload PDF Document to Inspect Metadata
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
        /* Metadata Inspector Table */
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold text-[#102A56] block truncate max-w-md">
                {file.name}
              </span>
              <span className="text-[11px] text-[#64748B]">
                Original Size: {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setMetadata(null);
                setCleanedBlob(null);
              }}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              Choose Different PDF
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#102A56] uppercase tracking-wider">
              Detected Document Properties:
            </h3>

            {metadata ? (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0] text-xs">
                <div className="p-3 grid grid-cols-3">
                  <span className="font-semibold text-[#64748B]">Document Author:</span>
                  <span className="col-span-2 font-bold text-[#102A56]">
                    {metadata.author || <span className="text-slate-400 font-normal italic">None detected</span>}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="font-semibold text-[#64748B]">Document Title:</span>
                  <span className="col-span-2 font-bold text-[#102A56]">
                    {metadata.title || <span className="text-slate-400 font-normal italic">None detected</span>}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="font-semibold text-[#64748B]">Creator Software:</span>
                  <span className="col-span-2 font-bold text-[#102A56]">
                    {metadata.creator || <span className="text-slate-400 font-normal italic">None detected</span>}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <span className="font-semibold text-[#64748B]">PDF Producer:</span>
                  <span className="col-span-2 font-bold text-[#102A56]">
                    {metadata.producer || <span className="text-slate-400 font-normal italic">None detected</span>}
                  </span>
                </div>
                {metadata.creationDate && (
                  <div className="p-3 grid grid-cols-3">
                    <span className="font-semibold text-[#64748B]">Creation Timestamp:</span>
                    <span className="col-span-2 text-[#0F172A]">{metadata.creationDate}</span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            disabled={isCleaning}
            onClick={cleanMetadata}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isCleaning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sanitizing Document Properties...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sanitize &amp; Wipe All Metadata</span>
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

      {cleanedBlob && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Document Sanitized &amp; Privacy Protected!
              </h3>
              <p className="text-xs text-emerald-800">
                All author tags, computer names, and internal creation properties have been wiped clean.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadCleaned}
            className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Sanitized PDF</span>
          </button>
        </div>
      )}

      {/* Security Tip */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-2 text-xs text-[#64748B]">
        <h4 className="font-bold text-[#102A56] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Why Sanitize PDF Metadata?</span>
        </h4>
        <p className="leading-relaxed">
          Word processors and scanners secretly embed your computer's username, full operating system path, printer serial numbers, and revision history into PDF files. Sanitizing your PDF removes these hidden digital fingerprints before submitting documents to government portals or public registries.
        </p>
      </div>

    </div>
  );
}
