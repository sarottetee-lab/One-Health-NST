const fs = require('fs');
const data = JSON.parse(fs.readFileSync('subdistricts.geojson', 'utf8'));

const nakhon = data.features.filter(f => {
  const props = JSON.stringify(f.properties);
  return props.includes('นครศรีธรรมราช') || props.includes('Nakhon Si Thammarat');
});

let out = `export const NAKHON_SUBDISTRICT_POLYGONS: Record<string, Record<string, [number, number][][]>> = {\n`;

// Group by district name
const districts = {};

nakhon.forEach(f => {
  let districtName = f.properties.amp_th;
  if (districtName === 'เมืองนครศรีธรรมร') districtName = 'เมืองนครศรีธรรมราช';
  
  let subName = f.properties.tam_th;
  
  if (!districts[districtName]) {
    districts[districtName] = {};
  }
  
  let polygons = [];
  if (f.geometry.type === 'Polygon') {
    let poly = [];
    f.geometry.coordinates[0].forEach((pt, idx) => {
        if (idx % 3 === 0 || idx === f.geometry.coordinates[0].length - 1) { // downsample
           poly.push([parseFloat(pt[1].toFixed(5)), parseFloat(pt[0].toFixed(5))]);
        }
    });
    polygons.push(poly);
  } else if (f.geometry.type === 'MultiPolygon') {
    f.geometry.coordinates.forEach(polyGeo => {
       let poly = [];
       polyGeo[0].forEach((pt, idx) => {
         if (idx % 3 === 0 || idx === polyGeo[0].length - 1) { // downsample
           poly.push([parseFloat(pt[1].toFixed(5)), parseFloat(pt[0].toFixed(5))]);
         }
       });
       polygons.push(poly);
    });
  }
  
  districts[districtName][subName] = polygons;
});

Object.keys(districts).forEach(dist => {
  out += `  '${dist}': {\n`;
  Object.keys(districts[dist]).forEach(sub => {
    out += `    '${sub}': ${JSON.stringify(districts[dist][sub])},\n`;
  });
  out += `  },\n`;
});

out += `};\n`;

fs.writeFileSync('src/data/realSubdistrictsGeo.ts', out);
console.log("Wrote src/data/realSubdistrictsGeo.ts. Subdistricts total: " + nakhon.length);
