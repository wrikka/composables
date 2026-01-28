import { computed } from 'vue';

export interface PlatformInfo {
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  maxTouchPoints: number;
}

export function usePlatform() {
  const platform = computed(() => navigator.platform);
  const vendor = computed(() => navigator.vendor);
  const language = computed(() => navigator.language);
  const languages = computed(() => navigator.languages);
  const cookieEnabled = computed(() => navigator.cookieEnabled);
  const doNotTrack = computed(() => navigator.doNotTrack);
  const hardwareConcurrency = computed(() => navigator.hardwareConcurrency || 0);
  const maxTouchPoints = computed(() => navigator.maxTouchPoints || 0);

  const info = computed<PlatformInfo>(() => ({
    platform: platform.value,
    vendor: vendor.value,
    language: language.value,
    languages: languages.value,
    cookieEnabled: cookieEnabled.value,
    doNotTrack: doNotTrack.value,
    hardwareConcurrency: hardwareConcurrency.value,
    maxTouchPoints: maxTouchPoints.value,
  }));

  return {
    platform,
    vendor,
    language,
    languages,
    cookieEnabled,
    doNotTrack,
    hardwareConcurrency,
    maxTouchPoints,
    info,
  };
}
