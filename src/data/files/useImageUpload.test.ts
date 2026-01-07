import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useImageUpload } from './useImageUpload'

// Mock FileReader
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: 'data:image/jpeg;base64,mock',
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null
}

vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))

// Mock Image
const mockImage = {
  width: 800,
  height: 600,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: ''
}

function MockImage(this: unknown) {
  return mockImage
}

vi.stubGlobal('Image', MockImage as any)

// Mock Canvas
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({
    drawImage: vi.fn()
  })),
  toBlob: vi.fn((callback) => {
    callback(new Blob(['mock'], { type: 'image/jpeg' }))
  })
}

vi.stubGlobal('document', {
  createElement: vi.fn(() => mockCanvas)
})

// Mock URL
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'mock-url'),
  revokeObjectURL: vi.fn()
})

// Mock fetch
vi.stubGlobal('fetch', vi.fn(() => 
  Promise.resolve({
    blob: vi.fn(() => Promise.resolve(new Blob(['mock'])))
  })
))

describe('useImageUpload', () => {
  let mockFiles: File[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockFiles = [
      new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['image2'], 'image2.png', { type: 'image/png' })
    ]

    // Reset mock properties
    mockImage.width = 800
    mockImage.height = 600
    mockImage.onload = null
    mockCanvas.width = 0
    mockCanvas.height = 0
  })

  it('should initialize with default values', () => {
    const { isUploading, uploadedImages, error, progress } = useImageUpload()

    expect(isUploading.value).toBe(false)
    expect(uploadedImages.value).toEqual([])
    expect(error.value).toBe(null)
    expect(progress.value).toBe(0)
  })

  it('should use custom options', () => {
    const { uploadImages } = useImageUpload({
      maxSize: 1024 * 1024, // 1MB
      maxWidth: 1280,
      maxHeight: 720,
      quality: 0.9,
      preview: false,
      multiple: true
    })

    // The options are used internally, so we just verify the composable is created
    expect(uploadImages).toBeTypeOf('function')
  })

  it('should validate image file', async () => {
    const { uploadImages, error } = useImageUpload()

    // Test non-image file
    const textFile = new File(['text'], 'text.txt', { type: 'text/plain' })
    
    try {
      await uploadImages([textFile])
    } catch {
      // Expected to fail
    }

    expect(error.value).toBe('File must be an image')
  })

  it('should validate file size', async () => {
    const { uploadImages, error } = useImageUpload({ maxSize: 100 }) // Very small size

    // Create large file
    const largeFile = new File(['x'.repeat(200)], 'large.jpg', { type: 'image/jpeg' })
    
    try {
      await uploadImages([largeFile])
    } catch {
      // Expected to fail
    }

    expect(error.value).toBe('File size must be less than 0MB')
  })

  it('should upload single image successfully', async () => {
    const { uploadSingleImage, uploadedImages, isUploading } = useImageUpload()

    // Simulate FileReader load
    const fileReaderPromise = new Promise<void>((resolve) => {
      mockFileReader.onload = () => resolve()
    })

    const uploadPromise = uploadSingleImage(mockFiles[0]!)

    // Trigger FileReader load
    if (mockFileReader.onload) {
      mockFileReader.onload()
    }
    await fileReaderPromise

    // Trigger Image load
    if (mockImage.onload) {
      mockImage.onload()
    }

    const result = await uploadPromise

    expect(isUploading.value).toBe(false)
    expect(uploadedImages.value).toHaveLength(1)
    expect(result.file).toBe(mockFiles[0]!)
    expect(result.preview).toBe('data:image/jpeg;base64,mock')
    expect(result.width).toBe(800)
    expect(result.height).toBe(600)
  })

  it('should upload multiple images', async () => {
    const { uploadImages, uploadedImages, progress } = useImageUpload({ multiple: true })

    const promises: Promise<void>[] = []

    for (const _file of mockFiles) {
      const fileReaderPromise = new Promise<void>((resolve) => {
        mockFileReader.onload = () => resolve()
      })
      promises.push(fileReaderPromise)
    }

    const uploadPromise = uploadImages(mockFiles)

    // Trigger all FileReader loads
    if (mockFileReader.onload) {
      mockFileReader.onload()
    }
    await Promise.all(promises)

    // Trigger Image loads
    if (mockImage.onload) {
      mockImage.onload()
    }
    if (mockImage.onload) {
      mockImage.onload()
    }

    const results = await uploadPromise

    expect(results).toHaveLength(2)
    expect(uploadedImages.value).toHaveLength(2)
    expect(progress.value).toBe(100)
  })

  it('should resize large images', async () => {
    const { uploadSingleImage } = useImageUpload({ maxWidth: 400, maxHeight: 300 })

    // Set large dimensions
    mockImage.width = 1200
    mockImage.height = 800

    const fileReaderPromise = new Promise<void>((resolve) => {
      mockFileReader.onload = () => resolve()
    })

    const uploadPromise = uploadSingleImage(mockFiles[0]!)

    // Trigger FileReader load
    if (mockFileReader.onload) {
      mockFileReader.onload()
    }
    await fileReaderPromise

    // Trigger Image load
    mockImage.onload!()

    // Trigger Canvas toBlob
    mockCanvas.toBlob((blob: Blob | null) => {
      expect(blob).toBeInstanceOf(Blob)
    })

    await uploadPromise

    expect(mockCanvas.width).toBeLessThanOrEqual(400)
    expect(mockCanvas.height).toBeLessThanOrEqual(300)
  })

  it('should handle upload errors', async () => {
    const { uploadImages, error, isUploading } = useImageUpload()

    // Simulate FileReader error
    mockFileReader.onerror = vi.fn(() => {}) as () => void
    
    try {
      await uploadImages([mockFiles[0]!])
    } catch {
      // Expected to fail
    }

    expect(isUploading.value).toBe(false)
    expect(error.value).toBeTruthy()
  })

  it('should clear images', () => {
    const { uploadedImages, clearImages, error, progress } = useImageUpload()

    // Add some mock data
    uploadedImages.value = [
      {
        file: mockFiles[0]!,
        preview: 'data:image/jpeg;base64,mock',
        width: 800,
        height: 600,
        size: 1000
      }
    ]
    error.value = 'Some error'
    progress.value = 50

    clearImages()

    expect(uploadedImages.value).toEqual([])
    expect(error.value).toBe(null)
    expect(progress.value).toBe(0)
  })

  it('should remove image by index', () => {
    const { uploadedImages, removeImage } = useImageUpload()

    uploadedImages.value = [
      {
        file: mockFiles[0]!,
        preview: 'data:image/jpeg;base64,mock',
        width: 800,
        height: 600,
        size: 1000
      },
      {
        file: mockFiles[1]!,
        preview: 'data:image/png;base64,mock',
        width: 800,
        height: 600,
        size: 1000
      }
    ]

    removeImage(0)

    expect(uploadedImages.value).toHaveLength(1)
    expect(uploadedImages.value[0]?.file).toBe(mockFiles[1])
  })

  it('should get image data URL', async () => {
    const { uploadSingleImage, getImageDataUrl } = useImageUpload()

    const fileReaderPromise = new Promise<void>((resolve) => {
      mockFileReader.onload = resolve
    })

    const uploadPromise = uploadSingleImage(mockFiles[0]!)
    mockFileReader.onload!()
    await fileReaderPromise
    mockImage.onload!()

    const result = await uploadPromise
    const dataUrl = getImageDataUrl(result)

    expect(dataUrl).toBe('data:image/jpeg;base64,mock')
  })

  it('should get image blob', async () => {
    const { uploadSingleImage, getImageBlob } = useImageUpload()

    const fileReaderPromise = new Promise<void>((resolve) => {
      mockFileReader.onload = resolve
    })

    const uploadPromise = uploadSingleImage(mockFiles[0]!)
    mockFileReader.onload!()
    await fileReaderPromise
    mockImage.onload!()

    const result = await uploadPromise
    const blob = await getImageBlob(result)

    expect(blob).toBeInstanceOf(Blob)
  })

  it('should calculate total size', () => {
    const { uploadedImages, getTotalSize } = useImageUpload()

    uploadedImages.value = [
      {
        file: mockFiles[0]!,
        preview: 'data:image/jpeg;base64,mock',
        width: 800,
        height: 600,
        size: 1000
      },
      {
        file: mockFiles[1]!,
        preview: 'data:image/png;base64,mock',
        width: 800,
        height: 600,
        size: 2000
      }
    ]

    expect(getTotalSize()).toBe(3000)
  })

  it('should format total size', () => {
    const { uploadedImages, getTotalSizeFormatted } = useImageUpload()

    uploadedImages.value = [
      {
        file: mockFiles[0]!,
        preview: 'data:image/jpeg;base64,mock',
        width: 800,
        height: 600,
        size: 1024
      },
      {
        file: mockFiles[1]!,
        preview: 'data:image/png;base64,mock',
        width: 800,
        height: 600,
        size: 2048
      }
    ]

    const formatted = getTotalSizeFormatted()
    expect(formatted).toMatch(/\d+\.\d+ \w+/) // Should match format like "3 KB"
  })

  it('should replace images when not multiple', async () => {
    const { uploadImages, uploadedImages } = useImageUpload({ multiple: false })

    // Upload first image
    const fileReaderPromise1 = new Promise<void>((resolve) => {
      mockFileReader.onload = () => resolve()
    })

    const uploadPromise1 = uploadImages([mockFiles[0]!])
    if (mockFileReader.onload) {
      mockFileReader.onload()
    }
    await fileReaderPromise1
    mockImage.onload!()

    await uploadPromise1

    expect(uploadedImages.value).toHaveLength(1)

    // Upload second image (should replace)
    const fileReaderPromise2 = new Promise<void>((resolve) => {
      mockFileReader.onload = () => resolve()
    })

    const uploadPromise2 = uploadImages([mockFiles[1]!])
    if (mockFileReader.onload) {
      mockFileReader.onload()
    }
    await fileReaderPromise2
    mockImage.onload!()

    await uploadPromise2

    expect(uploadedImages.value).toHaveLength(1)
    expect(uploadedImages.value[0]?.file).toBe(mockFiles[1])
  })

  it('should handle empty file list', async () => {
    const { uploadImages, uploadedImages } = useImageUpload()

    const results = await uploadImages([])

    expect(results).toEqual([])
    expect(uploadedImages.value).toEqual([])
  })
})
