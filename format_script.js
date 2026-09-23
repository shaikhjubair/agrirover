const fs = require('fs');
const content = fs.readFileSync('components/agri-dashboard.tsx', 'utf8');

// Simple formatting with Prettier
const prettier = require('prettier');
prettier.format(content, { semi: false, parser: "typescript" }).then(formatted => {
  fs.writeFileSync('components/agri-dashboard.tsx', formatted);
});
