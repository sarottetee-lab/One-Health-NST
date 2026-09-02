const fs = require('fs');
let code = fs.readFileSync('src/components/map/LeafletGisMap.tsx', 'utf8');

// The right panel needs to be visible over the map
code = code.replace(
  /absolute top-4 left-0 bottom-6 z-\[1001\]/,
  "absolute top-4 left-0 bottom-6 z-[1001]"
);

code = code.replace(
  /absolute top-4 right-0 bottom-6 z-\[1001\]/,
  "absolute top-4 right-0 bottom-6 z-[1001]"
);

fs.writeFileSync('src/components/map/LeafletGisMap.tsx', code);
