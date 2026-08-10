/**
 * Convert JSON array of objects to CSV string and initiate download
 * @param {Array<Object>} data 
 * @param {string} filename 
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate a printable PDF summary report window for analytics or moderation data
 * @param {Object} reportDetails 
 */
export const exportToPDFReport = ({ title, date, metrics, tableHeaders, tableData }) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups to print PDF reports.');
    return;
  }

  const metricsHTML = metrics && metrics.length
    ? `<div style="display: flex; gap: 15px; margin-bottom: 25px;">
        ${metrics.map(m => `
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc;">
            <div style="font-size: 12px; color: #64748b; font-weight: 500;">${m.label}</div>
            <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px;">${m.value}</div>
          </div>
        `).join('')}
       </div>`
    : '';

  const tableHTML = tableHeaders && tableData && tableData.length
    ? `<table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            ${tableHeaders.map(h => `<th style="padding: 10px; border-bottom: 2px solid #cbd5e1; color: #334155;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableData.map((row, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              ${row.map(cell => `<td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${cell ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
       </table>`
    : '<p style="color: #64748b;">No table data included in this report.</p>';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - FixNearby Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 800; color: #2563eb; }
          .title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px;">
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="logo">FixNearby</div>
            <div class="meta">Multi-Vendor Platform Admin Executive Report</div>
          </div>
          <div style="text-align: right;">
            <div class="title">${title}</div>
            <div class="meta">Generated: ${date || new Date().toLocaleString()}</div>
          </div>
        </div>
        ${metricsHTML}
        ${tableHTML}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
