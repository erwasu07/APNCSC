/**
 * PocketBase Migration Stub - Redirected to Getform.io & Formspree
 * All PocketBase SDK dependencies have been replaced.
 */

import { saveApplicationToFormEndpoint, getFormEndpoint, setFormEndpoint } from './getform';

export function getPocketBaseUrl(): string {
  return getFormEndpoint();
}

export function setPocketBaseUrl(url: string) {
  setFormEndpoint(url);
}

export function getPocketBaseClient(): null {
  return null;
}

export async function saveApplicationToPocketBase(
  appId: string,
  payload: any
): Promise<{ success: boolean; error?: string }> {
  return saveApplicationToFormEndpoint(appId, payload);
}

export async function fetchApplicationsFromPocketBase(): Promise<any[]> {
  return [];
}

export async function updatePocketBaseApplicationStatus(): Promise<boolean> {
  return true;
}
