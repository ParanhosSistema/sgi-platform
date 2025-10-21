/**
 * Simple CSV parser helper for ETL scripts
 */
const fs = require('fs');

/**
 * Parse CSV file into array of objects
 * @param {string} filePath - Path to CSV file
 * @returns {Array<Object>} Parsed rows
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  if (lines.length === 0) {
    return [];
  }
  
  // First line is header
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Parse data lines
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Convert value to integer or null
 * @param {string|number} value - Value to convert
 * @returns {number|null}
 */
function toInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

/**
 * Sanitize string value
 * @param {string} value - Value to sanitize
 * @returns {string|null}
 */
function sanitize(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return value.trim();
}

module.exports = {
  parseCSV,
  toInt,
  sanitize
};
