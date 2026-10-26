import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';
import {
  Sparkles,
  RefreshCw,
  Eye,
  Save,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Edit3,
  Search,
  Maximize2,
  X,
  Check,
  Copy,
  Sliders,
  Layers
} from 'lucide-react';

type SarkariCategory = SarkariItem['category'];

export interface ThumbnailBannerSpec {
  mainHeadingLeft: string;
  redBadgeText: string;
  secondHeading: string;
  yellowBannerPrefix: string;
  yellowBannerHighlight: string;
  fourIcons: [string, string, string, string] | any;
  laptopTitle: string;
  laptopSubtitle: string;
  footerLine1: string;
  footerLine2: string;
  ctaButtonText?: 'APPLY NOW' | 'CHECK RESULT' | 'READ DETAILS';
  ctaText?: 'APPLY NOW' | 'CHECK RESULT' | 'READ DETAILS';
  postType?: 'Job' | 'Admission' | 'Result' | 'Scheme' | 'Service' | 'Guide';
}

interface AdminThumbnailGeneratorStudioProps {
  initialPostId?: string;
  onThumbnailSaved?: (postId: string, thumbnailUrl: string, spec?: ThumbnailBannerSpec) => void;
}

const TEST_PRESETS = [
  {
    key: 'test-jkssb-class-iv',
    badge: 'Test Case 1 • Recruitment',
    id: 'jkssb-class-iv-recruitment-2026',
    title: 'JKSSB Class IV Online Form 2026 – Apply Online for UT & District Cadre Posts',
    category: 'jkssb' as SarkariCategory,
    department: 'J&K Services Selection Board (JKSSB)',
    postType: 'Job' as const,
    shortDescription:
      'Jammu and Kashmir Services Selection Board (JKSSB) invites online applications for Class IV recruitment across UT, Divisional, and District Cadre posts. Get easy and reliable CSC form filling, document upload, and fee payment assistance.',
    postDate: '18/05/2026',
    startDate: '20/05/2026',
    lastDate: '25/06/2026',
    totalPosts: '3,200 Posts',
    advertisementNo: '04 of 2026',
    applicationStatus: 'Open' as const,
    pregeneratedUrl: '/thumbnails/test-jkssb-class-iv.png'
  },
  {
    key: 'test-ignou-admission',
    badge: 'Test Case 2 • Admission',
    id: 'ignou-admission-2026-july-session',
    title: 'IGNOU Admission 2026 – Online Registration for UG, PG, Diploma & Certificate Programmes',
    category: 'admissions' as SarkariCategory,
    department: 'Indira Gandhi National Open University (IGNOU)',
    postType: 'Admission' as const,
    shortDescription:
      'Indira Gandhi National Open University (IGNOU) has started fresh admission registration for Undergraduate, Postgraduate, Diploma, and Certificate programmes. Apply through CSC DOST for course selection, document upload, and registration receipt.',
    postDate: '15/05/2026',
    startDate: '15/05/2026',
    lastDate: '30/06/2026',
    totalPosts: 'UG / PG / Diploma Seats',
    advertisementNo: 'IGNOU-ADM-2026',
    applicationStatus: 'Open' as const,
    pregeneratedUrl: '/thumbnails/test-ignou-admission.png'
  },
  {
    key: 'test-jkbose-result',
    badge: 'Test Case 3 • Result',
    id: 'jkbose-class-10-result-2026',
    title: 'JKBOSE Class 10th Annual Regular Result 2026 – Check Roll Number & Name Wise Marks',
    category: 'results' as SarkariCategory,
    department: 'J&K Board of School Education (JKBOSE)',
    postType: 'Result' as const,
    shortDescription:
      'Jammu and Kashmir Board of School Education (JKBOSE) has declared the Class 10th (Matriculation) Annual Regular Examination Result. Check marksheet status, roll number lookup, and download your digital scorecard.',
    postDate: '19/05/2026',
    startDate: '19/05/2026',
    lastDate: 'Declared / Active',
    totalPosts: 'Annual Regular Batch',
    advertisementNo: 'JKBOSE-X-2026',
    applicationStatus: 'Result' as const,
    pregeneratedUrl: '/thumbnails/test-jkbose-class-10-result.png'
  }
];

