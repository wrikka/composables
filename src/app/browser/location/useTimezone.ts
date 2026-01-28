import { computed } from 'vue'

export interface TimezoneInfo {
  timezone: string
  offset: number
  dst: boolean
  name: string
}

export function useTimezone() {
  const timezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
  const offset = computed(() => new Date().getTimezoneOffset())
  const dst = computed(() => {
    const jan = new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset()
    const jul = new Date(new Date().getFullYear(), 6, 1).getTimezoneOffset()
    return jan !== jul
  })
  const name = computed(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    catch {
      return 'UTC'
    }
  })

  const info = computed<TimezoneInfo>(() => ({
    timezone: timezone.value,
    offset: offset.value,
    dst: dst.value,
    name: name.value,
  }))

  function convertToTimezone(date: Date, targetTimezone: string): Date {
    const str = new Date(date).toLocaleString('en-US', { timeZone: targetTimezone })
    return new Date(str)
  }

  function formatInTimezone(date: Date, format: Intl.DateTimeFormatOptions, timezone?: string): string {
    return new Date(date).toLocaleString('en-US', {
      ...format,
      timeZone: timezone || timezone.value,
    })
  }

  return {
    timezone,
    offset,
    dst,
    name,
    info,
    convertToTimezone,
    formatInTimezone,
  }
}
