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
  Layers,
  Share2,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import {
  ThumbnailSpec,
  CATEGORY_THEMES,
  CategoryThemeConfig,
  SupportedCategoryStyle,
  buildDeterministicThumbnailSpec,
  renderStandaloneMasterThumbnailSvg,
  extractSpecificPostRole,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT
} from '../utils/thumbnailSpecHelper';

interface AdminThumbnailGeneratorStudioProps {
  initialPostId?: string;
  onThumbnailSaved?: (postId: string, thumbnailUrl: string, spec?: ThumbnailSpec) => void;
}

const APPROVED_PRESETS = [
  {
    key: 'jkssb-class-iv',
    badge: 'JKSSB Approved Style',
    id: 'jkssb-class-iv-recruitment-2026',
    title: 'JKSSB Class IV Online Form 2026 – Apply Online for UT & District Cadre Posts',
    category: 'jkssb',
    department: 'J&K Services Selection Board (JKSSB)',
    orgTitle: 'JKSSB',
    postBadgeTitle: 'CLASS IV',
    eligibilityValue: '10th / 12th Pass',
    lastDateValue: '25/06/2026',
    howToApplyValue: 'Visit CSC DOST'
  },
  {
    key: 'army-tes-57',
    badge: 'Indian Army Approved Style',
    id: 'army-tes-57-course-2026',
    title: 'Indian Army 10+2 Technical Entry Scheme (TES-57 Course)',
    category: 'army_jobs',
    department: 'Join Indian Army (joinindianarmy.nic.in)',
    orgTitle: 'INDIAN ARMY',
    postBadgeTitle: 'TES-57 (10+2)',
    eligibilityValue: '10+2 with PCM (60%)',
    lastDateValue: '13/06/2026',
    howToApplyValue: 'Visit CSC DOST'
  },
  {
    key: 'rrb-ntpc',
    badge: 'Railways / RRB Approved Style',
    id: 'rrb-ntpc-undergraduate-cen-07-2026',
    title: 'RRB NTPC Undergraduate (CEN 07/2026) – Online Application',
    category: 'rrb_jobs',
    department: 'Railway Recruitment Boards (RRB)',
    orgTitle: 'RAILWAY / RRB',
    postBadgeTitle: 'NTPC (UG) CEN 07/2026',
    eligibilityValue: '12th Pass with Typing',
    lastDateValue: '20/07/2026',
    howToApplyValue: 'Visit CSC DOST'
  },
  {
    key: 'ssc-chsl',
    badge: 'SSC Approved Style',
    id: 'ssc-chsl-10-plus-2-exam-2026-tier1',
    title: 'SSC Combined Higher Secondary (10+2) Level Examination 2026 Tier-1',
    category: 'ssc_jobs',
    department: 'Staff Selection Commission (SSC)',
    orgTitle: 'STAFF SELECTION COMM.',
    postBadgeTitle: 'CHSL (10+2)',
    eligibilityValue: '12th Pass Any Stream',
    lastDateValue: '08/07/2026',
    howToApplyValue: 'Visit CSC DOST'
  },
  {
    key: 'ku-exam-forms',
    badge: 'Kashmir University Approved Style',
    id: 'ku-bg-1st-2nd-sem-exam-form-2026',
    title: 'University of Kashmir BG 1st & 2nd Semester Examination Form Notification',
    category: 'exam_forms',
    department: 'University of Kashmir (kashmiruniversity.net)',
    orgTitle: 'KASHMIR UNIVERSITY',
    postBadgeTitle: 'BG 1ST & 2ND SEM',
    eligibilityValue: 'Registered UG Students',
    lastDateValue: '30/06/2026',
    howToApplyValue: 'Visit CSC DOST'
  },
  {
    key: 'cus-cluster-univ',
    badge: 'Cluster University Approved Style',
    id: 'cus-bed-supplementary-4th-sem-exam-dyd-2026',
    title: 'Cluster University Srinagar B.Ed Supplementary 4th Sem Exam DYD 2026',
    category: 'cluster_univ',
    department: 'Cluster University Srinagar (cusrinagar.edu.in)',
    orgTitle: 'CLUSTER UNIVERSITY',
    postBadgeTitle: 'B.ED 4TH SEM (DYD)',
    eligibilityValue: 'B.Ed Enrolled Candidates',
    lastDateValue: '15/06/2026',
    howToApplyValue: 'Visit CSC DOST'
  }
];

