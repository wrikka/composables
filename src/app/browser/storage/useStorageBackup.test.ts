import { describe, it, expect } from 'vitest'
import { useStorageBackup } from './useStorageBackup'

describe('useStorageBackup', () => {
  it('should backup data', async () => {
    const { backup, isBackingUp } = useStorageBackup()

    const result = await backup({ key: 'value' })

    expect(result).toBeDefined()
    expect(isBackingUp.value).toBe(false)
  })

  it('should restore data', async () => {
    const { restore, isRestoring } = useStorageBackup()

    const backupData = JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: { key: 'value' },
    })

    const result = await restore(backupData)

    expect(result).toEqual({ key: 'value' })
    expect(isRestoring.value).toBe(false)
  })

  it('should handle restore errors', async () => {
    const { restore, error } = useStorageBackup()

    try {
      await restore('invalid json')
    } catch (err) {
      expect(error.value).toBeInstanceOf(Error)
    }
  })
})
