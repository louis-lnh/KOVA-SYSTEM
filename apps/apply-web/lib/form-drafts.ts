const pendingSubmitKey = "kova-apply-pending-submit";

function getDraftKey(formKey: string) {
  return `kova-apply-draft:${formKey}`;
}

export function saveDraft<T>(formKey: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getDraftKey(formKey), JSON.stringify(value));
}

export function loadDraft<T>(formKey: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getDraftKey(formKey));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(getDraftKey(formKey));
    return null;
  }
}

export function clearDraft(formKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getDraftKey(formKey));
}

export function markPendingSubmit(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(pendingSubmitKey, path);
}

export function getPendingSubmit() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(pendingSubmitKey);
}

export function clearPendingSubmit() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(pendingSubmitKey);
}
