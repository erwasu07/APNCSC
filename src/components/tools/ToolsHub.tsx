import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Minimize2, 
  RefreshCw, 
  Scissors, 
  FileImage, 
  Files, 
  Split, 
  FileArchive, 
  FileDown, 
  Camera, 
  PenTool, 
  ShieldAlert, 
  RotateCw,
  Stamp,
  Layers,
  CheckCircle2,
  Lock,
  Zap,
  HelpCircle
} from 'lucide-react';
import { TOOLS_LIST, TOOLS_CATEGORIES, ToolItem } from './toolsData';
import ImageCompressorTool from './ImageCompressorTool';
import ImageToPdfTool from './ImageToPdfTool';
import PdfMergeTool from './PdfMergeTool';
import PdfSplitTool from './PdfSplitTool';
import PdfCompressorTool from './PdfCompressorTool';
import BackgroundRemoverTool from './BackgroundRemoverTool';
import PassportPhotoTool from './PassportPhotoTool';
import ImageSignatureResizerTool from './ImageSignatureResizerTool';
import PdfToImageTool from './PdfToImageTool';
import ImageConverterTool from './ImageConverterTool';
import PdfWatermarkRotateTool from './PdfWatermarkRotateTool';
import PdfMetadataCleanerTool from './PdfMetadataCleanerTool';

interface ToolsHubProps {
  initialToolId?: string;
  onSelectTool?: (toolId: string | null) => void;
}