export default function AdminThumbnailGeneratorStudio({
  initialPostId,
  onThumbnailSaved
}: AdminThumbnailGeneratorStudioProps) {
  const [mode, setMode] = useState<'edit' | 'create'>('edit');
  const [postsList, setPostsList] = useState<SarkariItem[]>(() => [...SARKARI_DATA]);
  const [savedThumbnailsMap, setSavedThumbnailsMap] = useState<Record<string, any>>({});
  const [postSearchQuery, setPostSearchQuery] = useState('');

  // Selected or New Post Data Fields
  const [postId, setPostId] = useState<string>(initialPostId || SARKARI_DATA[0]?.id || 'jkssb-class-iv-recruitment-2026');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<SarkariCategory>('jkssb');
  const [department, setDepartment] = useState<string>('J&K Services Selection Board (JKSSB)');
  const [postType, setPostType] = useState<'Job' | 'Admission' | 'Result' | 'Scheme' | 'Service' | 'Guide'>('Job');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [postDate, setPostDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [lastDate, setLastDate] = useState<string>('');
  const [totalPosts, setTotalPosts] = useState<string>('');
  const [advertisementNo, setAdvertisementNo] = useState<string>('');
  const [officialLink, setOfficialLink] = useState<string>('');
  const [applicationStatus, setApplicationStatus] = useState<'Open' | 'Result' | 'Informational' | 'Closed'>('Open');

  // Thumbnail Generator State
  const [format, setFormat] = useState<'png' | 'webp'>('png');
  const [useAiExtraction, setUseAiExtraction] = useState<boolean>(true);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('/thumbnails/test-jkssb-class-iv.png');
  const [savedThumbnailUrl, setSavedThumbnailUrl] = useState<string | null>(null);
  const [currentSpec, setCurrentSpec] = useState<ThumbnailBannerSpec | null>(null);
  const [showSpecEditor, setShowSpecEditor] = useState<boolean>(false);
  const [showReferenceComparison, setShowReferenceComparison] = useState<boolean>(false);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState<boolean>(false);
  const [isCustomUploaded, setIsCustomUploaded] = useState<boolean>(false);

  // Loading & Feedback States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSavingThumbnail, setIsSavingThumbnail] = useState<boolean>(false);
  const [isSavingPost, setIsSavingPost] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const customFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved thumbnails map & custom posts from server on mount
  const fetchSavedThumbnailsAndPosts = async () => {
    try {
      const res = await fetch('/api/thumbnails/map');
      if (!res.ok) return;
      const data = await res.json();
      if (data.thumbnails) {
        setSavedThumbnailsMap(data.thumbnails);
      }
      if (Array.isArray(data.customPosts) && data.customPosts.length > 0) {
        const merged = [...SARKARI_DATA];
        for (const cp of data.customPosts) {
          const idx = merged.findIndex(item => item.id === cp.id);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], ...cp };
          } else {
            merged.unshift(cp);
          }
        }
        setPostsList(merged);
      }
    } catch (err) {
      console.warn('[ThumbnailStudio] Failed to load thumbnail map:', err);
    }
  };

  useEffect(() => {
    fetchSavedThumbnailsAndPosts();
  }, []);

  // Infer department & postType from a SarkariItem
  const populateFromSarkariItem = (item: SarkariItem) => {
    setPostId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setShortDescription(item.shortInfo || '');
    setPostDate(item.postDate || '');
    setStartDate(item.startDate || '');
    setLastDate(item.lastDate || '');
    setTotalPosts(item.totalPosts || '');
    setAdvertisementNo(item.advertisementNo || '');
    setOfficialLink(item.officialLink || '');
    setIsCustomUploaded(false);

    // Department inference
    if (item.department) {
      setDepartment(item.department);
    } else if (item.category === 'jkssb') {
      setDepartment('J&K Services Selection Board (JKSSB)');
    } else if (item.category === 'ssc_jobs') {
      setDepartment('Staff Selection Commission (SSC)');
    } else if (item.category === 'rrb_jobs') {
      setDepartment('Railway Recruitment Boards (RRB)');
    } else if (item.category === 'army_jobs') {
      setDepartment('Indian Army (joinindianarmy.nic.in)');
    } else if (item.category === 'cluster_univ') {
      setDepartment('Cluster University Srinagar (CUS)');
    } else if (item.category === 'admissions' || item.category === 'exam_forms') {
      setDepartment(
        item.title.toUpperCase().includes('IGNOU')
          ? 'Indira Gandhi National Open University (IGNOU)'
          : 'University of Kashmir / Academic Portal'
      );
    } else if (item.category === 'nta') {
      setDepartment('National Testing Agency (NTA)');
    } else {
      setDepartment(SARKARI_CATEGORIES[item.category]?.label || 'Official Recruiting Authority');
    }

    // Post Type inference
    if (item.postType) {
      setPostType(item.postType as any);
    } else if (item.category === 'results' || item.category === 'answer_keys') {
      setPostType('Result');
      setApplicationStatus('Result');
    } else if (item.category === 'admissions' || item.category === 'cluster_univ') {
      setPostType('Admission');
      setApplicationStatus('Open');
    } else if (item.category === 'syllabus') {
      setPostType('Guide');
      setApplicationStatus('Informational');
    } else {
      setPostType('Job');
      setApplicationStatus('Open');
    }

    const saved = savedThumbnailsMap[item.id];
    if (saved && saved.thumbnailUrl) {
      setSavedThumbnailUrl(saved.thumbnailUrl);
      setPreviewDataUrl(saved.thumbnailUrl);
      if (saved.spec) setCurrentSpec(saved.spec);
    } else if (item.thumbnailUrl) {
      setSavedThumbnailUrl(item.thumbnailUrl);
      setPreviewDataUrl(item.thumbnailUrl);
    } else {
      setSavedThumbnailUrl(`/api/thumbnails/post/${item.id}.png`);
      setPreviewDataUrl(`/api/thumbnails/post/${item.id}.png?t=${Date.now()}`);
    }
  };

  // Load initial post on mount
  useEffect(() => {
    const targetId = initialPostId || SARKARI_DATA[0]?.id;
    const found = postsList.find(p => p.id === targetId) || postsList[0];
    if (found) {
      populateFromSarkariItem(found);
    }
  }, [initialPostId]);

  const filteredPosts = useMemo(() => {
    const q = postSearchQuery.trim().toLowerCase();
    if (!q) return postsList;
    return postsList.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.advertisementNo || '').toLowerCase().includes(q)
    );
  }, [postsList, postSearchQuery]);

  // ACTION 1 & 2: Generate / Regenerate 2048x677 Thumbnail
  const handleGenerateThumbnail = async (useCustomOverrides = false, overridePayload?: any) => {
    setIsGenerating(true);
    setStatusMessage(null);
    setIsCustomUploaded(false);

    try {
      const payload = overridePayload || {
        id: postId,
        title: title || 'JKSSB Class IV Recruitment 2026',
        category,
        department,
        postType,
        shortDescription,
        importantDates: {
          postDate,
          startDate,
          lastDate
        },
        applicationStatus,
        totalPosts,
        advertisementNo,
        format,
        useAi: useAiExtraction,
        useCustomSpec: useCustomOverrides && Boolean(currentSpec),
        customSpec: useCustomOverrides ? currentSpec : undefined
      };

      const res = await fetch('/api/thumbnails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate thumbnail');
      }

      setPreviewDataUrl(data.dataUrl);
      if (data.spec) {
        setCurrentSpec(data.spec);
      }

      setStatusMessage({
        type: 'success',
        text: `Generated 2048 × 677 px (${data.format.toUpperCase()}) thumbnail matching the JKSSB Class IV Master Reference.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error generating 2048×677 thumbnail.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Load one of the 3 mandatory test cases immediately
  const handleLoadTestPreset = async (preset: (typeof TEST_PRESETS)[number]) => {
    setMode('edit');
    setPostId(preset.id);
    setTitle(preset.title);
    setCategory(preset.category);
    setDepartment(preset.department);
    setPostType(preset.postType);
    setShortDescription(preset.shortDescription);
    setPostDate(preset.postDate);
    setStartDate(preset.startDate);
    setLastDate(preset.lastDate);
    setTotalPosts(preset.totalPosts);
    setAdvertisementNo(preset.advertisementNo);
    setApplicationStatus(preset.applicationStatus);
    setIsCustomUploaded(false);
    setPreviewDataUrl(`${preset.pregeneratedUrl}?t=${Date.now()}`);

    await handleGenerateThumbnail(false, {
      id: preset.id,
      title: preset.title,
      category: preset.category,
      department: preset.department,
      postType: preset.postType,
      shortDescription: preset.shortDescription,
      importantDates: {
        postDate: preset.postDate,
        startDate: preset.startDate,
        lastDate: preset.lastDate
      },
      applicationStatus: preset.applicationStatus,
      totalPosts: preset.totalPosts,
      advertisementNo: preset.advertisementNo,
      format,
      useAi: false
    });
  };

  // ACTION 4: Save Thumbnail (Uploads to Supabase Storage + Associates with Post)
  const handleSaveThumbnail = async () => {
    if (!title.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a Post Title before saving the thumbnail.'
      });
      return;
    }

    setIsSavingThumbnail(true);
    setStatusMessage(null);

    try {
      const effectivePostId =
        postId.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 60);

      const res = await fetch('/api/thumbnails/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: effectivePostId,
          title,
          category,
          department,
          postType,
          shortDescription,
          importantDates: { postDate, startDate, lastDate },
          applicationStatus,
          format,
          spec: currentSpec,
          isCustomUpload: isCustomUploaded,
          customImageDataUrl: isCustomUploaded ? previewDataUrl : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save thumbnail');
      }

      setPostId(data.postId);
      setSavedThumbnailUrl(data.thumbnailUrl);
      await fetchSavedThumbnailsAndPosts();

      if (onThumbnailSaved) {
        onThumbnailSaved(data.postId, data.thumbnailUrl, data.spec);
      }

      setStatusMessage({
        type: 'success',
        text: `Saved 2048 × 677 px thumbnail to Supabase Storage & linked to post "${effectivePostId}".`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save thumbnail.'
      });
    } finally {
      setIsSavingThumbnail(false);
    }
  };

  // ACTION 5: Upload Custom Thumbnail (Normalizes to 2048 x 677 px)
  const handleCustomThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        // Resize / normalize on client canvas to exact 2048 x 677 so preview is immediate
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 677;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#092556';
          ctx.fillRect(0, 0, 2048, 677);
          const scale = Math.max(2048 / img.width, 677 / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = (2048 - drawW) / 2;
          const drawY = (677 - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          const normalizedDataUrl = canvas.toDataURL(
            format === 'webp' ? 'image/webp' : 'image/png',
            0.95
          );
          setPreviewDataUrl(normalizedDataUrl);
          setIsCustomUploaded(true);
          setStatusMessage({
            type: 'info',
            text: `Custom image "${file.name}" loaded and normalized to exact 2048 × 677 px. Click "Save Thumbnail" to store in Supabase.`
          });
        }
      };
      img.src = resultUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save / Publish Full Post + Associated 2048x677 Thumbnail
  const handleSavePostWithThumbnail = async () => {
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Post Title is required.' });
      return;
    }

    setIsSavingPost(true);
    setStatusMessage(null);

    try {
      const effectiveSlug =
        postId.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 60);

      // 1. Save thumbnail first so the post gets a permanent 2048x677 URL
      const thumbRes = await fetch('/api/thumbnails/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: effectiveSlug,
          title,
          category,
          department,
          postType,
          shortDescription,
          importantDates: { postDate, startDate, lastDate },
          applicationStatus,
          format,
          spec: currentSpec,
          isCustomUpload: isCustomUploaded,
          customImageDataUrl: isCustomUploaded ? previewDataUrl : undefined
        })
      });
      const thumbData = await thumbRes.json();
      const finalThumbUrl =
        thumbData?.thumbnailUrl || `/api/thumbnails/post/${effectiveSlug}.png`;

      // 2. Save post record
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: effectiveSlug,
          title,
          category,
          department,
          postType,
          applicationStatus,
          shortDescription,
          postDate,
          startDate,
          lastDate,
          totalPosts,
          advertisementNo,
          officialLink,
          thumbnailUrl: finalThumbUrl,
          thumbnailSpec: currentSpec
        })
      });

      const postData = await postRes.json();
      if (!postRes.ok || !postData.success) {
        throw new Error(postData.error || 'Failed to save post');
      }

      setPostId(effectiveSlug);
      setSavedThumbnailUrl(finalThumbUrl);
      await fetchSavedThumbnailsAndPosts();

      setStatusMessage({
        type: 'success',
        text: `Post "${title}" and its 2048 × 677 px thumbnail have been saved and published.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save post and thumbnail.'
      });
    } finally {
      setIsSavingPost(false);
    }
  };

  // Download 2048x677 Thumbnail directly
  const handleDownloadThumbnail = () => {
    const a = document.createElement('a');
    a.href = previewDataUrl;
    const cleanId = (postId || 'csc-dost-thumbnail').replace(/[^a-z0-9-_]/gi, '-');
    a.download = `${cleanId}-2048x677.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Start Creating a Blank New Post
  const handleStartNewPost = () => {
    const todayStr = new Date().toLocaleDateString('en-GB');
    setMode('create');
    setPostId(`csc-post-${Date.now().toString().slice(-5)}`);
    setTitle('');
    setCategory('jkssb');
    setDepartment('J&K Services Selection Board (JKSSB)');
    setPostType('Job');
    setShortDescription('');
    setPostDate(todayStr);
    setStartDate(todayStr);
    setLastDate('30/06/2026');
    setTotalPosts('Various Posts');
    setAdvertisementNo('');
    setOfficialLink('https://jkssb.nic.in');
    setApplicationStatus('Open');
    setSavedThumbnailUrl(null);
    setIsCustomUploaded(false);
  };

  return (
    <div className="space-y-5">
      {/* ==================================================================== */}
      {/* TOP HEADER BAR & 3 MANDATORY TEST CASE PRESETS                       */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#092556] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#FACC15]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#102A43]">
                  CSC DOST — Master Reference AI Thumbnail Generator &amp; Post Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                  2048 × 677 px (3.025:1)
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  JKSSB Class IV Master Layout Locked
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Every generated thumbnail strictly follows the approved JKSSB Class IV master design reference at exact 2048 × 677 resolution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'edit'
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F6F8FC] text-[#102A43] border-[#E2E8F0] hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Existing Post ({postsList.length})</span>
            </button>

            <button
              type="button"
              onClick={handleStartNewPost}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'create'
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F6F8FC] text-[#102A43] border-[#E2E8F0] hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Post</span>
            </button>
          </div>
        </div>

        {/* Verified Master Reference Test Cases Strip */}
        <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Verified 2048×677 Test Cases:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-3xl">
            {TEST_PRESETS.map(preset => {
              const isSelected = postId === preset.id;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleLoadTestPreset(preset)}
                  className={`px-3 py-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#092556] text-white border-[#092556] shadow-xs'
                      : 'bg-[#F6F8FC] hover:bg-blue-50/60 text-[#102A43] border-[#E2E8F0]'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        isSelected ? 'text-[#FACC15]' : 'text-[#2563EB]'
                      }`}
                    >
                      {preset.badge}
                    </div>
                    <div className="text-xs font-bold truncate">{preset.title.split('–')[0].trim()}</div>
                  </div>
                  <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#FACC15]' : 'text-[#64748B]'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-[#16A34A]'
              : statusMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-[#DC2626]'
              : 'bg-blue-50 border-blue-200 text-[#2563EB]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MAIN 2-COLUMN WORKSPACE: POST INPUT FORM (LEFT) + THUMBNAIL STUDIO   */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (5 cols): Post Selector + Automatic Post Data Form */}
        <div className="xl:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          {mode === 'edit' && (
            <div className="space-y-2 pb-4 border-b border-[#E2E8F0]">
              <label className="block text-xs font-bold text-[#102A43]">
                Select Existing Post to Edit / Generate Thumbnail
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postSearchQuery}
                  onChange={e => setPostSearchQuery(e.target.value)}
                  placeholder="Search post by title, category, or advt no..."
                  className="w-full pl-8 pr-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs text-[#102A43] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>
              <select
                aria-label="Select Post"
                value={postId}
                onChange={e => {
                  const found = postsList.find(p => p.id === e.target.value);
                  if (found) populateFromSarkariItem(found);
                }}
                className="w-full px-3 py-2.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                {filteredPosts.map(p => (
                  <option key={p.id} value={p.id}>
                    [{SARKARI_CATEGORIES[p.category]?.label || p.category}] {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{mode === 'create' ? 'New Post Data Input' : 'Post Data Input (Auto-Read)'}</span>
            </h3>
            <span className="text-[11px] font-mono text-[#64748B]">ID: {postId}</span>
          </div>

          <div className="space-y-3">
            {/* 1. Post Title */}
            <div>
              <label className="block text-[11px] font-semibold text-[#102A43] mb-1">
                1. Post Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., JKSSB Class IV Recruitment 2026 – Apply Online"
                className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:bg-white focus:border-[#2563EB]"
              />
            </div>

            {/* 2. Category & 3. Post Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#102A43] mb-1">
                  2. Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SarkariCategory)}
                  className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                >
                  {Object.entries(SARKARI_CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#102A43] mb-1">
                  3. Post Type
                </label>
                <select
                  value={postType}
                  onChange={e => setPostType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="Job">Job / Recruitment</option>
                  <option value="Admission">Admission / University</option>
                  <option value="Result">Result / Marks / Answer Key</option>
                  <option value="Scheme">Government Scheme</option>
                  <option value="Service">CSC E-Service</option>
                  <option value="Guide">Knowledge Hub / Guide</option>
                </select>
              </div>
            </div>

            {/* 4. Department / Organization & 5. Application Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#102A43] mb-1">
                  4. Department / Organization
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g., J&K Services Selection Board (JKSSB)"
                  className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs text-[#102A43] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#102A43] mb-1">
                  5. Application Status (Controls Red CTA)
                </label>
                <select
                  value={applicationStatus}
                  onChange={e => setApplicationStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="Open">Active Application → CTA: APPLY NOW</option>
                  <option value="Result">Result Post → CTA: CHECK RESULT</option>
                  <option value="Informational">Informational Post → CTA: READ DETAILS</option>
                  <option value="Closed">Closed Post → CTA: READ DETAILS</option>
                </select>
              </div>
            </div>

            {/* 6. Short Description */}
            <div>
              <label className="block text-[11px] font-semibold text-[#102A43] mb-1">
                6. Short Description
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Concise 2-3 sentence summary of the notification..."
                className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs text-[#102A43] focus:outline-none focus:bg-white focus:border-[#2563EB]"
              />
            </div>

            {/* 7. Important Dates & Posts */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-2.5 py-1.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-lg text-xs text-[#102A43]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                  Last Date
                </label>
                <input
                  type="text"
                  value={lastDate}
                  onChange={e => setLastDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-2.5 py-1.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-lg text-xs text-[#102A43]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                  Total Posts / Seats
                </label>
                <input
                  type="text"
                  value={totalPosts}
                  onChange={e => setTotalPosts(e.target.value)}
                  placeholder="e.g. 3200 Posts"
                  className="w-full px-2.5 py-1.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-lg text-xs text-[#102A43]"
                />
              </div>
            </div>

            {/* Save Post + Thumbnail Button */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#102A43] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useAiExtraction}
                  onChange={e => setUseAiExtraction(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span>Smart AI Title Summarizer</span>
              </label>

              <button
                type="button"
                onClick={handleSavePostWithThumbnail}
                disabled={isSavingPost}
                className="px-4 py-2.5 bg-[#102A43] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingPost ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{mode === 'create' ? 'Publish Post & Thumbnail' : 'Update Post & Thumbnail'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): 2048x677 Preview Canvas + 5 Action Buttons + Optional Banner Text Customizer */}
        <div className="xl:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Top Bar of Preview Panel */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                Live Master Reference Preview
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-[#102A43]">
                2048 × 677 px
              </span>
              {isCustomUploaded && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Custom Uploaded (Normalized 2048×677)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Format Toggle: PNG / WebP */}
              <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F6F8FC] p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    format === 'png' ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-[#64748B]'
                  }`}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('webp')}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    format === 'webp' ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-[#64748B]'
                  }`}
                >
                  WebP
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowReferenceComparison(prev => !prev)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F6F8FC] hover:bg-slate-100 text-[11px] font-semibold text-[#102A43] flex items-center gap-1 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{showReferenceComparison ? 'Hide Master Reference' : 'Compare Master Reference'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadThumbnail}
                className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F6F8FC] hover:bg-slate-100 text-[11px] font-semibold text-[#102A43] flex items-center gap-1 cursor-pointer"
                title="Download 2048x677 image file"
              >
                <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* 2048 x 677 Aspect-Ratio Locked Preview Frame */}
          <div className="relative rounded-xl overflow-hidden border-2 border-[#E2E8F0] bg-[#092556] shadow-sm group">
            <div className="w-full" style={{ aspectRatio: '2048 / 677' }}>
              <img
                src={previewDataUrl}
                alt={`2048x677 Thumbnail Preview for ${title}`}
                className="w-full h-full object-contain block select-none"
              />
            </div>

            {isGenerating && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                <RefreshCw className="w-7 h-7 animate-spin text-[#FACC15]" />
                <span className="text-xs font-bold tracking-wide">
                  Rendering 2048 × 677 px Master Reference Thumbnail...
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowFullPreviewModal(true)}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-950 text-white text-xs font-semibold flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Inspect Full 2048×677 Resolution</span>
            </button>
          </div>

          {/* Optional Side-by-Side Comparison with Uploaded JKSSB Class IV Master Reference */}
          {showReferenceComparison && (
            <div className="p-3 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                <span>UPLOADED MASTER DESIGN REFERENCE (JKSSB CLASS IV)</span>
                <span>2048 × 677 RATIO</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-[#CBD5E1]" style={{ aspectRatio: '2048 / 677' }}>
                <img
                  src="/assets/aistudio/JKSSB_Class_IV_CSC_Application_Assistance_60a01722.png"
                  alt="Uploaded Master Design Reference"
                  className="w-full h-full object-fill block"
                />
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ALL 5 MANDATORY ADMIN PANEL THUMBNAIL ACTION BUTTONS             */}
          {/* ================================================================ */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {/* 1. Generate Thumbnail */}
            <button
              type="button"
              onClick={() => handleGenerateThumbnail(false)}
              disabled={isGenerating}
              className="py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Generate Thumbnail</span>
            </button>

            {/* 2. Regenerate Thumbnail */}
            <button
              type="button"
              onClick={() => handleGenerateThumbnail(showSpecEditor)}
              disabled={isGenerating}
              className="py-2.5 px-3 rounded-xl bg-[#102A43] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Thumbnail</span>
            </button>

            {/* 3. Preview Thumbnail */}
            <button
              type="button"
              onClick={() => setShowFullPreviewModal(true)}
              className="py-2.5 px-3 rounded-xl bg-[#F6F8FC] hover:bg-slate-100 text-[#102A43] border border-[#E2E8F0] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>Preview Thumbnail</span>
            </button>

            {/* 4. Save Thumbnail */}
            <button
              type="button"
              onClick={handleSaveThumbnail}
              disabled={isSavingThumbnail || isGenerating}
              className="py-2.5 px-3 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSavingThumbnail ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <Save className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Save Thumbnail</span>
            </button>

            {/* 5. Upload Custom Thumbnail */}
            <button
              type="button"
              onClick={() => customFileInputRef.current?.click()}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-[#F6F8FC] hover:bg-slate-100 text-[#102A43] border border-[#E2E8F0] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>Upload Custom Thumbnail</span>
            </button>
            <input
              ref={customFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleCustomThumbnailUpload}
              className="hidden"
            />
          </div>

          {/* Saved Thumbnail URL & Fine-Tune Banner Text Accordion */}
          <div className="pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-semibold text-[#64748B]">Associated Post Thumbnail URL:</span>
              <code className="text-[11px] font-mono bg-[#F6F8FC] border border-[#E2E8F0] px-2 py-0.5 rounded text-[#102A43] truncate max-w-[260px] sm:max-w-[340px]">
                {savedThumbnailUrl || `/api/thumbnails/post/${postId}.png`}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + (savedThumbnailUrl || `/api/thumbnails/post/${postId}.png`)
                  );
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="p-1 text-[#64748B] hover:text-[#2563EB] rounded cursor-pointer"
                title="Copy full thumbnail URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSpecEditor(prev => !prev)}
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSpecEditor ? 'Hide Banner Text Overrides' : 'Customize Extracted Banner Text'}</span>
            </button>
          </div>

          {/* Optional Fine-Tune Banner Copy Drawer */}
          {showSpecEditor && currentSpec && (
            <div className="p-4 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#102A43]">
                  Fine-Tune Master Template Text Zones (Exact Layout Preserved)
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerateThumbnail(true)}
                  className="px-3 py-1 bg-[#2563EB] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Apply Text Changes to Preview
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Navy Dept Heading (Left)
                  </label>
                  <input
                    type="text"
                    value={currentSpec.mainHeadingLeft}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, mainHeadingLeft: e.target.value.toUpperCase() })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Red Category Badge
                  </label>
                  <input
                    type="text"
                    value={currentSpec.redBadgeText}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, redBadgeText: e.target.value.toUpperCase() })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#D91B1B]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Second Large Headline
                  </label>
                  <input
                    type="text"
                    value={currentSpec.secondHeading}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, secondHeading: e.target.value.toUpperCase() })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Yellow Banner Bold Highlight
                  </label>
                  <input
                    type="text"
                    value={currentSpec.yellowBannerHighlight}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, yellowBannerHighlight: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Laptop Screen Title
                  </label>
                  <input
                    type="text"
                    value={currentSpec.laptopTitle}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, laptopTitle: e.target.value.toUpperCase() })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Bottom Red CTA Button
                  </label>
                  <select
                    value={currentSpec.ctaButtonText || currentSpec.ctaText || 'APPLY NOW'}
                    onChange={e =>
                      setCurrentSpec({
                        ...currentSpec,
                        ctaButtonText: e.target.value as any,
                        ctaText: e.target.value as any
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-[#D91B1B]"
                  >
                    <option value="APPLY NOW">APPLY NOW</option>
                    <option value="CHECK RESULT">CHECK RESULT</option>
                    <option value="READ DETAILS">READ DETAILS</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Footer Supporting Text (Line 2)
                  </label>
                  <input
                    type="text"
                    value={currentSpec.footerLine2}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, footerLine2: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#102A43]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#64748B] mb-1">
                    Laptop Screen Subtitle
                  </label>
                  <input
                    type="text"
                    value={currentSpec.laptopSubtitle}
                    onChange={e =>
                      setCurrentSpec({ ...currentSpec, laptopSubtitle: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#102A43]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FULL-RESOLUTION 2048 x 677 LIGHTBOX MODAL                            */}
      {/* ==================================================================== */}
      {showFullPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowFullPreviewModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-6xl w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-[#E2E8F0]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#102A43]">
                  2048 × 677 px High-Resolution Master Thumbnail Preview
                </h3>
                <p className="text-xs text-[#64748B]">
                  Aspect Ratio: 2048:677 (3.025:1) • Format: {format.toUpperCase()} • Post: {title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadThumbnail}
                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 2048×677 {format.toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullPreviewModal(false)}
                  className="p-2 rounded-xl bg-[#F6F8FC] hover:bg-slate-200 text-[#102A43] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#092556]" style={{ aspectRatio: '2048 / 677' }}>
              <img
                src={previewDataUrl}
                alt="Full 2048x677 Thumbnail Preview"
                className="w-full h-full object-contain block"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
