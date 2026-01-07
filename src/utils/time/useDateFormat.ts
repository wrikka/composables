import { computed, type Ref } from 'vue'

export interface UseDateFormatOptions {
  format?: string
  locale?: string
}

export function useDateFormat(date: Date | string | number | Ref<Date | string | number>, options: UseDateFormatOptions = {}) {
  const { format = 'YYYY-MM-DD', locale = 'en-US' } = options

  const formattedDate = computed(() => {
    const dateValue = typeof date === 'object' && 'value' in date ? date.value : date
    const dateObj = new Date(dateValue)

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    switch (format) {
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0]
      case 'DD/MM/YYYY':
        return `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`
      case 'MM/DD/YYYY':
        return `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}/${dateObj.getFullYear()}`
      case 'YYYY-MM-DD HH:mm:ss':
        return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`
      case 'locale':
        return dateObj.toLocaleDateString(locale)
      case 'locale-time':
        return dateObj.toLocaleString(locale)
      default:
        return dateObj.toString()
    }
  })

  return {
    formattedDate
  }
}