export default function ToolsHub({ initialToolId, onSelectTool }: ToolsHubProps) {
  const [activeToolId, setActiveToolId] = useState<string | null>(initialToolId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (initialToolId) {
      setActiveToolId(initialToolId);
    }
  }, [initialToolId]);

  // Sync with browser URL / hash
  const selectTool = (toolId: string | null) => {
    setActiveToolId(toolId);
    if (onSelectTool) onSelectTool(toolId);

    if (toolId) {
      window.location.hash = `#tools/${toolId}`;
    } else {
      window.location.hash = '#tools';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter(tool => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch = 
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.keywords.some(k => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredTools = useMemo(() => {
    return TOOLS_LIST.filter(t => t.featured);
  }, []);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Minimize2': return Minimize2;
      case 'RefreshCw': return RefreshCw;
      case 'Scissors': return Scissors;
      case 'FileImage': return FileImage;
      case 'Files': return Files;
      case 'Split': return Split;
      case 'FileArchive': return FileArchive;
      case 'FileDown': return FileDown;
      case 'Camera': return Camera;
      case 'Signature': return PenTool;
      case 'Crop': return Scissors;
      case 'RotateCw': return RotateCw;
      case 'ShieldAlert': return ShieldAlert;
      default: return Sparkles;
    }
  };

  // Render individual tool view if one is active
  if (activeToolId) {
    const currentTool = TOOLS_LIST.find(t => t.id === activeToolId);
    return (
      <div className="w-full max-w-7xl mx-auto px-0 md:px-6 py-0 md:py-10 space-y-0 md:space-y-8 animate-fade-in">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between bg-white px-4 py-3.5 md:px-0 md:py-0 border-b border-[#E2E8F0] md:pb-4">
          <button
            type="button"
            onClick={() => selectTool(null)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0759E8] hover:text-[#0B1F49] bg-[#EAF4FF] px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Online Tools</span>
          </button>

          <span className="text-xs text-[#64748B] hidden sm:inline font-medium">
            Category: <strong className="text-[#0B1F49]">{currentTool?.categoryLabel || 'Utility'}</strong>
          </span>
        </div>

        {/* Dynamic Tool Component Loading */}
        <div className="pt-2">
          {activeToolId === 'image-compressor' && <ImageCompressorTool />}
          {(activeToolId === 'image-resizer') && <ImageSignatureResizerTool initialMode="image" />}
          {(activeToolId === 'signature-resizer' || activeToolId === 'image-signature-resizer') && <ImageSignatureResizerTool initialMode="signature" />}
          {activeToolId === 'image-to-pdf' && <ImageToPdfTool />}
          {activeToolId === 'pdf-to-image' && <PdfToImageTool />}
          {activeToolId === 'pdf-merge' && <PdfMergeTool />}
          {activeToolId === 'pdf-split' && <PdfSplitTool />}
          {activeToolId === 'pdf-compressor' && <PdfCompressorTool />}
          {activeToolId === 'background-remover' && <BackgroundRemoverTool />}
          {activeToolId === 'passport-photo-maker' && <PassportPhotoTool />}
          {(activeToolId === 'jpg-to-png') && <ImageConverterTool initialFormat="image/png" />}
          {(activeToolId === 'png-to-jpg') && <ImageConverterTool initialFormat="image/jpeg" />}
          {(activeToolId === 'image-converter') && <ImageConverterTool />}
          {activeToolId === 'pdf-watermark-rotate' && <PdfWatermarkRotateTool />}
          {activeToolId === 'pdf-metadata-cleaner' && <PdfMetadataCleanerTool />}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-0 md:px-6 py-0 md:py-10 space-y-0 md:space-y-12 animate-fade-in">
      
      {/* ================================================================ */}
      {/* 1. HERO & SEARCH */}
      {/* ================================================================ */}
      <section className="text-center max-w-4xl mx-auto px-4 py-6 md:p-0 bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 space-y-4">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EAF4FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#0759E8]">
          <Zap className="w-3.5 h-3.5 text-[#0759E8]" />
          <span>100% Client-Side Processing • No Sign-Up Needed</span>
        </div>

        <h1 className="text-2xl sm:text-5xl font-black text-[#0B1F49] tracking-tight leading-tight">
          Free Online Tools — Fast, Simple &amp; Secure
        </h1>

        <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
          Compress images, create PDFs, resize photos, remove backgrounds and manage documents — all in one place.
        </p>

        {/* Universal Tool Search Input */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-5 h-5 text-[#64748B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. compress 20kb, merge pdf, passport photo, resize signature)..."
              className="w-full pl-12 pr-20 py-3.5 bg-[#F8FAFC] md:bg-white border border-[#E2E8F0] focus:border-[#0759E8] rounded-xl md:rounded-2xl text-xs sm:text-sm text-[#14213D] placeholder-[#64748B] shadow-2xs focus:ring-4 focus:ring-[#EAF4FF] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#14213D] px-2 py-1 bg-slate-100 rounded-lg cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

      </section>

      {/* ================================================================ */}
      {/* 2. ZERO-UPLOAD PRIVACY GUARANTEE BANNER */}
      {/* ================================================================ */}
      <section className="bg-emerald-50/80 border-b md:border border-emerald-200/90 rounded-none md:rounded-2xl px-4 py-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
              Files are processed 100% locally on your device
            </h3>
            <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
              Your confidential marksheets, biometric photos, and candidate signatures are never uploaded to any remote server or stored anywhere.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 rounded-lg text-emerald-900 text-[11px] font-bold shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Server Storage</span>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. CATEGORY FILTER TABS & TOOLS LIST */}
      {/* ================================================================ */}
      <section className="bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 space-y-0 md:space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 md:p-0 md:pb-1 border-b border-[#E2E8F0] md:border-0 no-scrollbar text-xs font-bold">
          {TOOLS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#0759E8] text-white border-[#0759E8] shadow-xs'
                  : 'bg-white text-[#14213D] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools List (Open Full-Width Rows on Mobile, Cards on md:) */}
        <div className="divide-y divide-[#E2E8F0] md:divide-y-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-5">
          {filteredTools.map((tool) => {
            const IconComponent = getToolIcon(tool.iconName);
            return (
              <div
                key={tool.id}
                onClick={() => selectTool(tool.id)}
                className="bg-white border-0 md:border border-[#E2E8F0] hover:border-[#0759E8] rounded-none md:rounded-2xl px-4 py-4.5 md:p-6 flex flex-col justify-between transition-all hover:bg-[#F8FAFC] md:hover:bg-white md:hover:shadow-xs group cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF4FF] text-[#0759E8] flex items-center justify-center group-hover:bg-[#0759E8] group-hover:text-white transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {tool.badge && (
                      <span className="text-[11px] font-bold text-[#0759E8] bg-[#EAF4FF] px-2.5 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-0.5">
                      {tool.categoryLabel}
                    </span>
                    <h3 className="text-base font-bold text-[#14213D] group-hover:text-[#0759E8] transition-colors leading-snug">
                      {tool.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0759E8]">
                  <span>Launch Free Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-2">
            <p className="text-sm font-bold text-[#102A56]">No tools found matching "{searchQuery}"</p>
            <p className="text-xs text-[#64748B]">Try searching for "compress", "pdf", "signature", or "photo".</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs font-bold text-[#2563EB] underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ================================================================ */}
      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      {/* ================================================================ */}
      <section className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-6 sm:p-8 space-y-6 shadow-none md:shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B1F49] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0759E8]" />
            <span>Frequently Asked Questions About CSC DOST Tools</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Clear facts on security, portal compatibility, and file limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[#64748B] leading-relaxed">
          <div className="space-y-1.5 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <h4 className="font-bold text-[#14213D] text-sm">Are these tools completely free to use?</h4>
            <p>
              Yes. All image compressors, PDF converters, and signature resizers on this portal are 100% free of charge with zero watermarks and no registration required.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <h4 className="font-bold text-[#14213D] text-sm">Are my documents uploaded to any remote server?</h4>
            <p>
              No. All operations (compressing images, merging PDFs, generating passport photos) execute in your browser's local sandbox memory using HTML5 Canvas and native JavaScript libraries.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <h4 className="font-bold text-[#0F172A] text-sm">Will these resized files work for JKSSB, SSC, and UPSC?</h4>
            <p>
              Yes. Every tool includes pre-configured dimension and KB presets specifically tuned to the exact verification requirements of major Indian recruitment portals.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <h4 className="font-bold text-[#0F172A] text-sm">Can I use these tools on my mobile phone?</h4>
            <p>
              Absolutely. The entire tools hub is fully responsive and supports touch drag-and-drop, photo uploads directly from your smartphone camera or gallery, and instant downloads.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
