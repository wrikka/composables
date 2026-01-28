import { describe, it, expect } from 'vitest'
import { useStorageMigration } from './useStorageMigration'

describe('useStorageMigration', () => {
  it('should migrate data', async () => {
    const { migrate, isMigrating } = useStorageMigration()

    const result = await migrate({ key: 'value' }, '1.0', '1.1')

    expect(result).toEqual({
      key: 'value',
      version: '1.1',
      migratedAt: expect.any(String),
    })
    expect(isMigrating.value).toBe(false)
  })

  it('should handle migration errors', async () => {
    const { migrate, error } = useStorageMigration()

    try {
      await migrate({ key: 'value' }, '1.0', '2.0')
    } catch (err) {
      expect(error.value).toBeInstanceOf(Error)
    }
  })
})
