export const BOQ_PACKAGE_OPTIONS = [
  { value: "Electrical", label: "Electrical" },
  { value: "HVAC Ducting", label: "HVAC Ducting" },
  { value: "HVAC VRF-DX", label: "HVAC VRF-DX" },
  { value: "HVAC AHU+Chilled Water", label: "HVAC AHU+Chilled Water" },
  { value: "FA", label: "FA" },
  { value: "PA", label: "PA" },
  { value: "Access Control", label: "Access Control" },
  { value: "CCTV", label: "CCTV" },
  { value: "Data & Networking", label: "Data & Networking" },
  { value: "BMS", label: "BMS" },
] as const;

export type BoqPackageOption = (typeof BOQ_PACKAGE_OPTIONS)[number];

/**
 * Parse boq_type field which can be:
 * - JSON array string: '["Electrical", "HVAC Ducting"]'
 * - Legacy plain string: "Interior Fitout"
 * - undefined/null/empty
 */
export function parsePackages(boqType: string | undefined | null): string[] {
  if (!boqType) return [];

  const normalizeArray = (values: unknown[]): string[] => {
    const seen = new Set<string>();
    const normalized: string[] = [];

    values.forEach((value) => {
      const cleaned = String(value ?? "").trim();
      if (!cleaned || seen.has(cleaned)) return;
      seen.add(cleaned);
      normalized.push(cleaned);
    });

    return normalized;
  };

  try {
    const parsed = JSON.parse(boqType);
    if (Array.isArray(parsed)) {
      return normalizeArray(parsed);
    }
  } catch {
    // Legacy values may be comma-separated plain text.
  }

  const cleaned = boqType.trim();
  if (!cleaned) return [];

  if (cleaned.includes(",")) {
    return normalizeArray(cleaned.split(","));
  }

  return [cleaned];
}

/**
 * Serialize packages array to JSON string for storage
 */
export function serializePackages(packages: string[]): string {
  return JSON.stringify(packages);
}
