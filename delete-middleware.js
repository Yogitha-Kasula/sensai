// temporary script to delete middleware.js
const fs = require('fs');
try {
  fs.unlinkSync('middleware.js');
  console.log('Successfully deleted middleware.js');
} catch (e) {
  console.error('Failed to delete middleware.js:', e);
}
