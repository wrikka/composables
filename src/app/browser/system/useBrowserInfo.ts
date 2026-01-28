import { computed } from 'vue';

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isIE: boolean;
}

export function useBrowserInfo() {
  const userAgent = navigator.userAgent;

  const name = computed(() => {
    if (userAgent.includes('Firefox'))
      return 'Firefox';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge'))
      return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
      return 'Safari';
    if (userAgent.includes('Edge'))
      return 'Edge';
    if (userAgent.includes('Opera'))
      return 'Opera';
    if (userAgent.includes('Trident'))
      return 'Internet Explorer';
    return 'Unknown';
  });

  const version = computed(() => {
    const match = userAgent.match(/(Firefox|Chrome|Safari|Edge|Opera|MSIE|rv:)\/?\s*(\d+\.?\d*)/);
    return match ? match[2] : 'Unknown';
  });

  const engine = computed(() => {
    if (userAgent.includes('WebKit'))
      return 'WebKit';
    if (userAgent.includes('Gecko'))
      return 'Gecko';
    if (userAgent.includes('Trident'))
      return 'Trident';
    if (userAgent.includes('Presto'))
      return 'Presto';
    return 'Unknown';
  });

  const isChrome = computed(() => userAgent.includes('Chrome') && !userAgent.includes('Edge'));
  const isFirefox = computed(() => userAgent.includes('Firefox'));
  const isSafari = computed(() => userAgent.includes('Safari') && !userAgent.includes('Chrome'));
  const isEdge = computed(() => userAgent.includes('Edge'));
  const isOpera = computed(() => userAgent.includes('Opera'));
  const isIE = computed(() => userAgent.includes('Trident') || userAgent.includes('MSIE'));

  const info = computed<BrowserInfo>(() => ({
    name: name.value,
    version: version.value,
    engine: engine.value,
    isChrome: isChrome.value,
    isFirefox: isFirefox.value,
    isSafari: isSafari.value,
    isEdge: isEdge.value,
    isOpera: isOpera.value,
    isIE: isIE.value,
  }));

  return {
    name,
    version,
    engine,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isOpera,
    isIE,
    info,
  };
}
