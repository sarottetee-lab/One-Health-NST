const fs = require('fs');
const https = require('https');

const query = `
[out:json][timeout:250];
area["name:en"="Nakhon Si Thammarat"]["admin_level"="4"]->.searchArea;
(
  relation["admin_level"="6"](area.searchArea);
);
out geom;
`;

const req = https.request('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const districts = {};
      parsed.elements.forEach(el => {
        if (el.type === 'relation') {
          const nameTh = el.tags['name:th'] || el.tags.name;
          const outer = el.members.filter(m => m.role === 'outer');
          let coords = [];
          outer.forEach(way => {
            if (way.geometry) way.geometry.forEach(pt => coords.push([parseFloat(pt.lat.toFixed(4)), parseFloat(pt.lon.toFixed(4))]));
          });
          const cleanName = nameTh.replace('อำเภอ', '').trim();
          districts[cleanName] = coords.filter((_, i) => i % 5 === 0);
        }
      });
      fs.writeFileSync('districts_nakhon.json', JSON.stringify(districts, null, 2));
      console.log('Success, wrote ' + Object.keys(districts).length + ' districts');
    } catch (e) {
      console.log('Parse error', e.message, data.slice(0, 100));
    }
  });
});
req.on('error', (e) => console.log('Req error', e));
req.write(query);
req.end();
