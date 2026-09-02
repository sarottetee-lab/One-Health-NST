const fs = require('fs');
const data = JSON.parse(fs.readFileSync('districts.geojson', 'utf8'));

const nakhon = data.features.filter(f => {
  const props = JSON.stringify(f.properties);
  return props.includes('นครศรีธรรมราช') || props.includes('Nakhon Si Thammarat') || props.includes('Nakhon Sri Thammarat');
});

let out = `export const NAKHON_DISTRICT_POLYGONS: Record<string, [number, number][][]> = {\n`;

nakhon.forEach(f => {
  let nameTh = f.properties.amp_th;
  if (nameTh === 'เมืองนครศรีธรรมร') nameTh = 'เมืองนครศรีธรรมราช';
  
  // GeoJSON coordinates are usually [lng, lat], Leaflet expects [lat, lng].
  // Also can be MultiPolygon or Polygon.
  // We'll normalize to an array of polygons, where each polygon is an array of [lat, lng] points.
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
  
  out += `  '${nameTh}': ${JSON.stringify(polygons)},\n`;
});
out += `};\n`;

fs.writeFileSync('src/data/realDistrictsGeo.ts', out);
console.log("Wrote src/data/realDistrictsGeo.ts");
