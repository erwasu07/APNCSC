import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  HelpCircle,
  FileText,
  RefreshCw,
  Stamp
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export default function PdfWatermarkRotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rotationDegrees, setRotationDegrees] = useState<number>(90); // 90, 180, 270
  const [applyRotation, setApplyRotation] = useState<boolean>(true);

  // Watermark Settings
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('CSC DOST VERIFIED COPY');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.25);
  const [watermarkAngle, setWatermarkAngle] = useState<number>(-45);
  const [watermarkColor, setWatermarkColor] = useState<'slate' | 'red' | 'blue'>('slate');

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a valid PDF document.');
      return;
    }
    setErrorMessage(null);
    setFile(uploadedFile);
    setResultBlob(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: false });
      setTotalPages(doc.getPageCount());
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while loading PDF.');
    }
  };

  const processPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      // Determine watermark RGB
      let fontColor = rgb(0.4, 0.4, 0.4);
      if (watermarkColor === 'red') fontColor = rgb(0.85, 0.15, 0.15);
      if (watermarkColor === 'blue') fontColor = rgb(0.1, 0.35, 0.85);

      for (const page of pages) {
        // Rotate page if requested
        if (applyRotation) {
          const currentRot = page.getRotation().angle;
          page.setRotation(degrees((currentRot + rotationDegrees) % 360));
        }

        // Draw Watermark if enabled
        if (enableWatermark && watermarkText.trim()) {
          const { width, height } = page.getSize();
          const textSize = Math.min(width, height) / 10;
          const textWidth = helveticaBold.widthOfTextAtSize(watermarkText, textSize);

          page.drawText(watermarkText, {
            x: (width - textWidth) / 2,
            y: height / 2,
            size: textSize,
            font: helveticaBold,
            color: fontColor,
            opacity: watermarkOpacity,
            rotate: degrees(watermarkAngle),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while processing PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-processed.pdf`;
    a.click();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs font-bold text-[#2563EB] mb-2">
          <Stamp className="w-3.5 h-3.5" />
          <span>Security Watermark &amp; Page Orientation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
          PDF Watermark &amp; Page Rotator
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl leading-relaxed">
          Fix upside-down scanned documents by rotating 90°, 180°, or 270°, or stamp security watermarks (e.g., "CSC DOST VERIFIED", "CONFIDENTIAL", "FOR KYC ONLY") across your documents.
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
            <RotateCw className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#102A56]">
            Upload PDF Document to Rotate or Watermark
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
        /* Settings Workspace */
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
            <div>
              <span className="text-xs font-bold text-[#102A56] block truncate max-w-md">
                {file.name}
              </span>
              <span className="text-[11px] text-[#64748B]">
                {totalPages} Pages • {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResultBlob(null);
              }}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
            >
              Choose Different PDF
            </button>
          </div>

          {/* Section 1: Page Rotation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="apply-rot"
                checked={applyRotation}
                onChange={(e) => setApplyRotation(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB]"
              />
              <label htmlFor="apply-rot" className="text-xs font-bold text-[#102A56] cursor-pointer">
                Rotate Pages Clockwise:
              </label>
            </div>

            {applyRotation && (
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { deg: 90, label: '90° Clockwise' },
                  { deg: 180, label: '180° Flip Upside-Down' },
                  { deg: 270, label: '270° (90° Counter)' },
                ].map((r) => (
                  <button
                    key={r.deg}
                    type="button"
                    onClick={() => setRotationDegrees(r.deg)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      rotationDegrees === r.deg
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#102A56]'
                        : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Watermark */}
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-wm"
                checked={enableWatermark}
                onChange={(e) => setEnableWatermark(e.target.checked)}
                className="w-4 h-4 rounded text-[#2563EB] accent-[#2563EB]"
              />
              <label htmlFor="enable-wm" className="text-xs font-bold text-[#102A56] cursor-pointer">
                Stamp Security Text Watermark:
              </label>
            </div>

            {enableWatermark && (
              <div className="space-y-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <div>
                  <label className="block text-xs font-bold text-[#102A56] mb-1">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="e.g. CSC DOST VERIFIED COPY"
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['CSC DOST VERIFIED', 'FOR APPLICATION ONLY', 'CONFIDENTIAL', 'SAMPLE COPY'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setWatermarkText(chip)}
                        className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-[11px] text-[#64748B] hover:text-[#0F172A] hover:border-[#2563EB] cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">
                      Color Tone
                    </label>
                    <select
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A]"
                    >
                      <option value="slate">Neutral Grey (Subtle)</option>
                      <option value="red">Red Stamp</option>
                      <option value="blue">Official Blue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">
                      Opacity: {Math.round(watermarkOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      className="w-full accent-[#2563EB] cursor-pointer mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#102A56] mb-1">
                      Angle: {watermarkAngle}°
                    </label>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="5"
                      value={watermarkAngle}
                      onChange={(e) => setWatermarkAngle(Number(e.target.value))}
                      className="w-full accent-[#2563EB] cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isProcessing || (!applyRotation && !enableWatermark)}
            onClick={processPdf}
            className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying Changes to {totalPages} Pages...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process PDF ({totalPages} Pages)</span>
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

      {resultBlob && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Processed PDF Ready!
              </h3>
              <p className="text-xs text-emerald-800">
                Rotated &amp; watermarked • Size: {(resultBlob.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={downloadResult}
              className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Updated PDF</span>
            </button>

            {resultUrl && (
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
              >
                Preview in Browser
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
