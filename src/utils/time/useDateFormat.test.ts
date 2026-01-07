import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useDateFormat } from './useDateFormat'

describe('useDateFormat', () => {
  it('should format date with default format', () => {
    const date = new Date('2023-12-25')
    const { formattedDate } = useDateFormat(date)

    expect(formattedDate.value).toBe('2023-12-25')
  })

  it('should format date with custom format', () => {
    const date = new Date('2023-12-25')
    const { formattedDate } = useDateFormat(date, { format: 'DD/MM/YYYY' })

    expect(formattedDate.value).toBe('25/12/2023')
  })

  it('should handle string date input', () => {
    const { formattedDate } = useDateFormat('2023-12-25')

    expect(formattedDate.value).toBe('2023-12-25')
  })

  it('should handle reactive date input', () => {
    const date = ref('2023-12-25')
    const { formattedDate } = useDateFormat(date)

    expect(formattedDate.value).toBe('2023-12-25')

    date.value = '2024-01-01'
    expect(formattedDate.value).toBe('2024-01-01')
  })

  it('should handle invalid date', () => {
    const { formattedDate } = useDateFormat('invalid-date')

    expect(formattedDate.value).toBe('Invalid Date')
  })

  it('should format with locale', () => {
    const date = new Date('2023-12-25')
    const { formattedDate } = useDateFormat(date, { format: 'locale', locale: 'en-US' })

    expect(formattedDate.value).toBe('12/25/2023')
  })

  it('should format with locale and time', () => {
    const date = new Date('2023-12-25T10:30:00')
    const { formattedDate } = useDateFormat(date, { format: 'locale-time', locale: 'en-US' })

    expect(formattedDate.value).toMatch(/12\/25\/2023.*10:30/)
  })

  it('should handle different date formats', () => {
    const date = new Date('2023-12-25')
    
    const { formattedDate: mmddyyyy } = useDateFormat(date, { format: 'MM/DD/YYYY' })
    expect(mmddyyyy.value).toBe('12/25/2023')

    const { formattedDate: withTime } = useDateFormat(date, { format: 'YYYY-MM-DD HH:mm:ss' })
    expect(withTime.value).toBe('2023-12-25 00:00:00')
  })
})
