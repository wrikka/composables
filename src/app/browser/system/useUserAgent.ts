import { computed } from 'vue';

export interface UserAgentInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useUserAgent() {
  const userAgent = navigator.userAgent;

  const browser = computed(() => {
    if (userAgent.includes('Firefox'))
      return 'Firefox';
    if (userAgent.includes('Chrome'))
      return 'Chrome';
    if (userAgent.includes('Safari'))
      return 'Safari';
    if (userAgent.includes('Edge'))
      return 'Edge';
    if (userAgent.includes('Opera'))
      return 'Opera';
    return 'Unknown';
  });

  const browserVersion = computed(() => {
    const match = userAgent.match(/(Firefox|Chrome|Safari|Edge|Opera)\/(\d+\.\d+)/);
    return match ? match[2] : 'Unknown';
  });

  const os = computed(() => {
    if (userAgent.includes('Windows'))
      return 'Windows';
    if (userAgent.includes('Mac'))
      return 'Mac';
    if (userAgent.includes('Linux'))
      return 'Linux';
    if (userAgent.includes('Android'))
      return 'Android';
    if (userAgent.includes('iOS'))
      return 'iOS';
    return 'Unknown';
  });

  const osVersion = computed(() => {
    if (userAgent.includes('Windows NT 10.0'))
      return '10';
    if (userAgent.includes('Windows NT 6.3'))
      return '8.1';
    if (userAgent.includes('Windows NT 6.2'))
      return '8';
    if (userAgent.includes('Windows NT 6.1'))
      return '7';
    if (userAgent.includes('Mac OS X'))
      return userAgent.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
    if (userAgent.includes('Android'))
      return userAgent.match(/Android ([\d.]+)/)?.[1] || 'Unknown';
    if (userAgent.includes('iOS'))
      return userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
    return 'Unknown';
  });

  const device = computed(() => {
    if (userAgent.includes('Mobile'))
      return 'Mobile';
    if (userAgent.includes('Tablet'))
      return 'Tablet';
    return 'Desktop';
  });

  const isMobile = computed(() => /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent));
  const isTablet = computed(() => /Tablet|iPad/i.test(userAgent));
  const isDesktop = computed(() => !isMobile.value && !isTablet.value);

  const info = computed<UserAgentInfo>(() => ({
    userAgent,
    browser: browser.value,
    browserVersion: browserVersion.value,
    os: os.value,
    osVersion: osVersion.value,
    device: device.value,
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
  }));

  return {
    userAgent,
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    isMobile,
    isTablet,
    isDesktop,
    info,
  };
}
