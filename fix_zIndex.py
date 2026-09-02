import re

with open('src/components/map/LeafletGisMap.tsx', 'r') as f:
    content = f.read()

# Make sure map has z-0 
content = content.replace('id="leaflet-gis-map-canvas"', 'id="leaflet-gis-map-canvas"')
content = content.replace('z-[1001]', 'z-[1001]')

with open('src/components/map/LeafletGisMap.tsx', 'w') as f:
    f.write(content)
