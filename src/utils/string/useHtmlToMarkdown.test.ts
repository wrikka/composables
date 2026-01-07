import { describe, it, expect, beforeEach } from 'vitest'
import { useHtmlToMarkdown } from './useHtmlToMarkdown'

describe('useHtmlToMarkdown', () => {
  beforeEach(() => {
    // Reset before each test
  })

  it('should initialize with default options', () => {
    const converter = useHtmlToMarkdown()
    
    expect(converter.state.value).toEqual({
      isConverting: false,
      markdown: '',
      html: '',
      error: null
    })
    
    expect(converter.isEmpty.value).toBe(true)
    expect(converter.hasMarkdown.value).toBe(false)
    expect(converter.hasError.value).toBe(false)
  })

  it('should initialize with custom options', () => {
    const converter = useHtmlToMarkdown({
      headingStyle: 'setext',
      bulletListMarker: '*',
      emDelimiter: '_',
      strikethrough: false
    })
    
    expect(converter.state.value).toEqual({
      isConverting: false,
      markdown: '',
      html: '',
      error: null
    })
  })

  it('should convert simple HTML to Markdown', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Hello World</p>'
    const expected = 'Hello World\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert headings to Markdown', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<h1>Title</h1><h2>Subtitle</h2>'
    const expected = '# Title\n\n## Subtitle\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert bold and italic text', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p><strong>Bold</strong> and <em>italic</em> text</p>'
    const expected = '**Bold** and *italic* text\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert strikethrough text', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p><s>strikethrough</s> text</p>'
    const markdown = converter.convert(html)
    
    expect(markdown).toBe('~~strikethrough~~ text\n\n')
  })

  it('should convert inline code', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Here is some <code>code</code> text</p>'
    const expected = 'Here is some `code` text\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert fenced code blocks', () => {
    const converter = useHtmlToMarkdown({ codeBlockStyle: 'fenced' })
    
    const html = '<pre><code>console.log("Hello");</code></pre>'
    const expected = '```\nconsole.log("Hello");\n```\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert indented code blocks', () => {
    const converter = useHtmlToMarkdown({ codeBlockStyle: 'indented' })
    
    const html = '<pre><code>console.log("Hello");</code></pre>'
    const expected = '    console.log("Hello");\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert blockquotes', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<blockquote>This is a quote</blockquote>'
    const expected = '> This is a quote\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert unordered lists', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const expected = '- Item 1\n- Item 2\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert ordered lists', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<ol><li>First</li><li>Second</li></ol>'
    const expected = '1. First\n2. Second\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert links', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Check out <a href="https://example.com">this link</a></p>'
    const expected = 'Check out [this link](https://example.com)\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert images', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p><img src="https://example.com/image.jpg" alt="Example Image"></p>'
    const expected = '![Example Image](https://example.com/image.jpg)\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert images without alt text', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p><img src="https://example.com/image.jpg"></p>'
    const expected = '![](https://example.com/image.jpg)\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert horizontal rules', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Before</p><hr><p>After</p>'
    const expected = 'Before\n\n---\n\nAfter\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert line breaks', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Line 1<br>Line 2</p>'
    const expected = 'Line 1  \nLine 2\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should convert tables', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<table><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></table>'
    const expected = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should handle empty cells in tables', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<table><tr><th>Header 1</th><th></th></tr><tr><td>Cell 1</td><td></td></tr></table>'
    const expected = '| Header 1 |  |\n| --- | --- |\n| Cell 1 |  |\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should remove HTML comments', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Hello</p><!-- This is a comment --><p>World</p>'
    const expected = 'Hello\n\nWorld\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should handle complex HTML with multiple elements', () => {
    const converter = useHtmlToMarkdown()
    
    const html = `
      <h1>Document Title</h1>
      <p>This is a <strong>paragraph</strong> with <em>emphasis</em>.</p>
      <ul>
        <li>First item</li>
        <li>Second item with <code>code</code></li>
      </ul>
      <blockquote>
        <p>This is a quote with <a href="https://example.com">a link</a>.</p>
      </blockquote>
    `
    
    const result = converter.convert(html)
    
    expect(result).toContain('# Document Title')
    expect(result).toContain('**paragraph**')
    expect(result).toContain('*emphasis*')
    expect(result).toContain('- First item')
    expect(result).toContain('`code`')
    expect(result).toContain('> This is a quote')
    expect(result).toContain('[a link](https://example.com)')
  })

  it('should handle empty HTML', () => {
    const converter = useHtmlToMarkdown()
    
    const result = converter.convert('')
    expect(result).toBe('')
  })

  it('should handle whitespace-only HTML', () => {
    const converter = useHtmlToMarkdown()
    
    const result = converter.convert('   \n\t   ')
    expect(result).toBe('')
  })

  it('should set HTML and update markdown', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Hello World</p>'
    converter.setHtml(html)
    
    expect(converter.html.value).toBe(html)
    expect(converter.markdown.value).toBe('Hello World\n\n')
  })

  it('should clear content', () => {
    const converter = useHtmlToMarkdown()
    
    converter.setHtml('<p>Hello</p>')
    converter.clear()
    
    expect(converter.html.value).toBe('')
    expect(converter.markdown.value).toBe('')
    expect(converter.error.value).toBe(null)
  })

  it('should reset content', () => {
    const converter = useHtmlToMarkdown()
    
    converter.setHtml('<p>Hello</p>')
    converter.reset()
    
    expect(converter.html.value).toBe('')
    expect(converter.markdown.value).toBe('')
    expect(converter.error.value).toBe(null)
  })

  it('should respect custom bullet list marker', () => {
    const converter = useHtmlToMarkdown({ bulletListMarker: '*' })
    
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const expected = '* Item 1\n* Item 2\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should respect custom emphasis delimiter', () => {
    const converter = useHtmlToMarkdown({ emDelimiter: '_' })
    
    const html = '<p><em>italic</em> text</p>'
    const expected = '_italic_ text\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should respect custom strong delimiter', () => {
    const converter = useHtmlToMarkdown({ strongDelimiter: '__' })
    
    const html = '<p><strong>bold</strong> text</p>'
    const expected = '__bold__ text\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should disable strikethrough when option is false', () => {
    const converter = useHtmlToMarkdown({ strikethrough: false })
    
    const html = '<p><s>strikethrough</s> text</p>'
    const expected = 'strikethrough text\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should enable underline when option is true', () => {
    const converter = useHtmlToMarkdown({ underline: true })
    
    const html = '<p><u>underlined</u> text</p>'
    const expected = '__underlined__ text\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should handle nested HTML elements', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>This is <strong>bold with <em>italic</em> inside</strong></p>'
    const expected = 'This is **bold with *italic* inside**\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should clean up multiple newlines', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Paragraph 1</p>\n\n\n<p>Paragraph 2</p>'
    const expected = 'Paragraph 1\n\nParagraph 2\n\n'
    
    const result = converter.convert(html)
    expect(result).toBe(expected)
  })

  it('should handle malformed HTML gracefully', () => {
    const converter = useHtmlToMarkdown()
    
    const html = '<p>Unclosed paragraph<div>Div content'
    const result = converter.convert(html)
    
    // Should not throw error and should produce some output
    expect(typeof result).toBe('string')
    expect(converter.hasError.value).toBe(false)
  })
})
