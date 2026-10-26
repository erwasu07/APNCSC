import React, { useState, useEffect, useMemo } from 'react';
import { SARKARI_DATA, SarkariItem } from '../data/sarkariData';
import SarkariNotificationBanner from './SarkariNotificationBanner';
import { getSupabaseClient } from '../lib/supabase';
import {
  buildWhatsAppNotification,
  detectWhatsAppNotificationCategory,
  resolvePostOrganization,
  extractCompactQualification,
  extractCompactVacancies,
  extractCompactLastDate,
  extractCourseOrProgramme,
  extractAdmissionSession,
  extractResultDetails,
  generateShortWhatsAppTitle,
  getCanonicalPostUrl,
  WhatsAppNotificationCategory,
} from '../utils/whatsappFormatter';
import {
  MessageCircle,
  Send,
  Copy,
  Check,
  RefreshCw,
  Search,
  Radio,
  Settings,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  ShieldCheck,
  Users,
  Megaphone,
  Info,
  SlidersHorizontal,
  Eye,
  RotateCcw,
} from 'lucide-react';

export type WhatsAppPublishStatus =
  | 'Prepared'
  | 'Opened in WhatsApp'
  | 'Manually Confirmed'
  | 'Submitted to Provider'
  | 'Sent'
  | 'Delivered'
  | 'Failed';

export interface WhatsAppPublishHistoryEntry {
  id: string;
  postId: string;
  title: string;
  category: string;
  destination: string;
  sharingMethod: string;
  dateTime: string;
  isoTimestamp: string;
  status: WhatsAppPublishStatus;
  adminUser: string;
  canonicalUrl: string;
  confirmedAt?: string;
  confirmedBy?: string;
  providerMessageId?: string;
  errorDetails?: string;
}

interface ServerDiagnostics {
  cloudApiReady: boolean;
  cloudApiTokenConfigured: boolean;
  phoneNumberIdConfigured: boolean;
  officialGroupsApiReady: boolean;
  officialGroupIdConfigured: boolean;
  automatedChannelApiSupported: boolean;
  webhookUrlConfigured: boolean;
  legacyAutoPostDiagnosis?: {
    status: string;
    summary: string;
    supportedGroupWorkflow: string;
    supportedChannelWorkflow: string;
    officialApiSupport: string;
  };
}

interface WhatsAppBroadcasterProps {
  cafeName: string;
  adminUser?: string;
}

const VALID_WHATSAPP_CHANNEL_REGEX =
  /^https:\/\/(?:www\.)?whatsapp\.com\/channel\/[A-Za-z0-9_-]{6,}/i;
const VALID_WHATSAPP_GROUP_INVITE_REGEX =
  /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]{6,}/i;

