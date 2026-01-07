import { ref, computed, watch, nextTick } from 'vue'
import { useMarkdownRender } from '../../browser/system/useMarkdownRender'
import { useHtmlToMarkdown } from '../../utils/string/useHtmlToMarkdown'

export interface MarkdownEditorOptions {
  initialContent?: string
  placeholder?: string
  autofocus?: boolean
  maxLength?: number
  toolbar?: boolean
  preview?: boolean
  splitView?: boolean
  theme?: 'light' | 'dark' | 'auto'
  language?: string
  tabSize?: number
  wordWrap?: boolean
  lineNumbers?: boolean
  minimap?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
}

export interface MarkdownEditorCommands {
  bold: () => void
  italic: () => void
  strikethrough: () => void
  heading: (level?: number) => void
  quote: () => void
  code: () => void
  codeBlock: (language?: string) => void
  link: (url?: string, text?: string) => void
  image: (url?: string, alt?: string) => void
  list: (ordered?: boolean) => void
  taskList: () => void
  table: (rows?: number, cols?: number) => void
  horizontalRule: () => void
  undo: () => void
  redo: () => void
  pasteAsMarkdown: (text: string) => void
  pasteHtmlAsMarkdown: (html: string) => void
}

export interface MarkdownEditorState {
  content: string
  selection: {
    start: number
    end: number
  }
  cursor: number
  history: {
    past: string[]
    future: string[]
  }
  isDirty: boolean
  wordCount: number
  characterCount: number
  lineCount: number
}