export default function AdminThumbnailGeneratorStudio({
  initialPostId,
  onThumbnailSaved
}: AdminThumbnailGeneratorStudioProps) {
  const [mode, setMode] = useState<'edit' | 'create'>('edit');
  const [postsList, setPostsList] = useState<SarkariItem[]>(() => [...SARKARI_DATA]);
  const [postSearchQuery, setPostSearchQuery] = useState('');

  // Selected or New Post Data Fields
  const [postId, setPostId] = useState<string>(
    initialPostId || SARKARI_DATA[0]?.id || 'jkssb-class-iv-recruitment-2026'
  );
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('jkssb');
  const [department, setDepartment] = useState<string>('J&K Services Selection Board (JKSSB)');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [lastDate, setLastDate] = useState<string>('');
  const [eligibility, setEligibility] = useState<string>('');
  const [officialLink, setOfficialLink] = useState<string>('');

  // 1200x630 Specification Overrides
  const [styleOverride, setStyleOverride] = useState<SupportedCategoryStyle | 'auto'>('auto');
  const [orgTitle, setOrgTitle] = useState<string>('JKSSB');
  const [postBadgeTitle, setPostBadgeTitle] = useState<string>('CLASS IV');
  const [eligibilityLabel, setEligibilityLabel] = useState<string>('Eligibility:');
  const [eligibilityValue, setEligibilityValue] = useState<string>('See notification');
  const [lastDateLabel, setLastDateLabel] = useState<string>('Last date:');
  const [lastDateValue, setLastDateValue] = useState<string>('Check website');
  const [howToApplyLabel, setHowToApplyLabel] = useState<string>('How to apply:');
  const [howToApplyValue, setHowToApplyValue] = useState<string>('Visit CSC DOST');
  const [logoOption, setLogoOption] = useState<'preset' | 'custom' | 'placeholder'>('preset');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('');

  // Custom Full Thumbnail Upload
  const [isCustomUploaded, setIsCustomUploaded] = useState<boolean>(false);
  const [customImageDataUrl, setCustomImageDataUrl] = useState<string | null>(null);

  // Preview Tabs: 'thumbnail' | 'facebook' | 'whatsapp'
  const [previewTab, setPreviewTab] = useState<'thumbnail' | 'facebook' | 'whatsapp'>('thumbnail');

  // Loading & Feedback
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const customFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Active Category Style Calculation
  const effectiveCategoryStyle: SupportedCategoryStyle = useMemo(() => {
    if (styleOverride !== 'auto') {
      return styleOverride;
    }
    const catLower = (category || '').toLowerCase();
    const titleUpper = (title || '').toUpperCase();
    if (catLower === 'jkssb' || titleUpper.includes('JKSSB')) return 'jkssb';
    if (catLower === 'army_jobs' || titleUpper.includes('ARMY') || titleUpper.includes('AGNIVEER')) return 'army_jobs';
    if (catLower === 'rrb_jobs' || titleUpper.includes('RRB') || titleUpper.includes('RAILWAY')) return 'rrb_jobs';
    if (catLower === 'ssc_jobs' || titleUpper.includes('SSC')) return 'ssc_jobs';
    if (catLower === 'cluster_univ' || titleUpper.includes('CLUSTER')) return 'cluster_univ';
    if (catLower === 'exam_forms' || titleUpper.includes('KASHMIR UNIVERSITY') || titleUpper.includes('EXAM FORM')) return 'exam_forms';
    if (catLower === 'admissions' || titleUpper.includes('ADMISSION')) return 'admissions';
    return 'default';
  }, [category, title, styleOverride]);

  // Construct active 1200x630 Spec
  const activeSpec: ThumbnailSpec = useMemo(() => {
    return {
      category: effectiveCategoryStyle,
      orgTitle: orgTitle.trim() || CATEGORY_THEMES[effectiveCategoryStyle]?.orgTitle || 'CSC DOST',
      postBadgeTitle: postBadgeTitle.trim() || 'OFFICIAL NOTIFICATION',
      eligibilityLabel,
      eligibilityValue: eligibilityValue.trim() || 'See notification',
      lastDateLabel,
      lastDateValue: lastDateValue.trim() || 'Check website',
      howToApplyLabel,
      howToApplyValue: howToApplyValue.trim() || 'Visit CSC DOST',
      logoOption,
      logoUrl: logoOption === 'custom' ? customLogoUrl : undefined,
      customThumbnailUrl: isCustomUploaded && customImageDataUrl ? customImageDataUrl : undefined
    };
  }, [
    effectiveCategoryStyle,
    orgTitle,
    postBadgeTitle,
    eligibilityLabel,
    eligibilityValue,
    lastDateLabel,
    lastDateValue,
    howToApplyLabel,
    howToApplyValue,
    logoOption,
    customLogoUrl,
    isCustomUploaded,
    customImageDataUrl
  ]);

  // Realtime Rendered Vector SVG String
  const previewSvg = useMemo(() => {
    return renderStandaloneMasterThumbnailSvg(activeSpec);
  }, [activeSpec]);

  // SVG Data URL for previewing
  const previewSvgDataUrl = useMemo(() => {
    if (isCustomUploaded && customImageDataUrl) {
      return customImageDataUrl;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(previewSvg)}`;
  }, [previewSvg, isCustomUploaded, customImageDataUrl]);

  // Fetch posts list on mount
  useEffect(() => {
    fetch('/api/sarkari-posts')
      .then(r => r.json())
      .then(d => {
        if (d && Array.isArray(d.posts) && d.posts.length > 0) {
          setPostsList(d.posts);
        }
      })
      .catch(() => {});
  }, []);

  // When a post is chosen, populate all fields
  const loadPostDetails = (targetId: string) => {
    const post = postsList.find(p => p.id === targetId) || SARKARI_DATA.find(p => p.id === targetId);
    if (!post) return;

    setPostId(post.id);
    setTitle(post.title);
    setCategory(post.category);
    setDepartment(post.department || '');
    setShortDescription(post.shortInfo || '');
    setLastDate(post.lastDate || '');
    setEligibility(post.eligibility || '');
    setOfficialLink(post.officialLink || '');

    // Extract deterministic spec
    const spec = buildDeterministicThumbnailSpec({
      id: post.id,
      title: post.title,
      category: post.category,
      department: post.department,
      shortInfo: post.shortInfo,
      lastDate: post.lastDate,
      eligibility: post.eligibility
    });

    setStyleOverride('auto');
    setOrgTitle(spec.orgTitle);
    setPostBadgeTitle(spec.postBadgeTitle);
    setEligibilityValue(spec.eligibilityValue);
    setLastDateValue(spec.lastDateValue);
    setHowToApplyValue(spec.howToApplyValue);
    setIsCustomUploaded(false);
    setCustomImageDataUrl(null);
  };

  useEffect(() => {
    if (postId) {
      loadPostDetails(postId);
    }
  }, [postId]);

  // ACTION: Regenerate Thumbnail from current post inputs
  const handleRegenerate = () => {
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const spec = buildDeterministicThumbnailSpec({
        id: postId,
        title,
        category,
        department,
        shortInfo: shortDescription,
        lastDate,
        eligibility
      });

      setOrgTitle(spec.orgTitle);
      setPostBadgeTitle(spec.postBadgeTitle);
      setEligibilityValue(spec.eligibilityValue);
      setLastDateValue(spec.lastDateValue);
      setHowToApplyValue(spec.howToApplyValue);
      setIsCustomUploaded(false);
      setCustomImageDataUrl(null);

      setStatusMessage({
        type: 'success',
        text: 'Regenerated fresh 1200 × 630 px thumbnail layout from post details.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to regenerate thumbnail.'
      });
    } finally {
      setTimeout(() => setIsGenerating(false), 200);
    }
  };

  // ACTION: Save Thumbnail to Server and Post Record
  const handleSaveThumbnail = async () => {
    if (!title.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a notification title before saving.'
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const effectiveId =
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
          postId: effectiveId,
          title,
          category: effectiveCategoryStyle,
          department,
          shortDescription,
          importantDates: { lastDate },
          spec: activeSpec,
          isCustomUpload: isCustomUploaded,
          customImageDataUrl: isCustomUploaded ? customImageDataUrl : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save thumbnail');
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully saved dedicated 1200 × 630 thumbnail for "${effectiveId}". Social cards are now live!`
      });

      if (onThumbnailSaved) {
        onThumbnailSaved(effectiveId, data.thumbnailUrl, activeSpec);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save thumbnail.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ACTION: Handle custom full thumbnail file upload
  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setIsCustomUploaded(true);
      setCustomImageDataUrl(dataUrl);
      setStatusMessage({
        type: 'info',
        text: 'Loaded custom thumbnail image. Click "Save Thumbnail" to apply.'
      });
    };
    reader.readAsDataURL(file);
  };

  // ACTION: Handle custom logo upload
  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setLogoOption('custom');
      setCustomLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Download 1200x630 PNG directly
  const handleDownloadPng = async () => {
    try {
      const img = new Image();
      img.src = previewSvgDataUrl;
      await new Promise(res => (img.onload = res));

      const canvas = document.createElement('canvas');
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
        ctx.drawImage(img, 0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${postId || 'csc-dost-thumbnail'}-1200x630.png`;
        a.click();
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const shareUrl = `https://www.cscdost.com/post/${postId}`;
  const ogImageUrl = `https://www.cscdost.com/api/og-image/${encodeURIComponent(postId)}.png`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Thumbnail &amp; Social Preview Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatic post-specific 1200 × 630 px thumbnails matching approved category graphics
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleSaveThumbnail}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Thumbnail to Post</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK STATUS MESSAGE */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
              : 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* QUICK PRESET SELECTOR (APPROVED DEMO STYLES) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Load Approved Reference Presets:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {APPROVED_PRESETS.map(p => (
            <button
              key={p.key}
              type="button"
              onClick={() => {
                setPostId(p.id);
                setTitle(p.title);
                setCategory(p.category);
                setDepartment(p.department);
                setOrgTitle(p.orgTitle);
                setPostBadgeTitle(p.postBadgeTitle);
                setEligibilityValue(p.eligibilityValue);
                setLastDateValue(p.lastDateValue);
                setHowToApplyValue(p.howToApplyValue);
                setStyleOverride('auto');
                setIsCustomUploaded(false);
                setCustomImageDataUrl(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                postId === p.id
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {p.category.replace('_', ' ')}
              </div>
              <div className="text-xs font-bold truncate mt-0.5">{p.postBadgeTitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* LEFT COLUMN: CONTROLS & POST METADATA */}
        <div className="lg:col-span-5 space-y-4">
          {/* Post Selection or Creation Toggle */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Active Post</span>
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${
                    mode === 'edit' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Select Existing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('create');
                    setPostId(`post-${Date.now()}`);
                    setTitle('New Job Notification 2026');
                    setOrgTitle('JKSSB');
                    setPostBadgeTitle('NEW POSTS');
                  }}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${
                    mode === 'create' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Create New
                </button>
              </div>
            </div>

            {mode === 'edit' && (
              <select
                value={postId}
                onChange={e => loadPostDetails(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
              >
                {postsList.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.title.slice(0, 50)}...
                  </option>
                ))}
              </select>
            )}

            {/* Post Title */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Notification Full Title
              </label>
              <textarea
                value={title}
                onChange={e => setTitle(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          {/* Category & Visual Theme Selection */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Category &amp; Style Theme</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded-full">
                Active: {CATEGORY_THEMES[effectiveCategoryStyle]?.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Post Category
                </label>
                <select
                  value={category}
                  onChange={e => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    const def = CATEGORY_THEMES[newCat];
                    if (def) {
                      setOrgTitle(def.orgTitle);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  {Object.entries(SARKARI_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Manual Style Override
                </label>
                <select
                  value={styleOverride}
                  onChange={e => setStyleOverride(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="auto">Auto (from Category)</option>
                  <option value="jkssb">JKSSB (Blue &amp; Orange)</option>
                  <option value="army_jobs">Indian Army (Green &amp; Gold)</option>
                  <option value="rrb_jobs">Railways / RRB (Navy &amp; Orange)</option>
                  <option value="ssc_jobs">SSC (Navy &amp; Teal)</option>
                  <option value="exam_forms">Kashmir Univ (Navy &amp; Teal)</option>
                  <option value="cluster_univ">Cluster Univ (Blue &amp; Orange)</option>
                  <option value="default">CSC DOST Default</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thumbnail Headline & Role Customization */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Thumbnail Text &amp; Badge Customization
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Headline (Org Name)
                </label>
                <input
                  type="text"
                  value={orgTitle}
                  onChange={e => setOrgTitle(e.target.value)}
                  placeholder="e.g. JKSSB"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Post Role Pill Banner
                </label>
                <input
                  type="text"
                  value={postBadgeTitle}
                  onChange={e => setPostBadgeTitle(e.target.value)}
                  placeholder="e.g. CLASS IV"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* 3 Information Cards Inputs */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Card 1 Value</label>
                  <input
                    type="text"
                    value={eligibilityValue}
                    onChange={e => setEligibilityValue(e.target.value)}
                    placeholder="e.g. 10th / 12th Pass"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Card 2 Value (Last date)</label>
                  <input
                    type="text"
                    value={lastDateValue}
                    onChange={e => setLastDateValue(e.target.value)}
                    placeholder="e.g. 25/06/2026"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Custom Image Upload Options */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Organisation Logo &amp; Custom Upload
            </span>

            <div className="flex items-center gap-2">
              <select
                value={logoOption}
                onChange={e => setLogoOption(e.target.value as any)}
                className="w-1/2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
              >
                <option value="preset">Verified Org Emblem</option>
                <option value="placeholder">Clean Official Logo Frame</option>
                <option value="custom">Upload Custom Logo</option>
              </select>

              {logoOption === 'custom' && (
                <div>
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    onChange={handleCustomLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Select Logo File
                  </button>
                </div>
              )}
            </div>

            {/* Custom Full Thumbnail Upload */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <input
                type="file"
                ref={customFileInputRef}
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isCustomUploaded ? 'Custom Image Active' : 'Upload custom 1200x630 image'}
                </span>
                <button
                  type="button"
                  onClick={() => customFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE PREVIEW TABS */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewTab('thumbnail')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'thumbnail'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>1200 × 630 Thumbnail</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('facebook')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'facebook'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Facebook Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('whatsapp')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'whatsapp'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>WhatsApp Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={copyShareLink}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied Link' : 'Copy Post URL'}</span>
            </button>
          </div>

          {/* TAB 1: THUMBNAIL HIGH-RESOLUTION VIEW */}
          {previewTab === 'thumbnail' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-white">
                <img
                  src={previewSvgDataUrl}
                  alt={title}
                  className="w-full aspect-[1200/630] object-contain block bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>Exact Resolution: 1200 × 630 pixels (Aspect Ratio: 1.91 : 1)</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Target: /api/og-image/{encodeURIComponent(postId)}.png
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: FACEBOOK SHARE CARD MOCKUP */}
          {previewTab === 'facebook' && (
            <div className="bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center">
              <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 font-sans">
                {/* Facebook Post Author Header */}
                <div className="p-3 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    CSC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">CSC DOST</div>
                    <div className="text-[10px] text-slate-400">Just now • 🌐 Public</div>
                  </div>
                </div>

                {/* Shared Link Card */}
                <div className="cursor-pointer border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full aspect-[1200/630] bg-slate-50 dark:bg-slate-950 overflow-hidden">
                    <img
                      src={previewSvgDataUrl}
                      alt={title}
                      className="w-full h-full object-contain block"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      WWW.CSCDOST.COM
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                      {title || 'Recruitment & University Update | CSC DOST'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {shortDescription ||
                        `Apply online for ${title}. Last date: ${lastDateValue}. Easy online application assistance.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP SHARE CHAT BUBBLE MOCKUP */}
          {previewTab === 'whatsapp' && (
            <div className="bg-[#E5DDD5] dark:bg-[#0B141A] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-center">
              <div className="w-full max-w-[420px] bg-white dark:bg-[#1F2C34] rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-700">
                {/* WhatsApp Link Preview Card */}
                <div className="bg-slate-100 dark:bg-[#111B21] p-2 rounded-t-2xl">
                  <div className="rounded-xl overflow-hidden aspect-[1200/630] bg-white shadow-xs">
                    <img
                      src={previewSvgDataUrl}
                      alt={title}
                      className="w-full h-full object-contain block"
                    />
                  </div>
                  <div className="p-2 space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      cscdost.com/post/{postId}
                    </div>
                  </div>
                </div>

                {/* WhatsApp Message Body */}
                <div className="p-3 text-xs text-slate-800 dark:text-slate-200 space-y-1.5 font-sans leading-relaxed">
                  <div className="font-bold text-[#00A884]">📢 OFFICIAL UPDATE • CSC DOST</div>
                  <div>
                    <strong>{title}</strong>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    ⚡ <strong>Eligibility:</strong> {eligibilityValue}
                    <br />
                    📅 <strong>Last Date:</strong> {lastDateValue}
                    <br />
                    📝 <strong>How to apply:</strong> Visit CSC DOST
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 underline pt-1 font-semibold">
                    {shareUrl}
                  </div>
                  <div className="text-[10px] text-slate-400 text-right pt-1">10:42 AM ✓✓</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
