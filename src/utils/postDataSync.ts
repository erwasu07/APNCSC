import { useState, useEffect } from 'react';
import {
  SARKARI_DATA,
  SarkariItem,
  isPublishedSarkariItem,
  parseSarkariDateSortValue,
} from '../data/sarkariData';
import { normalizeSarkariItem } from '../data/sarkariMigration';

let cachedRuntimePosts: SarkariItem[] | null = null;
let inflightFetch: Promise<SarkariItem[]> | null = null;

export function mergeSarkariPostsList(
  staticPosts: SarkariItem[],
  runtimePosts: SarkariItem[]
): SarkariItem[] {
  const byId = new Map<string, SarkariItem>();
  for (const item of staticPosts) {
    if (item && item.id) byId.set(item.id, normalizeSarkariItem(item));
  }
  for (const item of runtimePosts) {
    if (!item || !item.id) continue;
    const prev = byId.get(item.id);
    byId.set(item.id, normalizeSarkariItem(prev ? { ...prev, ...item } : item));
  }
  return Array.from(byId.values());
}

export async function fetchSyncedSarkariPosts(force = false): Promise<SarkariItem[]> {
  if (!force && cachedRuntimePosts) {
    return cachedRuntimePosts;
  }
  if (!force && inflightFetch) {
    return inflightFetch;
  }

  inflightFetch = fetch('/api/sarkari-posts')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (d && Array.isArray(d.posts) && d.posts.length > 0) {
        const hiddenSet = new Set<string>(Array.isArray(d.hiddenIds) ? d.hiddenIds : []);
        const visibleStatic = SARKARI_DATA.filter((item) => !hiddenSet.has(item.id));
        cachedRuntimePosts = mergeSarkariPostsList(visibleStatic, d.posts);
        return cachedRuntimePosts;
      }
      return SARKARI_DATA;
    })
    .catch(() => cachedRuntimePosts || SARKARI_DATA)
    .finally(() => {
      inflightFetch = null;
    });

  return inflightFetch;
}

export function notifySarkariPostsUpdated(): void {
  cachedRuntimePosts = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('csc-posts-updated'));
  }
}

export function useSyncedSarkariPosts(includeUnpublished = false): SarkariItem[] {
  const [allPosts, setAllPosts] = useState<SarkariItem[]>(
    () => cachedRuntimePosts || SARKARI_DATA
  );

  useEffect(() => {
    let mounted = true;
    fetchSyncedSarkariPosts().then((list) => {
      if (mounted) setAllPosts(list);
    });

    const handleRefresh = () => {
      fetchSyncedSarkariPosts(true).then((list) => {
        if (mounted) setAllPosts(list);
      });
    };

    window.addEventListener('csc-posts-updated', handleRefresh);
    return () => {
      mounted = false;
      window.removeEventListener('csc-posts-updated', handleRefresh);
    };
  }, []);

  if (includeUnpublished) return allPosts;
  return allPosts.filter(isPublishedSarkariItem);
}

export function sortByNewestPostDate(a: SarkariItem, b: SarkariItem): number {
  return parseSarkariDateSortValue(b.postDate) - parseSarkariDateSortValue(a.postDate);
}
