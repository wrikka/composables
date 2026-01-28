import { ref } from 'vue';

export interface ExportOptions {
  filename?: string;
  format?: 'csv' | 'json' | 'excel';
}

export function useTableExport<T>(items: T[], columns: string[]) {
  const isExporting = ref(false);
  const error = ref<Error | null>(null);

  function exportToCSV(options: ExportOptions = {}) {
    isExporting.value = true;
    error.value = null;

    try {
      const headers = columns.join(',');
      const rows = items.map(item =>
        columns.map(col => (item as any)[col] ?? '').join(','),
      );
      const csv = [headers, ...rows].join('\n');

      downloadFile(csv, options.filename || 'export.csv', 'text/csv');
    }
    catch (e) {
      error.value = e as Error;
    }
    finally {
      isExporting.value = false;
    }
  }

  function exportToJSON(options: ExportOptions = {}) {
    isExporting.value = true;
    error.value = null;

    try {
      const data = items.map(item => {
        const obj: any = {};
        columns.forEach(col => {
          obj[col] = (item as any)[col];
        });
        return obj;
      });

      const json = JSON.stringify(data, null, 2);
      downloadFile(json, options.filename || 'export.json', 'application/json');
    }
    catch (e) {
      error.value = e as Error;
    }
    finally {
      isExporting.value = false;
    }
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportData(options: ExportOptions = {}) {
    const format = options.format || 'csv';

    if (format === 'csv') {
      exportToCSV(options);
    }
    else if (format === 'json') {
      exportToJSON(options);
    }
    else {
      error.value = new Error(`Unsupported format: ${format}`);
    }
  }

  return {
    isExporting,
    error,
    exportToCSV,
    exportToJSON,
    exportData,
  };
}