export function useMarkdownEditor(options: MarkdownEditorOptions = {}) {
  const {
    initialContent = '',
    autofocus = false,
    maxLength,
    toolbar = true,
    preview = true,
    splitView = true,
    theme = 'auto',
    autoSave = false,
    autoSaveDelay = 1000
  } = options

  // State
  const content = ref(initialContent)
  const isPreviewMode = ref(false)
  const isFullscreen = ref(false)
  const showToolbar = ref(toolbar)
  const showPreview = ref(preview)
  const splitViewEnabled = ref(splitView)
  const currentTheme = ref(theme)
  
  // Editor element refs
  const editorRef = ref<HTMLElement>()
  const textareaRef = ref<HTMLTextAreaElement>()
  const previewRef = ref<HTMLElement>()
  
  // Selection state
  const cursor = ref(0)
  
  // History for undo/redo
  const history = ref({ past: [] as string[], future: [] as string[] })
  const isDirty = ref(false)
  
  // Auto-save timer
  const autoSaveTimer = ref<NodeJS.Timeout>()
  
  // Use markdown render for preview
  const { html, error: renderError } = useMarkdownRender({
    highlight: true,
    breaks: true,
    linkify: true,
    typographer: true,
    theme: currentTheme.value === 'dark' ? 'vitesse-dark' : 'vitesse-light'
  })
  
  // Use HTML to Markdown converter
  const { convert: htmlToMarkdown } = useHtmlToMarkdown({
    strikethrough: true,
    taskListItems: true,
    codeBlockStyle: 'fenced'
  })

  // Computed properties
  const wordCount = computed(() => {
    const text = content.value.trim()
    return text ? text.split(/\s+/).length : 0
  })

  const characterCount = computed(() => content.value.length)
  
  const lineCount = computed(() => {
    return content.value ? content.value.split('\n').length : 0
  })

  const isEmpty = computed(() => !content.value.trim())
  
  const canUndo = computed(() => history.value.past.length > 0)
  
  const canRedo = computed(() => history.value.future.length > 0)

  // Commands
  const commands: MarkdownEditorCommands = {
    bold: () => wrapSelection('**', '**'),
    italic: () => wrapSelection('*', '*'),
    strikethrough: () => wrapSelection('~~', '~~'),
    heading: (level = 2) => {
      const prefix = '#'.repeat(level) + ' '
      replaceLine(prefix)
    },
    quote: () => replaceLine('> '),
    code: () => wrapSelection('`', '`'),
    codeBlock: (lang = '') => wrapSelection('```' + lang + '\n', '\n```'),
    link: (url = '', text = '') => {
      const linkText = text || 'link text'
      const linkUrl = url || 'https://example.com'
      replaceSelection(`[${linkText}](${linkUrl})`)
    },
    image: (url = '', alt = '') => {
      const imgUrl = url || 'https://example.com/image.jpg'
      const imgAlt = alt || 'image description'
      replaceSelection(`![${imgAlt}](${imgUrl})`)
    },
    list: (ordered = false) => {
      const prefix = ordered ? '1. ' : '- '
      replaceLine(prefix)
    },
    taskList: () => replaceLine('- [ ] '),
    table: (rows = 3, cols = 3) => {
      const header = '| ' + Array(cols).fill('Header').join(' | ') + ' |'
      const separator = '| ' + Array(cols).fill('---').join(' | ') + ' |'
      const rowsArray = Array(rows - 1).fill(null).map(() => 
        '| ' + Array(cols).fill('Cell').join(' | ') + ' |'
      )
      const table = [header, separator, ...rowsArray].join('\n')
      replaceSelection('\n' + table + '\n')
    },
    horizontalRule: () => replaceSelection('\n---\n'),
    undo: () => performUndo(),
    redo: () => performRedo(),
    pasteAsMarkdown: (text: string) => {
      replaceSelection(text)
    },
    pasteHtmlAsMarkdown: (htmlContent: string) => {
      const markdown = htmlToMarkdown(htmlContent)
      replaceSelection(markdown)
    }
  }

  // Helper functions
  function wrapSelection(prefix: string, suffix: string) {
    const { start, end } = getSelection()
    const selectedText = content.value.substring(start, end)
    const newText = prefix + selectedText + suffix
    replaceSelection(newText)
  }

  function replaceLine(prefix: string) {
    const { start, end } = getSelection()
    let startIndex = start
    let endIndex = end
    
    // Find line boundaries
    while (startIndex > 0 && content.value[startIndex - 1] !== '\n') startIndex--
    while (endIndex < content.value.length && content.value[endIndex] !== '\n') endIndex++
    
    const lineIndex = content.value.substring(0, startIndex).split('\n').length - 1
    const allLines = content.value.split('\n')
    const currentLine = allLines[lineIndex]
    
    if (currentLine) {
      // Check if line already has the prefix
      if (currentLine.startsWith(prefix)) {
        allLines[lineIndex] = currentLine.substring(prefix.length)
      } else {
        allLines[lineIndex] = prefix + currentLine
      }
      
      const newContent = allLines.join('\n')
      setContent(newContent)
      setCursor(startIndex + (allLines[lineIndex]?.length || 0))
    }
  }

  function replaceSelection(text: string) {
    const { start, end } = getSelection()
    const newContent = content.value.substring(0, start) + text + content.value.substring(end)
    setContent(newContent)
    setCursor(start + text.length)
  }

  function getSelection() {
    if (textareaRef.value) {
      return {
        start: textareaRef.value.selectionStart,
        end: textareaRef.value.selectionEnd
      }
    }
    return { start: cursor.value, end: cursor.value }
  }

  function setCursor(position: number) {
    cursor.value = position
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.setSelectionRange(position, position)
        textareaRef.value.focus()
      }
    })
  }

  function setContent(newContent: string) {
    if (newContent !== content.value) {
      // Save to history before changing
      if (content.value) {
        history.value.past.push(content.value)
        history.value.future = []
      }
      
      content.value = newContent
      isDirty.value = true
      
      // Auto-save
      if (autoSave) {
        scheduleAutoSave()
      }
    }
  }

  function scheduleAutoSave() {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    autoSaveTimer.value = setTimeout(() => {
      // Auto-save logic would go here
      console.log('Auto-saving content...')
    }, autoSaveDelay)
  }

  function performUndo() {
    if (canUndo.value) {
      const previous = history.value.past.pop()
      if (previous !== undefined) {
        history.value.future.push(content.value)
        content.value = previous
        isDirty.value = true
      }
    }
  }

  function performRedo() {
    if (canRedo.value) {
      const next = history.value.future.pop()
      if (next !== undefined) {
        history.value.past.push(content.value)
        content.value = next
        isDirty.value = true
      }
    }
  }

  function insertText(text: string) {
    replaceSelection(text)
  }

  function clearContent() {
    setContent('')
  }

  function resetContent() {
    setContent(initialContent)
    isDirty.value = false
    history.value = { past: [], future: [] }
  }

  function togglePreview() {
    isPreviewMode.value = !isPreviewMode.value
  }

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }

  function toggleToolbar() {
    showToolbar.value = !showToolbar.value
  }

  function togglePreviewPanel() {
    showPreview.value = !showPreview.value
  }

  function toggleSplitView() {
    splitViewEnabled.value = !splitViewEnabled.value
  }

  function setTheme(theme: 'light' | 'dark' | 'auto') {
    currentTheme.value = theme
  }

  function handlePaste(event: ClipboardEvent) {
    event.preventDefault()
    
    const clipboardData = event.clipboardData
    if (!clipboardData) return
    
    const htmlData = clipboardData.getData('text/html')
    const textData = clipboardData.getData('text/plain')
    
    // If HTML data is available, convert it to markdown
    if (htmlData && htmlData.trim()) {
      const markdown = htmlToMarkdown(htmlData)
      replaceSelection(markdown)
    } else if (textData) {
      // Fallback to plain text
      replaceSelection(textData)
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    
    const dataTransfer = event.dataTransfer
    if (!dataTransfer) return
    
    const htmlData = dataTransfer.getData('text/html')
    const textData = dataTransfer.getData('text/plain')
    
    // If HTML data is available, convert it to markdown
    if (htmlData && htmlData.trim()) {
      const markdown = htmlToMarkdown(htmlData)
      replaceSelection(markdown)
    } else if (textData) {
      // Fallback to plain text
      replaceSelection(textData)
    }
  }

  // Watch for content changes
  watch(content, (newContent) => {
    if (maxLength && newContent.length > maxLength) {
      content.value = newContent.substring(0, maxLength)
    }
  })

  // Auto-focus
  nextTick(() => {
    if (autofocus && textareaRef.value) {
      textareaRef.value.focus()
    }
  })

  return {
    // State
    content,
    isPreviewMode,
    isFullscreen,
    showToolbar,
    showPreview,
    splitViewEnabled,
    currentTheme,
    isDirty,
    
    // Computed
    html,
    renderError,
    wordCount,
    characterCount,
    lineCount,
    isEmpty,
    canUndo,
    canRedo,
    
    // Refs
    editorRef,
    textareaRef,
    previewRef,
    
    // Commands
    commands,
    
    // Methods
    insertText,
    clearContent,
    resetContent,
    togglePreview,
    toggleFullscreen,
    toggleToolbar,
    togglePreviewPanel,
    toggleSplitView,
    setTheme,
    setContent,
    setCursor,
    getSelection,
    handlePaste,
    handleDrop
  }
}
