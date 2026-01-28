import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export interface Hotkey {
  key: string;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

export function useHotkeys(hotkeys: Hotkey[], options: {
  enabled?: Ref<boolean> | boolean;
  target?: Window | HTMLElement;
} = {}) {
  const { enabled = true, target = window } = options;
  const isEnabled = ref(typeof enabled === 'boolean' ? enabled : enabled.value);

  function handleKeyDown(e: KeyboardEvent) {
    if (!isEnabled.value) {
      return;
    }

    hotkeys.forEach((hotkey) => {
      const keys = hotkey.key.split('+').map(k => k.trim().toLowerCase());
      const eventKey = e.key.toLowerCase();
      const eventModifiers: string[] = [];

      if (e.ctrlKey) eventModifiers.push('ctrl');
      if (e.altKey) eventModifiers.push('alt');
      if (e.shiftKey) eventModifiers.push('shift');
      if (e.metaKey) eventModifiers.push('meta');

      const allKeys = [...eventModifiers, eventKey];

      if (keys.length === allKeys.length && keys.every(k => allKeys.includes(k))) {
        e.preventDefault();
        hotkey.handler(e);
      }
    });
  }

  function addHotkey(hotkey: Hotkey) {
    hotkeys.push(hotkey);
  }

  function removeHotkey(key: string) {
    const index = hotkeys.findIndex(h => h.key === key);
    if (index !== -1) {
      hotkeys.splice(index, 1);
    }
  }

  function setEnabled(value: boolean) {
    isEnabled.value = value;
  }

  onMounted(() => {
    target.addEventListener('keydown', handleKeyDown as EventListener);
  });

  onUnmounted(() => {
    target.removeEventListener('keydown', handleKeyDown as EventListener);
  });

  return {
    isEnabled,
    addHotkey,
    removeHotkey,
    setEnabled,
  };
}
