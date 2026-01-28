import { ref, computed } from 'vue'

export interface FileUploadOptions {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  autoUpload?: boolean
  chunkSize?: number // for chunked uploads
  retries?: number
  headers?: Record<string, string>
}

export interface FileUploadProgress {
  loaded: number
  total: number
  percentage: number
  speed: number // bytes per second
  timeRemaining: number
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  metadata?: Record<string, any>
  uploadedAt: number
  progress?: FileUploadProgress
  error?: Error
}

export interface UseFileUploadOptions extends FileUploadOptions {
  endpoint?: string
  storageProvider?: 'local' | 's3' | 'gcs' | 'azure'
  bucket?: string
  path?: string
  publicRead?: boolean
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    accept = '*/*',
    multiple = false,
    maxSize = 10 * 1024 * 1024, // 10MB
    maxFiles = 1,
    autoUpload = true,
    chunkSize = 1024 * 1024, // 1MB
    retries = 3,
    headers = {},
    endpoint = '/api/upload',
    storageProvider = 'local',
    bucket = '',
    path = 'uploads',
    publicRead = true
  } = options

  const files = ref<UploadedFile[]>([])
  const uploading = ref(false)
  const error = ref<Error | null>(null)
  const dragActive = ref(false)

  const isLoading = computed(() => uploading.value)
  const lastError = computed(() => error.value)
  const uploadedFiles = computed(() => files.value.filter(file => file.url && !file.error))
  const failedFiles = computed(() => files.value.filter(file => file.error))
  const totalProgress = computed(() => {
    if (files.value.length === 0) return 0
    const totalLoaded = files.value.reduce((sum, file) => sum + (file.progress?.loaded || 0), 0)
    const totalSize = files.value.reduce((sum, file) => sum + file.size, 0)
    return totalSize > 0 ? (totalLoaded / totalSize) * 100 : 0
  })

  // Generate unique file ID
  const generateFileId = (): string => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (accept !== '*/*' && !accept.split(',').some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(new RegExp(type.replace('*', '.*')))
    })) {
      return { valid: false, error: `File type ${file.type} not allowed` }
    }

    // Check file size
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB` 
      }
    }

    return { valid: true }
  }

  // Create file object
  const createFileObject = (file: File): UploadedFile => {
    return {
      id: generateFileId(),
      name: file.name,
      size: file.size,
      type: file.type,
      metadata: {
        lastModified: file.lastModified,
        webkitRelativePath: (file as any).webkitRelativePath
      },
      uploadedAt: Date.now(),
      progress: {
        loaded: 0,
        total: file.size,
        percentage: 0,
        speed: 0,
        timeRemaining: 0
      }
    }
  }

  // Upload file with progress tracking
  const uploadFile = async (file: File, fileObj: UploadedFile): Promise<void> => {
    const startTime = Date.now()
    let lastLoaded = 0
    let speedSamples: number[] = []

    const updateProgress = (loaded: number): void => {
      const now = Date.now()
      const timeElapsed = (now - startTime) / 1000
      const currentSpeed = timeElapsed > 0 ? loaded / timeElapsed : 0
      
      // Calculate speed (average of last 5 samples)
      speedSamples.push(currentSpeed)
      if (speedSamples.length > 5) {
        speedSamples.shift()
      }
      const avgSpeed = speedSamples.reduce((sum, speed) => sum + speed, 0) / speedSamples.length
      
      // Calculate time remaining
      const remaining = file.size - loaded
      const timeRemaining = avgSpeed > 0 ? remaining / avgSpeed : 0

      fileObj.progress = {
        loaded,
        total: file.size,
        percentage: (loaded / file.size) * 100,
        speed: avgSpeed,
        timeRemaining
      }
    }

    try {
      if (file.size <= chunkSize) {
        // Small file - upload directly
        const formData = new FormData()
        formData.append('file', file)
        formData.append('provider', storageProvider)
        formData.append('bucket', bucket)
        formData.append('path', path)
        formData.append('publicRead', publicRead.toString())

        Object.entries(headers).forEach(([key, value]) => {
          formData.append(key, value)
        })

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const result = await response.json()
        fileObj.url = result.url
        fileObj.metadata = { ...fileObj.metadata, ...result.metadata }

      } else {
        // Large file - chunked upload
        await uploadChunkedFile(file, fileObj, updateProgress)
      }

    } catch (err) {
      fileObj.error = err instanceof Error ? err : new Error(String(err))
      throw err
    }
  }

  // Chunked upload for large files
  const uploadChunkedFile = async (
    file: File, 
    fileObj: UploadedFile, 
    onProgress: (loaded: number) => void
  ): Promise<void> => {
    const totalChunks = Math.ceil(file.size / chunkSize)
    let uploadedChunks = 0

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('chunkIndex', chunkIndex.toString())
      formData.append('totalChunks', totalChunks.toString())
      formData.append('fileId', fileObj.id)
      formData.append('fileName', file.name)
      formData.append('fileSize', file.size.toString())
      formData.append('provider', storageProvider)
      formData.append('bucket', bucket)
      formData.append('path', path)

      const response = await fetch(`${endpoint}/chunk`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Chunk ${chunkIndex + 1}/${totalChunks} upload failed`)
      }

      uploadedChunks++
      onProgress(uploadedChunks * chunkSize)
    }

    // Complete chunked upload
    const completeResponse = await fetch(`${endpoint}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: fileObj.id,
        fileName: file.name,
        fileSize: file.size,
        totalChunks,
        provider: storageProvider,
        bucket,
        path,
        publicRead
      })
    })

    if (!completeResponse.ok) {
      throw new Error('Failed to complete chunked upload')
    }

    const result = await completeResponse.json()
    fileObj.url = result.url
    fileObj.metadata = { ...fileObj.metadata, ...result.metadata }
  }

  // Handle file selection
  const selectFiles = (fileList: FileList): void => {
    const selectedFiles = Array.from(fileList).slice(0, maxFiles)
    
    for (const file of selectedFiles) {
      const validation = validateFile(file)
      
      if (!validation.valid) {
        const errorFile = createFileObject(file)
        errorFile.error = new Error(validation.error!)
        files.value.push(errorFile)
        continue
      }

      const fileObj = createFileObject(file)
      files.value.push(fileObj)

      if (autoUpload) {
        // Upload in background
        uploadFile(file, fileObj).catch(err => {
          console.error('Upload failed:', err)
        })
      }
    }
  }

  // Upload all pending files
  const uploadAll = async (): Promise<void> => {
    const pendingFiles = files.value.filter(file => !file.url && !file.error)
    
    for (const fileObj of pendingFiles) {
      const file = files.value.find(f => f.id === fileObj.id)
      if (file) {
        try {
          await uploadFile(file, fileObj)
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err)
        }
      }
    }
  }

  // Retry failed uploads
  const retryFailed = async (): Promise<void> => {
    const failedFiles = files.value.filter(file => file.error)
    
    for (const fileObj of failedFiles) {
      // Clear error and retry
      fileObj.error = undefined
      fileObj.progress = {
        loaded: 0,
        total: fileObj.size,
        percentage: 0,
        speed: 0,
        timeRemaining: 0
      }

      const file = files.value.find(f => f.id === fileObj.id)
      if (file) {
        try {
          await uploadFile(file, fileObj)
        } catch (err) {
          console.error(`Retry failed for ${file.name}:`, err)
        }
      }
    }
  }

  // Remove file
  const removeFile = (id: string): boolean => {
    const index = files.value.findIndex(file => file.id === id)
    if (index >= 0) {
      files.value.splice(index, 1)
      return true
    }
    return false
  }

  // Clear all files
  const clear = (): void => {
    files.value = []
    error.value = null
  }

  // Get file by ID
  const getFile = (id: string): UploadedFile | undefined => {
    return files.value.find(file => file.id === id)
  }

  // Setup drag and drop
  const setupDragAndDrop = (element: HTMLElement): void => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragActive.value = true
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragActive.value = false
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragActive.value = false

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles) {
        selectFiles(droppedFiles)
      }
    }

    element.addEventListener('dragenter', handleDragEnter)
    element.addEventListener('dragleave', handleDragLeave)
    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('drop', handleDrop)

    // Cleanup
    return () => {
      element.removeEventListener('dragenter', handleDragEnter)
      element.removeEventListener('dragleave', handleDragLeave)
      element.removeEventListener('dragover', handleDragOver)
      element.removeEventListener('drop', handleDrop)
    }
  }

  return {
    // State
    files,
    uploading: isLoading,
    error: lastError,
    dragActive,
    uploadedFiles,
    failedFiles,
    totalProgress,
    
    // Actions
    selectFiles,
    uploadAll,
    retryFailed,
    removeFile,
    clear,
    
    // Utilities
    getFile,
    validateFile,
    setupDragAndDrop
  }
}
