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
  // 1. Image Tools
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Compress JPG, PNG & WebP images to exact target sizes (20KB, 50KB, 100KB, 200KB) with zero server upload.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'Minimize2',
    featured: true,
    popular: true,
    badge: 'High Accuracy',
    keywords: ['compress image', 'reduce image size', '20kb photo', '50kb photo', 'jpg compressor', 'png compressor', 'webp compressor', 'target kb'],
    specs: 'Supports JPG, PNG, WebP up to 30MB'
  },
  {
    id: 'image-converter',
    name: 'Image Format Converter',
    shortDescription: 'Convert between JPG, PNG, and WebP instantly with transparency and custom background options.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'RefreshCw',
    keywords: ['convert image', 'png to jpg', 'jpg to png', 'webp to jpg', 'webp to png', 'transparent to white'],
    specs: 'Batch conversion supported'
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    shortDescription: 'Smart browser-based cutout tool to remove backgrounds, create transparent PNGs, or apply clean white/blue studio backdrops.',
    category: 'image',
    categoryLabel: 'Image Tools',
    iconName: 'Scissors',
    featured: true,
    popular: true,
    badge: '100% Private',
    keywords: ['remove bg', 'transparent background', 'photo background white', 'cutout', 'passport background change'],
    specs: 'Client-side processing'
  },

  // 2. PDF Tools
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Maker',
    shortDescription: 'Combine multiple JPG, PNG, and WebP photos into a single clean PDF with A4/Letter sizing and margin control.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileImage',
    featured: true,
    popular: true,
    badge: 'Most Popular',
    keywords: ['jpg to pdf', 'image to pdf', 'photo to pdf', 'merge images to pdf', 'multiple pictures to pdf', 'a4 pdf'],
    specs: 'Drag & reorder, rotate pages'
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge Tool',
    shortDescription: 'Combine multiple PDF documents, marksheets, and receipts into one ordered file securely.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Files',
    featured: true,
    popular: true,
    badge: 'Fast & Secure',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'combine marksheets', 'pdf joiner'],
    specs: 'Visual reordering & page count'
  },
  {
    id: 'pdf-split',
    name: 'PDF Split & Extract',
    shortDescription: 'Extract specific pages or page ranges (e.g. 1-3, 5, 8-10) and download as a single PDF or individual ZIP.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'Split',
    popular: true,
    keywords: ['split pdf', 'extract pages', 'separate pdf', 'pdf range extract', 'download pdf pages as zip'],
    specs: 'Custom page ranges supported'
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor & Optimizer',
    shortDescription: 'Optimize and reduce PDF document size with honest compression presets, stream optimization, and scanned raster mode.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileArchive',
    featured: true,
    keywords: ['compress pdf', 'reduce pdf size', 'optimize pdf', 'smaller pdf', 'scanned pdf compression'],
    specs: 'Low, Medium, High presets'
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image Converter',
    shortDescription: 'Render pages of any PDF document into crisp high-resolution JPG or PNG images with ZIP download.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'FileDown',
    keywords: ['pdf to jpg', 'pdf to png', 'extract images from pdf', 'pdf page to image'],
    specs: 'Adjustable resolution (150/300 DPI)'
  },
  {
    id: 'pdf-watermark-rotate',
    name: 'PDF Watermark & Page Rotator',
    shortDescription: 'Add custom security text watermarks (e.g. CSC DOST VERIFIED, COPY) and rotate upside-down pages 90°/180°/270°.',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    iconName: 'RotateCw',
    keywords: ['rotate pdf', 'watermark pdf', 'add text to pdf', 'fix upside down pdf'],
    specs: 'Custom opacity, angle & angle rotation'
  },

  // 3. Photo & Signature Tools
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
  {
    id: 'image-signature-resizer',
    name: 'Image & Signature Resizer',
    shortDescription: 'Meet exact recruitment portal dimensions & file sizes (JKSSB, SSC, Army Agniveer, RRB) with white-clean signature mode.',
    category: 'photo-signature',
    categoryLabel: 'Photo & Signature Tools',
    iconName: 'Signature',
    featured: true,
    popular: true,
    badge: 'Portal Presets',
    keywords: ['signature resizer', 'crop signature', 'jkssb signature', 'ssc signature 10 to 20 kb', 'army photo resize', 'clear signature background'],
    specs: 'Includes whitespace crop & contrast boost'
  },

  // 4. Document Utilities
  {
    id: 'pdf-metadata-cleaner',
    name: 'PDF Metadata & Privacy Cleaner',
    shortDescription: 'Inspect hidden metadata (author, title, creation date, software) and remove personal identifiers before submitting online.',
    category: 'document',
    categoryLabel: 'Document Utilities',
    iconName: 'ShieldAlert',
    keywords: ['pdf metadata', 'remove author from pdf', 'clean pdf privacy', 'inspect pdf properties'],
    specs: 'One-click sanitize'
  }
];
