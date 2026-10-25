export interface ToolItem {
  id: string;
  name: string;
  shortDescription: string;
  category: 'image' | 'pdf' | 'photo-signature' | 'document';
  categoryLabel: string;
  iconName: string;
  featured?: boolean;
  popular?: boolean;
  badge?: string;
  keywords: string[];
  specs?: string;
}

export const TOOLS_CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'image', label: 'Image Tools' },
  { id: 'pdf', label: 'PDF Tools' },
  { id: 'photo-signature', label: 'Photo & Signature Tools' },
  { id: 'document', label: 'Document Utilities' },
] as const;

export const TOOLS_LIST: ToolItem[] = [
  // 1. Image Compressor
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Compress JPG, PNG & WebP images to exact target sizes (20KB, 50KB, 100KB, 200KB) with zero quality loss.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'Minimize2',
    featured: true,
    popular: true,
    badge: 'Popular',
    keywords: ['compress image', 'reduce image size', '20kb photo', '50kb photo', 'jpg compressor', 'png compressor', 'target kb'],
    specs: 'Supports JPG, PNG, WebP up to 30MB'
  },
  // 2. Image Resizer
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    shortDescription: 'Resize photos to custom width and height in pixels with aspect ratio lock and target file size limits.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'Crop',
    featured: true,
    keywords: ['resize image', 'scale photo', 'pixel resizer', 'width height change', 'photo dimensions'],
    specs: 'Custom pixel dimensions'
  },
  // 3. Image to PDF
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    shortDescription: 'Convert and combine multiple JPG, PNG, and WebP photos into a single clean A4 or Letter PDF.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileImage',
    featured: true,
    popular: true,
    badge: 'Essential',
    keywords: ['jpg to pdf', 'image to pdf', 'photo to pdf', 'merge images to pdf', 'multiple pictures to pdf', 'a4 pdf'],
    specs: 'Drag & reorder, rotate pages'
  },
  // 4. PDF to Image
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    shortDescription: 'Render pages of any PDF document into crisp high-resolution JPG or PNG images with ZIP download.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileDown',
    keywords: ['pdf to jpg', 'pdf to png', 'extract images from pdf', 'pdf page to image'],
    specs: 'Adjustable resolution (150/300 DPI)'
  },
  // 5. PDF Merge
  {
    id: 'pdf-merge',
    name: 'PDF Merge',
    shortDescription: 'Combine multiple PDF documents, marksheets, and certificates into one ordered file securely.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Files',
    featured: true,
    popular: true,
    badge: 'Fast',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'combine marksheets', 'pdf joiner'],
    specs: 'Visual reordering & page count'
  },
  // 6. PDF Split
  {
    id: 'pdf-split',
    name: 'PDF Split',
    shortDescription: 'Extract specific pages or page ranges (e.g. 1-3, 5, 8-10) and download as single PDF or ZIP.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Split',
    popular: true,
    keywords: ['split pdf', 'extract pages', 'separate pdf', 'pdf range extract', 'download pdf pages as zip'],
    specs: 'Custom page ranges supported'
  },
  // 7. PDF Compressor
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    shortDescription: 'Optimize and reduce PDF document size with stream compression and scanned document rasterization.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileArchive',
    featured: true,
    keywords: ['compress pdf', 'reduce pdf size', 'optimize pdf', 'smaller pdf', 'scanned pdf compression'],
    specs: 'Low, Medium, High presets'
  },
  // 8. Background Remover
  {
    id: 'background-remover',
    name: 'Background Remover',
    shortDescription: 'Smart browser-based cutout tool to remove backgrounds, create transparent PNGs, or apply clean white studio backdrops.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'Scissors',
    featured: true,
    popular: true,
    badge: '100% Private',
    keywords: ['remove bg', 'transparent background', 'photo background white', 'cutout', 'passport background change'],
    specs: 'Client-side processing'
  },
  // 9. Passport Photo Maker
  {
    id: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    shortDescription: 'Format passport photos to official 35×45 mm or 2×2 inch standards with A4 multi-photo printable sheets (6/8/12/16 copies).',
    category: 'photo-signature',
    categoryLabel: 'Photo & Signature Tools',
    iconName: 'Camera',
    featured: true,
    popular: true,
    badge: 'Govt Standard',
    keywords: ['passport photo', '35x45mm', '2x2 inch', 'passport size photo sheet', 'print passport photos', 'ssc photo', 'jkssb photo'],
    specs: 'No facial distortion, printable A4 sheet'
  },
  // 10. Signature Resizer
  {
    id: 'signature-resizer',
    name: 'Signature Resizer',
    shortDescription: 'Crop excess whitespace, remove phone paper shadows, and scale signatures to 10–20 KB for government exams.',
    category: 'photo-signature',
    categoryLabel: 'Photo & Signature Tools',
    iconName: 'Signature',
    featured: true,
    popular: true,
    badge: '10-20 KB',
    keywords: ['signature resizer', 'crop signature', 'jkssb signature', 'ssc signature 10 to 20 kb', 'army signature', 'clean signature background'],
    specs: 'Whitens background & crops borders'
  },
  // 11. JPG to PNG Converter
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    shortDescription: 'Convert JPG photos and certificates into lossless PNG format with maximum clarity.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'RefreshCw',
    keywords: ['jpg to png', 'convert jpg to png', 'jpeg to png', 'lossless image conversion'],
    specs: 'Lossless quality export'
  },
  // 12. PNG to JPG Converter
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    shortDescription: 'Convert PNG graphics and transparent images into standard JPG files with solid white background.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'RefreshCw',
    keywords: ['png to jpg', 'convert png to jpg', 'transparent to jpg', 'png to jpeg'],
    specs: 'Automatic background fill'
  },
  // Additional Utilities
  {
    id: 'pdf-watermark-rotate',
    name: 'PDF Watermark & Page Rotator',
    shortDescription: 'Add custom security text watermarks (e.g. CSC DOST VERIFIED) and rotate upside-down pages 90°/180°/270°.',
    category: 'document',
    categoryLabel: 'Document Utilities',
    iconName: 'RotateCw',
    keywords: ['rotate pdf', 'watermark pdf', 'add text to pdf', 'fix upside down pdf'],
    specs: 'Custom opacity, angle & angle rotation'
  },
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Metadata Cleaner',
    shortDescription: 'Inspect hidden metadata (author, title, creation date, software) and remove personal identifiers before submitting online.',
    category: 'document',
    categoryLabel: 'Document Utilities',
    iconName: 'ShieldAlert',
    keywords: ['pdf metadata', 'remove author from pdf', 'clean pdf privacy', 'inspect pdf properties'],
    specs: 'One-click sanitize'
  }
];
