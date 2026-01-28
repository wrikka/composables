import { ref } from 'vue';

export interface UseHtmlToMarkdownOptions {
  turndownService?: any;
}

export function useHtmlToMarkdown(options: UseHtmlToMarkdownOptions = {}) {
  const markdown = ref('');
  const error = ref<Error | null>(null);

  function convert(html: string): string {
    try {
      const TurndownService = require('turndown');
      const turndownService = options.turndownService || new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });

      markdown.value = turndownService.turndown(html);
      error.value = null;
      return markdown.value;
    }
    catch (e) {
      error.value = e as Error;
      return '';
    }
  }

  function clear() {
    markdown.value = '';
    error.value = null;
  }

  return {
    markdown,
    error,
    convert,
    clear,
  };
}
