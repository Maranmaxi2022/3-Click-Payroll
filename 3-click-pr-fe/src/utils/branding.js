const ACCENT_PRESETS = {
  blue: {
    id: "blue",
    label: "Blue",
    swatchClass: "bg-blue-500",
    activeClass: "bg-blue-500",
    ringClass: "ring-blue-200",
    softClass: "bg-blue-50",
    textClass: "text-blue-600",
    borderClass: "border-blue-500",
  },
  green: {
    id: "green",
    label: "Green",
    swatchClass: "bg-emerald-500",
    activeClass: "bg-emerald-500",
    ringClass: "ring-emerald-200",
    softClass: "bg-emerald-50",
    textClass: "text-emerald-600",
    borderClass: "border-emerald-500",
  },
  orange: {
    id: "orange",
    label: "Orange",
    swatchClass: "bg-amber-500",
    activeClass: "bg-amber-500",
    ringClass: "ring-amber-200",
    softClass: "bg-amber-50",
    textClass: "text-amber-600",
    borderClass: "border-amber-500",
  },
  red: {
    id: "red",
    label: "Red",
    swatchClass: "bg-rose-500",
    activeClass: "bg-rose-500",
    ringClass: "ring-rose-200",
    softClass: "bg-rose-50",
    textClass: "text-rose-600",
    borderClass: "border-rose-500",
  },
};

export const BRANDING_STORAGE_KEY = "branding:prefs";

export const BRANDING_DEFAULT = {
  appearance: "dark",
  accent: "blue",
};

export const ACCENT_LIST = Object.values(ACCENT_PRESETS);

export function getAccentPreset(id) {
  return ACCENT_PRESETS[id] ?? ACCENT_PRESETS.blue;
}

export function loadBrandingPreferences() {
  if (typeof window === "undefined") return { ...BRANDING_DEFAULT };
  try {
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return { ...BRANDING_DEFAULT };
    const parsed = JSON.parse(raw);
    const next = {
      ...BRANDING_DEFAULT,
      ...(parsed && typeof parsed === "object" ? parsed : {}),
    };
    // Sanitize unknown accents (e.g., legacy "zoho") to default
    if (!ACCENT_PRESETS[next.accent]) {
      next.accent = BRANDING_DEFAULT.accent;
    }
    return next;
  } catch (err) {
    console.warn("Failed to load branding preferences", err);
    return { ...BRANDING_DEFAULT };
  }
}

export function persistBrandingPreferences(nextPartial, currentState) {
  const base = currentState ?? loadBrandingPreferences();
  const patch =
    typeof nextPartial === "function" ? nextPartial(base) : nextPartial;
  const next = {
    ...base,
    ...(patch && typeof patch === "object" ? patch : {}),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.warn("Failed to persist branding preferences", err);
    }

    try {
      window.dispatchEvent(new CustomEvent("branding:update", { detail: next }));
    } catch (err) {
      console.warn("Failed to broadcast branding preferences", err);
    }
  }

  return next;
}