export default function WhatsAppBroadcaster({
  adminUser = 'Authorized Staff',
}: WhatsAppBroadcasterProps) {
  // All published notifications (static SARKARI_DATA + custom posts from server/Supabase)
  const [allPosts, setAllPosts] = useState<SarkariItem[]>(() => [...SARKARI_DATA]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Section A: Selection & Filters
  const [selectedNotificationId, setSelectedNotificationId] = useState<string>(
    SARKARI_DATA[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | WhatsAppNotificationCategory>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Section B: Option 1 Dynamic Notification Fields & Overrides
  const [customTitle, setCustomTitle] = useState('');
  const [customOrganization, setCustomOrganization] = useState('');
  const [customQualification, setCustomQualification] = useState('');
  const [customSeats, setCustomSeats] = useState('');
  const [customLastDate, setCustomLastDate] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [customSession, setCustomSession] = useState('');
  const [customExamination, setCustomExamination] = useState('');
  const [customResultStatus, setCustomResultStatus] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [customCategory, setCustomCategory] = useState('army_jobs');
  const [formatCategoryType, setFormatCategoryType] =
    useState<WhatsAppNotificationCategory>('job');

  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [showRawTextInspector, setShowRawTextInspector] = useState(false);
  const [showDiagnosticsPanel, setShowDiagnosticsPanel] = useState(false);

  // Section C: Publishing Destinations Configuration
  const [channelUrl, setChannelUrl] = useState<string>(() => {
    return localStorage.getItem('csc_whatsapp_channel_url') || '';
  });
  const [channelName, setChannelName] = useState<string>(() => {
    return (
      localStorage.getItem('csc_whatsapp_channel_name') ||
      'CSC DOST Official WhatsApp Channel'
    );
  });
  const [groupInviteUrl, setGroupInviteUrl] = useState<string>(() => {
    return (
      localStorage.getItem('csc_whatsapp_target_group') ||
      'https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI'
    );
  });
  const [groupName, setGroupName] = useState<string>(() => {
    return localStorage.getItem('csc_whatsapp_group_name') || 'CSC DOST Community Group';
  });
  const [editingChannelSettings, setEditingChannelSettings] = useState(false);
  const [editingGroupSettings, setEditingGroupSettings] = useState(false);
  const [savingDestinationConfig, setSavingDestinationConfig] = useState(false);
  const [useWhatsAppWebLink, setUseWhatsAppWebLink] = useState(false);

  // Official API Diagnostics
  const [diagnostics, setDiagnostics] = useState<ServerDiagnostics | null>(null);
  const [isSubmittingOfficialApi, setIsSubmittingOfficialApi] = useState(false);

  // Feedback & Copy states
  const [copiedGroupMsg, setCopiedGroupMsg] = useState(false);
  const [copiedGroupLink, setCopiedGroupLink] = useState(false);
  const [copiedChannelMsg, setCopiedChannelMsg] = useState(false);
  const [copiedChannelLink, setCopiedChannelLink] = useState(false);
  const [lastPendingConfirmEntryId, setLastPendingConfirmEntryId] = useState<string | null>(
    null
  );
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    pendingEntryId?: string;
  } | null>(null);

  // Section D: Publishing History
  const [publishHistory, setPublishHistory] = useState<WhatsAppPublishHistoryEntry[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('csc_whatsapp_publish_history') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // Load selected notification details into Option 1 fields
  const loadNotificationData = (item: SarkariItem) => {
    const detectedType = detectWhatsAppNotificationCategory(item);
    const shortTitle = generateShortWhatsAppTitle(item.title, item.category);
    const org = resolvePostOrganization(item);
    const qual = extractCompactQualification(item.eligibility, item.title);
    const vac = extractCompactVacancies(item.totalPosts, detectedType);
    const lastDt = extractCompactLastDate(item.lastDate, detectedType);
    const course = extractCourseOrProgramme(item);
    const session = extractAdmissionSession(item);
    const resDetails = extractResultDetails(item);

    setSelectedNotificationId(item.id);
    setCustomCategory(item.category);
    setFormatCategoryType(detectedType);
    setCustomTitle(shortTitle);
    setCustomOrganization(org);
    setCustomQualification(qual);
    setCustomSeats(vac);
    setCustomLastDate(lastDt);
    setCustomCourse(course);
    setCustomSession(session);
    setCustomExamination(resDetails.examination);
    setCustomResultStatus(resDetails.resultStatus);
    setCustomLink(getCanonicalPostUrl(item.id, 'post'));
  };

  // Sync published posts, saved thumbnails, server diagnostics, config, and publishing history
  const fetchPublisherState = async () => {
    setLoadingPosts(true);
    try {
      // 1. Fetch custom posts & saved thumbnails map from backend
      const [thumbRes, diagRes, configRes, histRes] = await Promise.all([
        fetch('/api/thumbnails/map').catch(() => null),
        fetch('/api/whatsapp/diagnostics').catch(() => null),
        fetch('/api/whatsapp/config').catch(() => null),
        fetch('/api/whatsapp/history').catch(() => null),
      ]);

      const mergedMap = new Map<string, SarkariItem>();
      SARKARI_DATA.forEach((item) => mergedMap.set(item.id, { ...item }));

      if (thumbRes && thumbRes.ok) {
        const thumbData = await thumbRes.json().catch(() => ({}));
        const customPosts: any[] = Array.isArray(thumbData.customPosts)
          ? thumbData.customPosts
          : [];
        const thumbnailsMap: Record<string, any> = thumbData.thumbnails || {};

        customPosts.forEach((cp) => {
          if (cp && cp.id && cp.title) {
            mergedMap.set(cp.id, { ...(mergedMap.get(cp.id) || {}), ...cp });
          }
        });

        for (const [id, entry] of Object.entries(mergedMap.entries())) {
          const item = entry[1];
          const savedThumb = thumbnailsMap[item.id];
          if (savedThumb?.thumbnailUrl) {
            item.thumbnailUrl = savedThumb.thumbnailUrl;
            if (savedThumb.spec) item.thumbnailSpec = savedThumb.spec;
          }
        }
      }

      // 2. Also check Supabase `sarkari_posts` table if present
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: supaPosts, error: supaErr } = await supabase
            .from('sarkari_posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (!supaErr && Array.isArray(supaPosts)) {
            supaPosts.forEach((sp: any) => {
              const slug = String(sp.id || sp.slug || '').trim();
              if (!slug || !sp.title) return;
              const existing = mergedMap.get(slug);
              mergedMap.set(slug, {
                id: slug,
                title: sp.title,
                category: sp.category || existing?.category || 'jobs',
                postDate: sp.post_date || sp.postDate || existing?.postDate || '',
                startDate: sp.start_date || sp.startDate || existing?.startDate || '',
                lastDate: sp.last_date || sp.lastDate || existing?.lastDate || '',
                shortInfo: sp.short_info || sp.shortInfo || existing?.shortInfo || '',
                ageLimit: sp.age_limit || sp.ageLimit || existing?.ageLimit || '',
                eligibility: sp.eligibility || existing?.eligibility || '',
                totalPosts: sp.total_posts || sp.totalPosts || existing?.totalPosts || '',
                officialLink:
                  sp.official_link ||
                  sp.officialLink ||
                  existing?.officialLink ||
                  'https://www.cscdost.com',
                fees: sp.fees ||
                  existing?.fees || {
                    genObc: 'Refer to notice',
                    scSt: 'Refer to notice',
                  },
                department: sp.department || existing?.department,
                postType: sp.post_type || sp.postType || existing?.postType,
                status: sp.status || existing?.status,
                thumbnailUrl: sp.thumbnail_url || sp.thumbnailUrl || existing?.thumbnailUrl,
                thumbnailSpec:
                  sp.thumbnail_spec || sp.thumbnailSpec || existing?.thumbnailSpec,
              });
            });
          }
        } catch {
          // Optional table; safe to ignore if not created
        }
      }

      const finalPosts = Array.from(mergedMap.values());
      setAllPosts(finalPosts);

      // 3. Apply server diagnostics
      if (diagRes && diagRes.ok) {
        const diagJson = await diagRes.json().catch(() => null);
        if (diagJson?.diagnostics) {
          setDiagnostics(diagJson.diagnostics);
        }
      }

      // 4. Apply saved destination config
      if (configRes && configRes.ok) {
        const cfgJson = await configRes.json().catch(() => null);
        if (cfgJson?.config) {
          if (cfgJson.config.channelUrl) {
            setChannelUrl(cfgJson.config.channelUrl);
            localStorage.setItem('csc_whatsapp_channel_url', cfgJson.config.channelUrl);
          }
          if (cfgJson.config.channelName) {
            setChannelName(cfgJson.config.channelName);
            localStorage.setItem('csc_whatsapp_channel_name', cfgJson.config.channelName);
          }
          if (cfgJson.config.groupInviteUrl) {
            setGroupInviteUrl(cfgJson.config.groupInviteUrl);
            localStorage.setItem('csc_whatsapp_target_group', cfgJson.config.groupInviteUrl);
          }
          if (cfgJson.config.groupName) {
            setGroupName(cfgJson.config.groupName);
            localStorage.setItem('csc_whatsapp_group_name', cfgJson.config.groupName);
          }
        }
      }

      // 5. Apply publishing history
      if (histRes && histRes.ok) {
        const histJson = await histRes.json().catch(() => null);
        if (Array.isArray(histJson?.history) && histJson.history.length > 0) {
          setPublishHistory(histJson.history);
          try {
            localStorage.setItem(
              'csc_whatsapp_publish_history',
              JSON.stringify(histJson.history)
            );
          } catch {}
        }
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (SARKARI_DATA.length > 0) {
      // Default to first Indian Army or top notification
      const defaultItem =
        SARKARI_DATA.find((i) => i.category === 'army_jobs') || SARKARI_DATA[0];
      loadNotificationData(defaultItem);
    }
    fetchPublisherState();
  }, []);

  // Currently selected post object
  const activeSelectedItem = useMemo(() => {
    return (
      allPosts.find((i) => i.id === selectedNotificationId) ||
      allPosts[0] ||
      SARKARI_DATA[0]
    );
  }, [allPosts, selectedNotificationId]);

  // Filtered notifications for Section A
  const filteredNotifications = useMemo(() => {
    return allPosts.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.shortInfo || '').toLowerCase().includes(q) ||
        (item.department || '').toLowerCase().includes(q) ||
        (item.advertisementNo || '').toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const itemDetectedType = detectWhatsAppNotificationCategory(item);
      if (typeFilter !== 'all' && itemDetectedType !== typeFilter) {
        return false;
      }

      if (sourceFilter !== 'all' && item.category !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [allPosts, searchTerm, typeFilter, sourceFilter]);

  // Category counts for quick filter pills
  const categoryCounts = useMemo(() => {
    const counts = {
      all: allPosts.length,
      job: 0,
      admission: 0,
      result: 0,
      scheme: 0,
      scholarship: 0,
    };
    allPosts.forEach((item) => {
      const t = detectWhatsAppNotificationCategory(item);
      if (t in counts) {
        counts[t as keyof typeof counts] += 1;
      }
    });
    return counts;
  }, [allPosts]);

  // Build the Option 1 WhatsApp Notification Payload (single canonical URL, category-adapted fields)
  const currentNotificationPayload = useMemo(() => {
    return buildWhatsAppNotification(activeSelectedItem || {}, {
      forceCategoryType: formatCategoryType,
      customTitle,
      customOrganization,
      customQualification,
      customVacancies: customSeats,
      customLastDate,
      customCourse,
      customSession,
      customExamination,
      customResultStatus,
      customUrl: customLink,
    });
  }, [
    activeSelectedItem,
    formatCategoryType,
    customTitle,
    customOrganization,
    customQualification,
    customSeats,
    customLastDate,
    customCourse,
    customSession,
    customExamination,
    customResultStatus,
    customLink,
  ]);

  const currentFormattedMessage = currentNotificationPayload.message;
  const singleCanonicalUrl = currentNotificationPayload.canonicalUrl;

  // Verify single URL count in message
  const urlOccurrencesInMessage = useMemo(() => {
    const matches = currentFormattedMessage.match(/https?:\/\/[^\s]+/g);
    return matches ? matches.length : 0;
  }, [currentFormattedMessage]);

  // Persist a publishing history record to server + localStorage
  const recordPublishEvent = async ({
    destination,
    sharingMethod,
    status,
    errorDetails,
  }: {
    destination: string;
    sharingMethod: string;
    status: WhatsAppPublishStatus;
    errorDetails?: string;
  }): Promise<WhatsAppPublishHistoryEntry> => {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB');
    const timePart = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const optimisticEntry: WhatsAppPublishHistoryEntry = {
      id: `wapub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      postId: activeSelectedItem?.id || '',
      title: currentNotificationPayload.shortTitle || customTitle || 'CSC DOST Notification',
      category: formatCategoryType,
      destination,
      sharingMethod,
      dateTime: `${datePart}, ${timePart}`,
      isoTimestamp: now.toISOString(),
      status,
      adminUser,
      canonicalUrl: singleCanonicalUrl,
      errorDetails,
    };

    try {
      const res = await fetch('/api/whatsapp/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: optimisticEntry.postId,
          title: optimisticEntry.title,
          category: optimisticEntry.category,
          destination: optimisticEntry.destination,
          sharingMethod: optimisticEntry.sharingMethod,
          status: optimisticEntry.status,
          adminUser: optimisticEntry.adminUser,
          canonicalUrl: optimisticEntry.canonicalUrl,
          errorDetails: optimisticEntry.errorDetails,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.history)) {
          setPublishHistory(data.history);
          localStorage.setItem(
            'csc_whatsapp_publish_history',
            JSON.stringify(data.history)
          );
          return data.entry || optimisticEntry;
        }
      }
    } catch {
      // Fallback to local state if offline
    }

    setPublishHistory((prev) => {
      const updated = [optimisticEntry, ...prev.slice(0, 99)];
      try {
        localStorage.setItem('csc_whatsapp_publish_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return optimisticEntry;
  };

  // Explicit Admin Confirmation ("Mark as Published")
  const handleMarkAsPublished = async (entryId: string) => {
    const now = new Date();
    const confirmedTimestamp = `${now.toLocaleDateString('en-GB')}, ${now.toLocaleTimeString(
      'en-US',
      { hour: '2-digit', minute: '2-digit', hour12: true }
    )}`;

    try {
      const res = await fetch(`/api/whatsapp/history/${encodeURIComponent(entryId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Manually Confirmed',
          adminUser,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.history)) {
          setPublishHistory(data.history);
          localStorage.setItem(
            'csc_whatsapp_publish_history',
            JSON.stringify(data.history)
          );
        }
      }
    } catch {
      // Fallback update in local state
    }

    setPublishHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === entryId
          ? {
              ...item,
              status: 'Manually Confirmed' as WhatsAppPublishStatus,
              confirmedAt: confirmedTimestamp,
              confirmedBy: adminUser,
            }
          : item
      );
      try {
        localStorage.setItem('csc_whatsapp_publish_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (lastPendingConfirmEntryId === entryId) {
      setLastPendingConfirmEntryId(null);
    }

    setStatusFeedback({
      type: 'success',
      title: 'Marked as Published (Admin-Confirmed)',
      message: `Publication confirmed by ${adminUser} at ${confirmedTimestamp}. Recorded in Publishing History.`,
    });
  };

  // Copy helper
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        return false;
      }
    }
  };

  // ============================================================================
  // DESTINATION 1 HANDLERS: SHARE TO WHATSAPP GROUPS
  // ============================================================================
  const handleShareToWhatsAppGroups = async () => {
    const targetShareUrl = useWhatsAppWebLink
      ? currentNotificationPayload.whatsappWebShareUrl
      : currentNotificationPayload.whatsappShareUrl;

    // Open WhatsApp share link in a new tab so the admin can pick their Group(s) and confirm sending
    const popup = document.createElement('a');
    popup.href = targetShareUrl;
    popup.target = '_blank';
    popup.rel = 'noopener noreferrer';
    document.body.appendChild(popup);
    popup.click();
    document.body.removeChild(popup);

    const entry = await recordPublishEvent({
      destination: groupName || 'WhatsApp Group',
      sharingMethod: useWhatsAppWebLink ? 'WhatsApp Web Share Link' : 'WhatsApp Share Link',
      status: 'Opened in WhatsApp',
    });

    setLastPendingConfirmEntryId(entry.id);
    setStatusFeedback({
      type: 'info',
      title: 'Opened in WhatsApp — Complete Sending in Your Group',
      message:
        'WhatsApp has been opened with your Option 1 formatted message. Select your CSC DOST Group(s) and press Send inside WhatsApp. Once sent, click "Mark as Published" below to confirm.',
      pendingEntryId: entry.id,
    });
  };

  const handleCopyGroupFormattedMessage = async () => {
    await copyTextToClipboard(currentFormattedMessage);
    setCopiedGroupMsg(true);
    setTimeout(() => setCopiedGroupMsg(false), 2500);

    const entry = await recordPublishEvent({
      destination: groupName || 'WhatsApp Group',
      sharingMethod: 'Copy Formatted Message',
      status: 'Prepared',
    });
    setLastPendingConfirmEntryId(entry.id);
  };

  const handleCopyGroupPostLink = async () => {
    await copyTextToClipboard(singleCanonicalUrl);
    setCopiedGroupLink(true);
    setTimeout(() => setCopiedGroupLink(false), 2500);
  };

  // ============================================================================
  // DESTINATION 2 HANDLERS: PUBLISH TO WHATSAPP CHANNEL
  // ============================================================================
  const isChannelUrlValid = useMemo(() => {
    if (!channelUrl.trim()) return false;
    return VALID_WHATSAPP_CHANNEL_REGEX.test(channelUrl.trim());
  }, [channelUrl]);

  const isGroupUrlValid = useMemo(() => {
    if (!groupInviteUrl.trim()) return true;
    return VALID_WHATSAPP_GROUP_INVITE_REGEX.test(groupInviteUrl.trim());
  }, [groupInviteUrl]);

  const handleSaveDestinationConfig = async () => {
    const trimmedChannel = channelUrl.trim();
    const trimmedGroup = groupInviteUrl.trim();

    if (trimmedChannel && !VALID_WHATSAPP_CHANNEL_REGEX.test(trimmedChannel)) {
      setStatusFeedback({
        type: 'error',
        title: 'Invalid WhatsApp Channel URL',
        message:
          'Please enter a valid WhatsApp Channel URL starting with https://whatsapp.com/channel/...',
      });
      return;
    }

    if (trimmedGroup && !VALID_WHATSAPP_GROUP_INVITE_REGEX.test(trimmedGroup)) {
      setStatusFeedback({
        type: 'error',
        title: 'Invalid WhatsApp Group Invite URL',
        message:
          'Please enter a valid WhatsApp Group invite URL starting with https://chat.whatsapp.com/...',
      });
      return;
    }

    setSavingDestinationConfig(true);
    try {
      localStorage.setItem('csc_whatsapp_channel_url', trimmedChannel);
      localStorage.setItem('csc_whatsapp_channel_name', channelName.trim());
      localStorage.setItem('csc_whatsapp_target_group', trimmedGroup);
      localStorage.setItem('csc_whatsapp_group_name', groupName.trim());

      const res = await fetch('/api/whatsapp/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelUrl: trimmedChannel,
          channelName: channelName.trim(),
          groupInviteUrl: trimmedGroup,
          groupName: groupName.trim(),
          updatedBy: adminUser,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok && data.error) {
        setStatusFeedback({
          type: 'error',
          title: 'Could Not Save Destination URL',
          message: data.error,
        });
        return;
      }

      setEditingChannelSettings(false);
      setEditingGroupSettings(false);
      setStatusFeedback({
        type: 'success',
        title: 'Destination Settings Saved',
        message: 'Your WhatsApp Group and Channel URLs have been validated and saved.',
      });
    } finally {
      setSavingDestinationConfig(false);
    }
  };

  const handleCopyChannelNotification = async () => {
    await copyTextToClipboard(currentFormattedMessage);
    setCopiedChannelMsg(true);
    setTimeout(() => setCopiedChannelMsg(false), 2500);

    const entry = await recordPublishEvent({
      destination: channelName || 'WhatsApp Channel',
      sharingMethod: 'Copy Channel Notification',
      status: 'Prepared',
    });
    setLastPendingConfirmEntryId(entry.id);
    setStatusFeedback({
      type: 'info',
      title: 'Channel Notification Copied (Prepared)',
      message:
        'Formatted Option 1 notification copied to clipboard. Next, click "Open My WhatsApp Channel" to paste and publish it inside WhatsApp.',
      pendingEntryId: entry.id,
    });
  };

  const handleCopyChannelPostLink = async () => {
    await copyTextToClipboard(singleCanonicalUrl);
    setCopiedChannelLink(true);
    setTimeout(() => setCopiedChannelLink(false), 2500);
  };

  const handleOpenWhatsAppChannel = async () => {
    const trimmed = channelUrl.trim();
    if (!trimmed || !VALID_WHATSAPP_CHANNEL_REGEX.test(trimmed)) {
      setEditingChannelSettings(true);
      setStatusFeedback({
        type: 'warning',
        title: 'Configure Your WhatsApp Channel URL First',
        message:
          'Please paste and save your official WhatsApp Channel URL (https://whatsapp.com/channel/...) in the Channel settings box.',
      });
      return;
    }

    // Automatically copy the formatted notification to clipboard so admin can immediately paste in Channel
    await copyTextToClipboard(currentFormattedMessage);
    setCopiedChannelMsg(true);
    setTimeout(() => setCopiedChannelMsg(false), 2500);

    const link = document.createElement('a');
    link.href = trimmed;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const entry = await recordPublishEvent({
      destination: channelName || 'WhatsApp Channel',
      sharingMethod: 'Copy + Open WhatsApp Channel',
      status: 'Opened in WhatsApp',
    });
    setLastPendingConfirmEntryId(entry.id);
    setStatusFeedback({
      type: 'info',
      title: 'WhatsApp Channel Opened — Paste & Publish in WhatsApp',
      message:
        'Your formatted notification has been copied to your clipboard and your WhatsApp Channel is open. Paste and publish the post inside WhatsApp, then click "Mark as Published".',
      pendingEntryId: entry.id,
    });
  };

  // ============================================================================
  // DESTINATION 3 HANDLER: OFFICIAL WHATSAPP CLOUD API (IF CONFIGURED)
  // ============================================================================
  const handleOfficialApiGroupPublish = async () => {
    if (!diagnostics?.officialGroupsApiReady) {
      setStatusFeedback({
        type: 'warning',
        title: 'Official API-Managed Group Not Configured',
        message:
          'Automated Group API delivery requires server-side WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and an API-managed WHATSAPP_OFFICIAL_GROUP_ID. Use "Share on WhatsApp" above to post to your existing WhatsApp Groups.',
      });
      return;
    }

    setIsSubmittingOfficialApi(true);
    try {
      const res = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: activeSelectedItem?.id || '',
          title: currentNotificationPayload.shortTitle || customTitle,
          category: formatCategoryType,
          messageText: currentFormattedMessage,
          postUrl: singleCanonicalUrl,
          destination: 'Official API-Managed Group',
          adminUser,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data.history)) {
        setPublishHistory(data.history);
        localStorage.setItem('csc_whatsapp_publish_history', JSON.stringify(data.history));
      }

      if (res.ok && data.success) {
        setStatusFeedback({
          type: 'success',
          title: `Official API Response: ${data.status || 'Sent'}`,
          message:
            data.message ||
            'Notification dispatched via official WhatsApp Business Platform API.',
        });
      } else {
        setStatusFeedback({
          type: 'error',
          title: `API Dispatch ${data.status || 'Failed'}`,
          message:
            data.error ||
            'The provider rejected or could not complete automated API delivery.',
        });
      }
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        title: 'API Connection Failed',
        message: err?.message || 'Could not reach server API endpoint.',
      });
    } finally {
      setIsSubmittingOfficialApi(false);
    }
  };

  const handleClearHistory = async () => {
    setPublishHistory([]);
    setLastPendingConfirmEntryId(null);
    try {
      localStorage.removeItem('csc_whatsapp_publish_history');
      await fetch('/api/whatsapp/history', { method: 'DELETE' });
    } catch {}
  };

  // Status Badge Renderer (strictly uses the 7 required statuses)
  const renderPublishStatusBadge = (entry: WhatsAppPublishHistoryEntry) => {
    switch (entry.status) {
      case 'Prepared':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Prepared
          </span>
        );
      case 'Opened in WhatsApp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Opened in WhatsApp
          </span>
        );
      case 'Manually Confirmed':
        return (
          <div className="inline-flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Manually Confirmed
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 pl-1">
              Admin-confirmed (not API-verified)
            </span>
          </div>
        );
      case 'Submitted to Provider':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Submitted to Provider
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Check className="w-3.5 h-3.5 text-indigo-600" />
            Sent (API Verified)
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Delivered (Callback Verified)
          </span>
        );
      case 'Failed':
        return (
          <span
            title={entry.errorDetails || 'Delivery failed'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {entry.status}
          </span>
        );
    }
  };

  // Resolved Open Graph Preview Metadata for the selected post
  const openGraphPreview = useMemo(() => {
    if (!activeSelectedItem) {
      return {
        ogTitle: 'CSC DOST – Citizen Service Portal',
        ogDescription: 'Official recruitment notifications, admissions, results, and citizen services.',
        ogImage: 'https://www.cscdost.com/og-banner.png',
        ogUrl: 'https://www.cscdost.com',
      };
    }
    const dateVersion =
      (activeSelectedItem.lastDate || activeSelectedItem.postDate || '2026').replace(
        /[^0-9]/g,
        ''
      ) || '2026';
    return {
      ogTitle: `${activeSelectedItem.title} | CSC DOST`,
      ogDescription:
        activeSelectedItem.shortInfo ||
        `Apply online for ${activeSelectedItem.title}. Official notification & application assistance at cscdost.com.`,
      ogImage:
        activeSelectedItem.thumbnailUrl ||
        `/api/og-image/${encodeURIComponent(activeSelectedItem.id)}.png?v=${dateVersion}`,
      ogUrl: singleCanonicalUrl,
    };
  }, [activeSelectedItem, singleCanonicalUrl]);

  return (
    <div className="space-y-5" id="whatsapp-publisher-console">
      {/* ==================================================================== */}
      {/* PAGE HEADER & DIAGNOSTICS SUMMARY BAR                                */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#06458F] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#092442] tracking-tight">
                  WhatsApp Group &amp; Channel Publisher
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#0757AF] border border-blue-200">
                  Option 1 Standard • Single URL Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
                Manage and publish CSC DOST notifications to your WhatsApp communities.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDiagnosticsPanel((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#0874DC]" />
              <span>
                {showDiagnosticsPanel
                  ? 'Hide API & Auto-Post Diagnosis'
                  : 'Why Manual vs. Official API?'}
              </span>
            </button>

            <button
              type="button"
              onClick={fetchPublisherState}
              disabled={loadingPosts}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#0874DC] ${loadingPosts ? 'animate-spin' : ''}`}
              />
              <span>Sync Posts ({allPosts.length})</span>
            </button>
          </div>
        </div>

        {/* Collapsible Diagnosis & Manual vs Automatic Explanation Panel */}
        {showDiagnosticsPanel && (
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#092442] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0874DC]" />
                Technical Diagnosis: Existing Auto-Post vs. Supported WhatsApp Workflows
              </span>
              <button
                type="button"
                onClick={() => setShowDiagnosticsPanel(false)}
                className="text-[#64748B] hover:text-[#0F172A] font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#092442] block">
                  1. Why the Legacy Auto-Post Button Did Not Work
                </span>
                <p className="text-[#475569] leading-relaxed">
                  The previous button sent JSON to a generic Make.com webhook and accepted a{' '}
                  <code className="font-mono text-[11px]">chat.whatsapp.com</code> invite link. An
                  invite link is a browser join URL—not an API recipient ID—and a webhook returning{' '}
                  <code className="font-mono text-[11px]">HTTP 200</code> only means the webhook
                  received data (<strong className="text-[#092442]">Submitted to Provider</strong>
                  ), not that WhatsApp delivered a message.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#092442] block">
                  2. Existing WhatsApp Groups (Supported Workflow)
                </span>
                <p className="text-[#475569] leading-relaxed">
                  Standard WhatsApp share links (<code className="font-mono text-[11px]">api.whatsapp.com/send</code>)
                  cannot automatically pick arbitrary Groups without user confirmation. Clicking{' '}
                  <strong className="text-[#092442]">Share on WhatsApp</strong> pre-fills the exact
                  Option 1 message so you can select your existing Group(s), press Send in WhatsApp,
                  and mark the log as <strong className="text-[#16A34A]">Manually Confirmed</strong>.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] space-y-1">
                <span className="font-bold text-[#092442] block">
                  3. WhatsApp Channels (Supported Workflow)
                </span>
                <p className="text-[#475569] leading-relaxed">
                  Meta’s official WhatsApp Business Cloud API does not provide an endpoint for
                  automated Channel publishing. Use{' '}
                  <strong className="text-[#092442]">Copy Channel Notification</strong> +{' '}
                  <strong className="text-[#092442]">Open My WhatsApp Channel</strong> to paste and
                  publish directly inside your WhatsApp Channel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Feedback Banner (With Quick "Mark as Published" Confirmation Button) */}
        {statusFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              statusFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : statusFeedback.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : statusFeedback.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-950'
                : 'bg-blue-50 border-blue-300 text-slate-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {statusFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-[#0874DC] shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">{statusFeedback.title}</span>
                <p className="text-[11.5px] opacity-90 mt-0.5">{statusFeedback.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {statusFeedback.pendingEntryId && (
                <button
                  type="button"
                  onClick={() => handleMarkAsPublished(statusFeedback.pendingEntryId!)}
                  className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Published</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setStatusFeedback(null)}
                className="px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-300 font-semibold text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* TOP WORKSPACE: SECTION A (SELECT) & SECTION B (PREVIEW)              */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================================================================== */}
        {/* SECTION A: SELECT NOTIFICATION (5 Columns on Desktop)              */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0874DC] block">
                Section A
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#092442]">
                Select Notification
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#334155] font-mono text-xs font-semibold">
              {filteredNotifications.length} of {allPosts.length} posts
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by post title, department, or exam (e.g. Indian Army TES-57, JKSSB)..."
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#0874DC]"
            />
          </div>

          {/* Category Filter Pills (Required: Recruitment notices, Admissions, Results, Government schemes, Scholarships) */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All (${categoryCounts.all})` },
              { id: 'job', label: `Recruitment Notices (${categoryCounts.job})` },
              { id: 'admission', label: `Admissions (${categoryCounts.admission})` },
              { id: 'result', label: `Results (${categoryCounts.result})` },
              { id: 'scheme', label: `Government Schemes (${categoryCounts.scheme})` },
              { id: 'scholarship', label: `Scholarships (${categoryCounts.scholarship})` },
            ].map((tab) => {
              const active = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#06458F] text-white border-[#06458F]'
                      : 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0] hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Portal Source Secondary Filter */}
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="publisher-source-filter"
              className="text-[11px] font-semibold text-[#64748B]"
            >
              Filter by Portal / Board:
            </label>
            <select
              id="publisher-source-filter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0874DC]"
            >
              <option value="all">All Portals &amp; Boards</option>
              <option value="army_jobs">Indian Army (joinindianarmy.nic.in)</option>
              <option value="jkssb">JKSSB (jkssb.nic.in)</option>
              <option value="ssc_jobs">SSC (ssc.gov.in)</option>
              <option value="rrb_jobs">Railway RRB (rrbapply.gov.in)</option>
              <option value="jobs">National Jobs &amp; Schemes</option>
              <option value="admissions">Admissions &amp; Scholarships</option>
              <option value="results">Exam Results (JKBOSE / CBSE / NTA)</option>
              <option value="exam_forms">Kashmir University Exam Forms</option>
              <option value="cluster_univ">Cluster University Srinagar</option>
            </select>
          </div>

          {/* Scrollable Notification List */}
          <div className="max-h-[430px] overflow-y-auto space-y-1.5 pr-1 border border-[#E2E8F0] rounded-xl p-2 bg-[#F8FAFC]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center space-y-1">
                <p className="text-xs font-semibold text-[#334155]">
                  No matching notifications found.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setSourceFilter('all');
                  }}
                  className="text-xs font-bold text-[#0874DC] hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isSelected = item.id === selectedNotificationId;
                const itemCatType = detectWhatsAppNotificationCategory(item);
                const badgeMap: Record<
                  WhatsAppNotificationCategory,
                  { label: string; cls: string }
                > = {
                  job: {
                    label: 'Recruitment',
                    cls: 'bg-blue-100 text-blue-900 border-blue-200',
                  },
                  admission: {
                    label: 'Admission',
                    cls: 'bg-purple-100 text-purple-900 border-purple-200',
                  },
                  result: {
                    label: 'Result',
                    cls: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                  },
                  scholarship: {
                    label: 'Scholarship',
                    cls: 'bg-amber-100 text-amber-900 border-amber-200',
                  },
                  scheme: {
                    label: 'Gov Scheme',
                    cls: 'bg-teal-100 text-teal-900 border-teal-200',
                  },
                  generic: {
                    label: 'Update',
                    cls: 'bg-slate-200 text-slate-800 border-slate-300',
                  },
                };
                const badge = badgeMap[itemCatType];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadNotificationData(item)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#0874DC] ring-2 ring-[#0874DC]/15 shadow-2xs'
                        : 'bg-white/70 hover:bg-white border-[#E2E8F0]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748B] truncate">
                          {resolvePostOrganization(item)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#092442] leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-[#475569] font-mono">
                        {item.totalPosts && (
                          <span>Posts: {String(item.totalPosts).slice(0, 26)}</span>
                        )}
                        {item.lastDate && <span>Last Date: {item.lastDate}</span>}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-[#0874DC] text-white'
                          : 'border border-[#CBD5E1] text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* SECTION B: NOTIFICATION PREVIEW (7 Columns on Desktop)             */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0874DC] block">
                Section B
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#092442]">
                Notification Preview &amp; Approved Thumbnail
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRawTextInspector((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#0874DC]" />
                <span>{showRawTextInspector ? 'Bubble Preview' : 'Raw WhatsApp Syntax'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFieldEditor((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0874DC]" />
                <span>{showFieldEditor ? 'Hide Field Editor' : 'Customize Fields'}</span>
              </button>
            </div>
          </div>

          {/* 1. Approved Post-Specific Thumbnail & Open Graph Preservation Card */}
          {activeSelectedItem && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#092442] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  Approved Post Thumbnail (Preserved for WhatsApp Link Preview)
                </span>
                <span className="text-[11px] font-mono text-[#16A34A] font-semibold">
                  og:image • og:title • og:description • og:url Active
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#CBD5E1] bg-[#0F172A]">
                <SarkariNotificationBanner item={activeSelectedItem} />
              </div>

              {/* Compact Open Graph Metadata Verification Strip */}
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[#092442] block truncate">
                    {openGraphPreview.ogTitle}
                  </span>
                  <span className="text-[#64748B] font-mono block truncate">
                    og:url → {openGraphPreview.ogUrl}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-semibold shrink-0">
                  {urlOccurrencesInMessage} Canonical URL in Message
                </span>
              </div>
            </div>
          )}

          {/* 2. Collapsible Field Customization Drawer */}
          {showFieldEditor && (
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                <span className="text-xs font-bold text-[#092442]">
                  Option 1 Template Fields (Leave any field blank to omit it cleanly)
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={formatCategoryType}
                    onChange={(e) =>
                      setFormatCategoryType(e.target.value as WhatsAppNotificationCategory)
                    }
                    className="bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-xs font-semibold text-[#092442]"
                    aria-label="Template Category Format"
                  >
                    <option value="job">📢 Jobs &amp; Recruitment Alert</option>
                    <option value="admission">🎓 Admission Update</option>
                    <option value="result">📢 Result Update</option>
                    <option value="scholarship">🎓 Scholarship Alert</option>
                    <option value="scheme">📢 Government Scheme Update</option>
                    <option value="generic">📢 Generic Official Update</option>
                  </select>

                  {activeSelectedItem && (
                    <button
                      type="button"
                      onClick={() => loadNotificationData(activeSelectedItem)}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#334155] border border-[#CBD5E1] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      title="Reset fields to original post values"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Short Post Title (🇮🇳)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs font-semibold text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    {formatCategoryType === 'admission'
                      ? 'University / Institution (🏛️)'
                      : formatCategoryType === 'result'
                      ? 'Board / University (🏛️)'
                      : formatCategoryType === 'scholarship'
                      ? 'Scheme Name (🏅)'
                      : 'Organization / Department (📌)'}
                  </label>
                  <input
                    type="text"
                    value={customOrganization}
                    onChange={(e) => setCustomOrganization(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                  />
                </div>

                {formatCategoryType === 'admission' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Course / Programme (📘)
                    </label>
                    <input
                      type="text"
                      value={customCourse}
                      onChange={(e) => setCustomCourse(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                ) : formatCategoryType === 'result' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Examination (📝)
                    </label>
                    <input
                      type="text"
                      value={customExamination}
                      onChange={(e) => setCustomExamination(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      {formatCategoryType === 'scholarship'
                        ? 'Eligible Candidates (🎓)'
                        : 'Qualification / Eligibility (🎓)'}
                    </label>
                    <input
                      type="text"
                      value={customQualification}
                      onChange={(e) => setCustomQualification(e.target.value)}
                      placeholder="Omitted automatically if blank"
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                )}

                {formatCategoryType === 'admission' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Admission Session (🗓️)
                    </label>
                    <input
                      type="text"
                      value={customSession}
                      onChange={(e) => setCustomSession(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                ) : formatCategoryType === 'result' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Result Status / Date (📊)
                    </label>
                    <input
                      type="text"
                      value={customResultStatus}
                      onChange={(e) => setCustomResultStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Vacancies / Seats (👥)
                    </label>
                    <input
                      type="text"
                      value={customSeats}
                      onChange={(e) => setCustomSeats(e.target.value)}
                      placeholder="Omitted automatically if blank"
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                )}

                {formatCategoryType !== 'result' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Last Date (📅)
                    </label>
                    <input
                      type="text"
                      value={customLastDate}
                      onChange={(e) => setCustomLastDate(e.target.value)}
                      placeholder="Omitted automatically if blank"
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Option 1 WhatsApp Message Bubble / Syntax Preview */}
          {showRawTextInspector ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#475569]">
                <span className="font-semibold">
                  Raw WhatsApp-Compatible Text (Single asterisks for bold, underscores for italic):
                </span>
                <span className="font-mono">{currentFormattedMessage.length} chars</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#0F172A] text-emerald-300 font-mono text-xs whitespace-pre-wrap break-words leading-relaxed border border-slate-800">
                {currentFormattedMessage}
              </pre>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#E7F8EE] border border-emerald-300/70 text-[#0F172A] text-xs sm:text-[13px] shadow-2xs space-y-2.5 leading-relaxed">
              <div className="font-extrabold text-[#092442] tracking-tight">
                {currentNotificationPayload.heading.replace(/\*/g, '')}
                <div className="text-emerald-700/60 font-mono text-[11px] select-none">
                  ━━━━━━━━━━━━━━━━━━
                </div>
              </div>

              <div className="font-extrabold text-[#092442] text-sm leading-snug">
                🇮🇳 {currentNotificationPayload.shortTitle}
              </div>

              {currentNotificationPayload.fields.length > 0 && (
                <div className="space-y-1.5 text-[#0F172A]">
                  {currentNotificationPayload.fields.map((field, idx) => (
                    <p key={idx}>
                      {field.icon} <strong>{field.label}:</strong> {field.value}
                    </p>
                  ))}
                </div>
              )}

              <div className="space-y-1 pt-0.5">
                <div className="text-emerald-700/60 font-mono text-[11px] select-none">
                  ━━━━━━━━━━━━━━━━━━
                </div>
                <p className="font-bold text-[#092442]">🔗 Apply &amp; View Details:</p>
                <p className="text-[#0757AF] underline break-all font-mono text-xs pt-0.5">
                  {singleCanonicalUrl}
                </p>
                <p className="italic text-[#475569] text-[11.5px] pt-1">
                  CSC DOST — Citizen Service Portal
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION C: PUBLISHING DESTINATIONS (GROUPS, CHANNEL & OFFICIAL API)  */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0874DC] block">
              Section C
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#092442]">
              Publishing Destinations
            </h3>
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#475569] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useWhatsAppWebLink}
              onChange={(e) => setUseWhatsAppWebLink(e.target.checked)}
              className="rounded border-[#CBD5E1] text-[#0874DC] focus:ring-[#0874DC]"
            />
            <span>Prefer web.whatsapp.com on Desktop</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ================================================================ */}
          {/* DESTINATION CARD 1: SHARE TO WHATSAPP GROUPS                     */}
          {/* ================================================================ */}
          <div className="border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 bg-[#FAFCFF] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#092442]">
                      Share to WhatsApp Groups
                    </h4>
                    <span className="text-[11px] text-[#475569] block">
                      Target: <strong>{groupName}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingGroupSettings((prev) => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#334155] border border-[#CBD5E1] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>{editingGroupSettings ? 'Close' : 'Group Info'}</span>
                </button>
              </div>

              {editingGroupSettings && (
                <div className="p-3 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Community Group Label
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="CSC DOST Community Group"
                      className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Reference Group Invite Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={groupInviteUrl}
                      onChange={(e) => setGroupInviteUrl(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className={`w-full px-3 py-1.5 bg-[#F8FAFC] border rounded-lg text-xs font-mono text-[#0F172A] ${
                        isGroupUrlValid ? 'border-[#CBD5E1]' : 'border-red-400'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={savingDestinationConfig}
                      onClick={handleSaveDestinationConfig}
                      className="px-3 py-1.5 rounded-lg bg-[#06458F] hover:bg-[#0757AF] text-white text-xs font-bold cursor-pointer"
                    >
                      Save Group Label
                    </button>
                  </div>
                </div>
              )}

              {/* Clear Workflow Explanation */}
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#334155] space-y-1">
                <span className="font-bold text-[#092442] block">
                  How Group Sharing Works:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-[11.5px] text-[#475569]">
                  <li>
                    Click <strong>Share on WhatsApp</strong> below to open WhatsApp with the
                    encoded Option 1 notification.
                  </li>
                  <li>Select your existing CSC DOST WhatsApp Group(s) inside WhatsApp.</li>
                  <li>Confirm and press Send inside WhatsApp.</li>
                  <li>
                    Click <strong>Mark as Published</strong> in the history log to record admin
                    confirmation.
                  </li>
                </ol>
              </div>
            </div>

            {/* Required 3 Action Buttons for WhatsApp Groups */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleShareToWhatsAppGroups}
                className="w-full py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Share on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyGroupFormattedMessage}
                  className="py-2 px-3 rounded-xl bg-[#092442] hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedGroupMsg ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Message!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-300" />
                      <span>Copy Formatted Message</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyGroupPostLink}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#092442] border border-[#CBD5E1] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedGroupLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Post Link!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-[#0874DC]" />
                      <span>Copy Post Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* DESTINATION CARD 2: PUBLISH TO WHATSAPP CHANNEL                  */}
          {/* ================================================================ */}
          <div className="border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 bg-[#FAFCFF] flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#06458F] text-white flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-[#092442]">
                      Publish to WhatsApp Channel
                    </h4>
                    <span className="text-[11px] text-[#475569] block">
                      {isChannelUrlValid ? (
                        <span className="text-emerald-700 font-semibold">
                          ✓ Configured: {channelName}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          Configure your WhatsApp Channel URL below
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingChannelSettings((prev) => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#334155] border border-[#CBD5E1] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>{editingChannelSettings ? 'Close' : 'Channel URL'}</span>
                </button>
              </div>

              {/* Channel URL Configuration Box (Always visible if not configured yet, or when toggled) */}
              {(editingChannelSettings || !isChannelUrlValid) && (
                <div className="p-3 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      WhatsApp Channel Name
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="CSC DOST Official WhatsApp Channel"
                      className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#334155] mb-1">
                      Official WhatsApp Channel URL (https://whatsapp.com/channel/...)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={channelUrl}
                        onChange={(e) => setChannelUrl(e.target.value)}
                        placeholder="https://whatsapp.com/channel/0029Va..."
                        className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#0874DC]"
                      />
                      <button
                        type="button"
                        disabled={savingDestinationConfig}
                        onClick={handleSaveDestinationConfig}
                        className="px-3.5 py-1.5 rounded-lg bg-[#06458F] hover:bg-[#0757AF] text-white text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Save Channel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended 5-Step Channel Workflow */}
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#334155] space-y-1">
                <span className="font-bold text-[#092442] block">
                  Recommended Channel Workflow (Manual Completion Required in WhatsApp):
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-[11.5px] text-[#475569]">
                  <li>Select a post in Section A; the system prepares the Option 1 message.</li>
                  <li>
                    Click <strong>Copy Channel Notification</strong> to copy the formatted update.
                  </li>
                  <li>
                    Click <strong>Open My WhatsApp Channel</strong> to launch your Channel.
                  </li>
                  <li>
                    Paste and publish the update inside WhatsApp (opening the Channel does not
                    auto-publish).
                  </li>
                </ol>
              </div>
            </div>

            {/* Required 3 Action Buttons for WhatsApp Channel */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsAppChannel}
                className="w-full py-2.5 px-4 rounded-xl bg-[#06458F] hover:bg-[#0757AF] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Megaphone className="w-4 h-4 shrink-0" />
                <span>Open My WhatsApp Channel</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyChannelNotification}
                  className="py-2 px-3 rounded-xl bg-[#092442] hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedChannelMsg ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Channel Text!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-300" />
                      <span>Copy Channel Notification</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyChannelPostLink}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-[#092442] border border-[#CBD5E1] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedChannelLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Post Link!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3.5 h-3.5 text-[#0874DC]" />
                      <span>Copy Post Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* OPTIONAL OFFICIAL WHATSAPP BUSINESS PLATFORM API BAR               */}
        {/* ================================================================== */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#092442]">
                Official WhatsApp Business Platform API Status:
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                  diagnostics?.officialGroupsApiReady
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {diagnostics?.officialGroupsApiReady
                  ? '● Official Cloud API + Group ID Configured'
                  : '○ Official Group API Not Configured (Manual Group & Channel Active)'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                Channel Auto-API: Not Supported by Meta Graph API
              </span>
            </div>
            <p className="text-[11.5px] text-[#475569]">
              Automated API delivery is enabled only when valid server-side Meta Cloud API
              credentials (<code className="font-mono">WHATSAPP_CLOUD_API_TOKEN</code>,{' '}
              <code className="font-mono">WHATSAPP_PHONE_NUMBER_ID</code>, and{' '}
              <code className="font-mono">WHATSAPP_OFFICIAL_GROUP_ID</code>) are verified. No API
              tokens are stored in the browser.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              disabled={!diagnostics?.officialGroupsApiReady || isSubmittingOfficialApi}
              onClick={handleOfficialApiGroupPublish}
              title={
                diagnostics?.officialGroupsApiReady
                  ? 'Send via Official Meta WhatsApp Cloud API'
                  : 'Disabled: Configure official Meta Cloud API credentials on the server to enable API-managed group dispatch'
              }
              className="px-3.5 py-2 rounded-xl bg-[#175CEE] hover:bg-[#124FD1] disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmittingOfficialApi
                  ? 'Submitting to Cloud API...'
                  : diagnostics?.officialGroupsApiReady
                  ? 'Send via Official Cloud API'
                  : 'Automated API Disabled (Use Manual Share Above)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION D: PUBLISHING HISTORY                                        */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0874DC] block">
              Section D
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#092442] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0874DC]" />
              <span>Publishing History</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-mono">
              {publishHistory.length} record(s)
            </span>
            {publishHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {publishHistory.length === 0 ? (
          <div className="py-10 text-center space-y-1.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <FileText className="w-7 h-7 text-[#64748B] mx-auto" />
            <p className="text-xs font-bold text-[#092442]">No Publishing Activity Recorded Yet</p>
            <p className="text-xs text-[#64748B]">
              When you copy a notification, open WhatsApp Groups, or open your WhatsApp Channel,
              each step and its confirmation status will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  <th className="py-3 px-3.5">Notification Title</th>
                  <th className="py-3 px-3.5">Destination</th>
                  <th className="py-3 px-3.5">Sharing Method</th>
                  <th className="py-3 px-3.5">Date &amp; Time</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Admin User</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {publishHistory.map((entry) => {
                  const canConfirmManually =
                    entry.status === 'Prepared' || entry.status === 'Opened in WhatsApp';
                  return (
                    <tr key={entry.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-3.5 max-w-[260px]">
                        <span className="font-bold text-[#092442] block truncate">
                          {entry.title}
                        </span>
                        <a
                          href={entry.canonicalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10.5px] font-mono text-[#0874DC] hover:underline block truncate"
                        >
                          {entry.canonicalUrl}
                        </a>
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-[#1E293B] whitespace-nowrap">
                        {entry.destination}
                      </td>
                      <td className="py-3 px-3.5 text-[#475569] whitespace-nowrap">
                        {entry.sharingMethod}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[11px] text-[#475569] whitespace-nowrap">
                        {entry.dateTime}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {renderPublishStatusBadge(entry)}
                      </td>
                      <td className="py-3 px-3.5 font-medium text-[#1E293B] whitespace-nowrap">
                        {entry.adminUser}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        {canConfirmManually ? (
                          <button
                            type="button"
                            onClick={() => handleMarkAsPublished(entry.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Published</span>
                          </button>
                        ) : entry.status === 'Manually Confirmed' ? (
                          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                            ✓ Confirmed {entry.confirmedAt ? `(${entry.confirmedAt})` : ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
