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
  try {
    const parsed = JSON.parse(boqType);
    return Array.isArray(parsed) ? parsed : [boqType];
  } catch {
    return boqType ? [boqType] : [];
  }
}

/**
 * Serialize packages array to JSON string for storage
 */
export function serializePackages(packages: string[]): string {
  return JSON.stringify(packages);
}
