import { ref, computed, watch } from 'vue'

export interface HtmlToMarkdownOptions {
  headingStyle?: 'setext' | 'atx'
  hr?: string
  bulletListMarker?: '-' | '*' | '+'
  codeBlockStyle?: 'indented' | 'fenced'
  fence?: string
  emDelimiter?: '_' | '*'
  strongDelimiter?: '**' | '__'
  linkStyle?: 'inlined' | 'referenced'
  linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut'
  strikethrough?: boolean
  underline?: boolean
  taskListItems?: boolean
  smoothTableEdges?: boolean
}

export interface ConversionState {
  isConverting: boolean
  markdown: string
  html: string
  error: Error | null
}

export function useHtmlToMarkdown(options: HtmlToMarkdownOptions = {}) {
  const {
    hr = '---',
    bulletListMarker = '-',
    codeBlockStyle = 'fenced',
    fence = '```',
    emDelimiter = '*',
    strongDelimiter = '**',
    linkStyle = 'inlined',
    strikethrough = true,
    underline = false,
    taskListItems = true
  } = options

  // State
  const isConverting = ref(false)
  const markdown = ref('')
  const html = ref('')
  const error = ref<Error | null>(null)

  // Computed state
  const state = computed<ConversionState>(() => ({
    isConverting: isConverting.value,
    markdown: markdown.value,
    html: html.value,
    error: error.value
  }))

  const isEmpty = computed(() => !html.value.trim())
  const hasMarkdown = computed(() => !!markdown.value.trim())
  const hasError = computed(() => error.value !== null)

  // HTML to Markdown conversion functions
  function convertToMarkdown(htmlContent: string): string {
    try {
      isConverting.value = true
      error.value = null

      let markdownContent = htmlContent

      // Remove HTML comments
      markdownContent = markdownContent.replace(/<!--[\s\S]*?-->/g, '')

      // Handle headings (h1-h6)
      markdownContent = markdownContent.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (_, level, content) => {
        const hashes = '#'.repeat(parseInt(level))
        return `${hashes} ${content.trim()}\n\n`
      })

      // Handle paragraphs
      markdownContent = markdownContent.replace(/<p[^>]*>(.*?)<\/p>/gi, (_, content) => {
        return `${content.trim()}\n\n`
      })

      // Handle bold and strong
      markdownContent = markdownContent.replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gi, (_, content) => {
        return `${strongDelimiter}${content}${strongDelimiter}`
      })

      // Handle italic and em
      markdownContent = markdownContent.replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gi, (_, content) => {
        return `${emDelimiter}${content}${emDelimiter}`
      })

      // Handle strikethrough
      if (strikethrough) {
        markdownContent = markdownContent.replace(/<(?:s|strike|del)[^>]*>(.*?)<\/(?:s|strike|del)>/gi, (_, content) => {
          return `~~${content}~~`
        })
      }

      // Handle underline (if enabled)
      if (underline) {
        markdownContent = markdownContent.replace(/<u[^>]*>(.*?)<\/u>/gi, (_, content) => {
          return `__${content}__`
        })
      }

      // Handle code (inline)
      markdownContent = markdownContent.replace(/<code[^>]*>(.*?)<\/code>/gi, (_, content) => {
        return `\`${content}\``
      })

      // Handle pre and code blocks
      if (codeBlockStyle === 'fenced') {
        markdownContent = markdownContent.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, (_, content) => {
          return `${fence}\n${content.trim()}\n${fence}\n\n`
        })
        markdownContent = markdownContent.replace(/<pre[^>]*>(.*?)<\/pre>/gi, (_, content) => {
          return `${fence}\n${content.trim()}\n${fence}\n\n`
        })
      } else {
        markdownContent = markdownContent.replace(/<(?:pre|code)[^>]*>(.*?)<\/(?:pre|code)>/gi, (_, content) => {
          const lines = content.trim().split('\n')
          return lines.map((line: string) => `    ${line}`).join('\n') + '\n\n'
        })
      }

      // Handle blockquotes
      markdownContent = markdownContent.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_, content) => {
        const lines = content.trim().split('\n')
        return lines.map((line: string) => `> ${line}`).join('\n') + '\n\n'
      })

      // Handle unordered lists
      markdownContent = markdownContent.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (_, content) => {
        const listItems = content.match(/<li[^>]*>(.*?)<\/li>/gi) || []
        const markdownList = listItems.map((item: string) => {
          const itemContent = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
          return `${bulletListMarker} ${itemContent}`
        }).join('\n')
        return `${markdownList}\n\n`
      })

      // Handle ordered lists
      markdownContent = markdownContent.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (_, content) => {
        const listItems = content.match(/<li[^>]*>(.*?)<\/li>/gi) || []
        const markdownList = listItems.map((item: string, index: number) => {
          const itemContent = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim()
          return `${index + 1}. ${itemContent}`
        }).join('\n')
        return `${markdownList}\n\n`
      })

      // Handle task lists (if enabled)
      if (taskListItems) {
        markdownContent = markdownContent.replace(/<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>/gi, '[x] ')
        markdownContent = markdownContent.replace(/<input[^>]*type=["']checkbox["'][^>]*>/gi, '[ ] ')
      }

      // Handle links
      if (linkStyle === 'inlined') {
        markdownContent = markdownContent.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (_, href, text) => {
          return `[${text}](${href})`
        })
      } else {
        // Reference style links
        let referenceIndex = 1
        const references: string[] = []
        
        markdownContent = markdownContent.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (_, href, text) => {
          const refId = referenceIndex++
          references.push(`[${refId}]: ${href}`)
          return `[${text}][${refId}]`
        })
        
        // Add references at the end
        if (references.length > 0) {
          markdownContent += '\n' + references.join('\n') + '\n\n'
        }
      }

      // Handle images
      markdownContent = markdownContent.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, (_, src, alt) => {
        return `![${alt}](${src})`
      })
      markdownContent = markdownContent.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, (_, src) => {
        return `![](${src})`
      })

      // Handle horizontal rules
      markdownContent = markdownContent.replace(/<hr[^>]*>/gi, `\n${hr}\n\n`)

      // Handle line breaks
      markdownContent = markdownContent.replace(/<br[^>]*>/gi, '  \n')

      // Handle tables
      markdownContent = markdownContent.replace(/<table[^>]*>(.*?)<\/table>/gi, (_, tableContent) => {
        const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gi) || []
        
        if (rows.length === 0) return ''
        
        const markdownTable: string[] = []
        
        rows.forEach((row: string, rowIndex: number) => {
          const cells = row.match(/<(?:t[dh])[^>]*>(.*?)<\/(?:t[dh])>/gi) || []
          const markdownCells = cells.map((cell: string) => {
            const cellContent = cell.replace(/<(?:t[dh])[^>]*>(.*?)<\/(?:t[dh])>/i, '$1').trim()
            return cellContent || ' ' // Ensure empty cells are preserved
          })
          
          markdownTable.push('| ' + markdownCells.join(' | ') + ' |')
          
          // Add header separator after first row
          if (rowIndex === 0) {
            const separator = markdownCells.map(() => '---').join(' | ')
            markdownTable.push('| ' + separator + ' |')
          }
        })
        
        return markdownTable.join('\n') + '\n\n'
      })

      // Clean up multiple newlines
      markdownContent = markdownContent.replace(/\n{3,}/g, '\n\n')
      
      // Clean up leading/trailing whitespace
      markdownContent = markdownContent.trim()

      return markdownContent

    } catch (err) {
      error.value = err as Error
      console.error('HTML to Markdown conversion error:', err)
      return ''
    } finally {
      isConverting.value = false
    }
  }

  // Convert HTML content
  function setHtml(htmlContent: string) {
    html.value = htmlContent
    markdown.value = convertToMarkdown(htmlContent)
  }

  // Convert and get markdown
  function convert(htmlContent: string): string {
    return convertToMarkdown(htmlContent)
  }

  // Clear content
  function clear() {
    html.value = ''
    markdown.value = ''
    error.value = null
  }

  // Reset to initial state
  function reset() {
    clear()
  }

  // Watch for HTML changes
  watch(html, (newHtml) => {
    if (newHtml) {
      markdown.value = convertToMarkdown(newHtml)
    } else {
      markdown.value = ''
    }
  })

  return {
    // State
    state,
    isConverting,
    markdown,
    html,
    error,
    
    // Computed
    isEmpty,
    hasMarkdown,
    hasError,
    
    // Methods
    setHtml,
    convert,
    clear,
    reset
  }
}
