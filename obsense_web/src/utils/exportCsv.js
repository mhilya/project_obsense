// Helper export array objek ke file CSV di browser
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header];
      if (typeof val === 'object' && val !== null) {
        val = `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      } else if (typeof val === 'string') {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val ?? '';
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default exportToCSV;
