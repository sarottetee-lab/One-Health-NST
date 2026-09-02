const fs = require('fs');
let code = fs.readFileSync('src/components/map/LeafletGisMap.tsx', 'utf8');

// Replace state variables
code = code.replace(
  /const \[internalFullscreen, setInternalFullscreen\] = useState<boolean>\(false\);/,
  "const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);\n  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);\n  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);"
);

// We need to find the `#gis-map-top-bar` and `#gis-polygon-settings-drawer` and Legend and replace them.
