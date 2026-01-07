import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfirm, useGlobalConfirm } from './useConfirm'

describe('useConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty dialogs', () => {
    const { dialogs, isActive } = useConfirm()

    expect(dialogs.value).toEqual([])
    expect(isActive.value).toBe(false)
  })

  it('should create confirm dialog', async () => {
    const { dialogs, isActive, confirm } = useConfirm()

    const promise = confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })

    expect(dialogs.value).toHaveLength(1)
    expect(isActive.value).toBe(true)
    expect(dialogs.value[0]).toMatchObject({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })

    // Simulate confirm action
    const dialog = dialogs.value[0]
    if (dialog) dialog.resolve(true)

    const result = await promise
    expect(result).toBe(true)
  })

  it('should use default options', async () => {
    const defaultOptions = {
      title: 'Confirm Action',
      confirmText: 'OK',
      cancelText: 'Cancel',
      type: 'warning' as const
    }

    const { dialogs, confirm } = useConfirm(defaultOptions)

    const promise = confirm({
      message: 'Custom message'
    })

    expect(dialogs.value[0]).toMatchObject({
      title: 'Confirm Action',
      confirmText: 'OK',
      cancelText: 'Cancel',
      type: 'warning',
      message: 'Custom message'
    })

    if (dialogs.value[0]) dialogs.value[0].resolve(true)
    await promise
  })

  it('should handle confirm action', async () => {
    const { dialogs, confirm, confirmAction, isActive } = useConfirm()

    const promise = confirm({ title: 'Test' })
    const dialog = dialogs.value[0]
    if (dialog) confirmAction(dialog.id)

    const result = await promise
    expect(result).toBe(true)
    expect(dialogs.value).toHaveLength(0)
    expect(isActive.value).toBe(false)
  })

  it('should handle cancel action', async () => {
    const { dialogs, confirm, cancelAction, isActive } = useConfirm()

    const promise = confirm({ title: 'Test' })
    const dialog = dialogs.value[0]
    if (dialog) cancelAction(dialog.id)

    const result = await promise
    expect(result).toBe(false)
    expect(dialogs.value).toHaveLength(0)
    expect(isActive.value).toBe(false)
  })

  it('should handle reject action', async () => {
    const { dialogs, confirm, rejectAction, isActive } = useConfirm()

    const promise = confirm({ title: 'Test' })
    const dialog = dialogs.value[0]

    if (dialog) rejectAction(dialog.id)

    await expect(promise).rejects.toBeUndefined()
    expect(dialogs.value).toHaveLength(0)
    expect(isActive.value).toBe(false)
  })

  it('should handle multiple dialogs', async () => {
    const { dialogs, isActive, confirm, confirmAction } = useConfirm()

    const promise1 = confirm({ title: 'Dialog 1' })
    const promise2 = confirm({ title: 'Dialog 2' })

    expect(dialogs.value).toHaveLength(2)
    expect(isActive.value).toBe(true)

    // Confirm first dialog
    if (dialogs.value[0]) confirmAction(dialogs.value[0].id)
    expect(await promise1).toBe(true)
    expect(dialogs.value).toHaveLength(1)
    expect(isActive.value).toBe(true)

    // Confirm second dialog
    if (dialogs.value[0]) confirmAction(dialogs.value[0].id)
    expect(await promise2).toBe(true)
    expect(dialogs.value).toHaveLength(0)
    expect(isActive.value).toBe(false)
  })

  it('should clear all dialogs', async () => {
    const { dialogs, isActive, confirm, clearAll } = useConfirm()

    const promise1 = confirm({ title: 'Dialog 1' })
    const promise2 = confirm({ title: 'Dialog 2' })

    expect(dialogs.value).toHaveLength(2)

    clearAll()

    expect(dialogs.value).toHaveLength(0)
    expect(isActive.value).toBe(false)

    // All promises should resolve with false
    expect(await promise1).toBe(false)
    expect(await promise2).toBe(false)
  })

  it('should generate unique IDs', () => {
    const { dialogs, confirm } = useConfirm()

    confirm({ title: 'Dialog 1' })
    confirm({ title: 'Dialog 2' })

    const ids = dialogs.value.map(d => d.id)
    expect(ids[0]).not.toBe(ids[1])
    expect(ids[0]).toMatch(/^confirm-\d+-[a-z0-9]+$/)
    expect(ids[1]).toMatch(/^confirm-\d+-[a-z0-9]+$/)
  })

  it('should include timestamp', () => {
    const { dialogs, confirm } = useConfirm()

    const beforeTime = Date.now()
    confirm({ title: 'Test' })
    const afterTime = Date.now()

    expect(dialogs.value[0]).toBeDefined()
    expect(dialogs.value[0]!.timestamp).toBeGreaterThanOrEqual(beforeTime)
    expect(dialogs.value[0]!.timestamp).toBeLessThanOrEqual(afterTime)
  })

  it('should handle empty options', async () => {
    const { dialogs, confirm } = useConfirm()

    const promise = confirm()
    const dialog = dialogs.value[0]

    expect(dialog).toBeDefined()
    expect(dialog).toMatchObject({
      title: undefined,
      message: undefined,
      confirmText: undefined,
      cancelText: undefined,
      type: undefined,
      persistent: undefined
    })

    dialog!.resolve(true)
    await promise
  })
})

describe('useGlobalConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return same instance on multiple calls', () => {
    const instance1 = useGlobalConfirm()
    const instance2 = useGlobalConfirm()

    expect(instance1).toBe(instance2)
  })

  it('should share state across instances', async () => {
    const global1 = useGlobalConfirm()
    const global2 = useGlobalConfirm()

    const promise1 = global1.confirm({ title: 'Test' })
    expect(global2.dialogs.value).toHaveLength(1)

    expect(global2.dialogs.value[0]).toBeDefined()
    global2.confirmAction(global2.dialogs.value[0]!.id)
    expect(await promise1).toBe(true)
  })
})
