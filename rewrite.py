import re

with open('src/components/map/LeafletGisMap.tsx', 'r') as f:
    content = f.read()

# 1. State variables
content = content.replace(
    "const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);",
    "const [internalFullscreen, setInternalFullscreen] = useState<boolean>(false);\n  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(true);\n  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);"
)

# 2. Remove the top bar, stats ribbon, settings drawer, and legend blocks
# It's better to just extract the section from the return statement up to the map container.

start_marker = "{/* 1. Clean Top GIS Control & Thematic Selector Bar */}"
end_marker = "{/* Interactive Leaflet Map Canvas */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_ui = """{/* Left Side Panel (Thematic & Options) */}
      <div className={`absolute top-4 left-0 bottom-6 z-[1001] flex transition-transform duration-300 pointer-events-none ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-slate-900/95 backdrop-blur-md p-3 border-y border-r border-slate-700/80 shadow-2xl rounded-r-2xl pointer-events-auto flex flex-col gap-3 w-64 h-full overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold px-1 pb-2 border-b border-slate-700/80">
            <Sparkles className="w-4 h-4" />
            <span>ชุดสีแผนที่ (Thematic)</span>
          </div>
          
          <button
            type="button"
            onClick={() => setThematicMetric('reference_map')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'reference_map'
                ? 'bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-600 text-white font-bold ring-2 ring-white/50 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⭐ One Health
          </button>
          
          <button
            type="button"
            onClick={() => setThematicMetric('vaccine_animal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'vaccine_animal'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            💉 วัคซีนสัตว์ (>=80%)
          </button>

          <button
            type="button"
            onClick={() => setThematicMetric('rri')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'rri'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚠️ ดัชนีความเสี่ยง RRI
          </button>

          <button
            type="button"
            onClick={() => setThematicMetric('rabies_cases')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-left ${
              thematicMetric === 'rabies_cases'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔴 จำนวนสัตว์ติดเชื้อที่พบ
          </button>

          <div className="pt-2 border-t border-slate-700/80 mt-1">
            <label className="text-[11px] text-slate-400 mb-1.5 block">ตัวเลือกชุดข้อมูลอื่น ๆ:</label>
            <select
              value={thematicMetric}
              onChange={(e) => setThematicMetric(e.target.value as ThematicMetric)}
              className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 border border-slate-700 outline-none cursor-pointer focus:ring-1 focus:ring-emerald-500"
            >
              <option value="reference_map">⭐ One Health</option>
              <option value="vaccine_animal">💉 วัคซีนสัตว์</option>
              <option value="rri">⚠️ ความเสี่ยง RRI</option>
              <option value="rabies_cases">🔴 สัตว์ติดเชื้อที่พบ</option>
              <option value="zone">🛡️ โซนปศุสัตว์ C/B/A</option>
              <option value="vaccine_human">🧑‍⚕️ วัคซีนคน PEP</option>
              <option value="density_animal">🐕 ความหนาแน่นสัตว์</option>
              <option value="boundary_level">🏛️ ลำดับขอบเขต</option>
              <option value="boundary_area">🎨 แยก 23 อำเภออิสระ</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold px-1 pb-2 pt-4 border-b border-slate-700/80">
            <MapPin className="w-4 h-4" />
            <span>ระดับขอบเขตพื้นที่</span>
          </div>
          
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setPolygonLevel('auto')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left ${
                polygonLevel === 'auto' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚡ อัตโนมัติ (ตามการซูม)
            </button>
            <button
              type="button"
              onClick={() => setPolygonLevel('district')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left ${
                polygonLevel === 'district' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏛️ ระดับอำเภอ (23 อำเภอ)
            </button>
            <button
              type="button"
              onClick={() => setPolygonLevel('subdistrict')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-left ${
                polygonLevel === 'subdistrict' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🏠 ระดับตำบล (165 ตำบล)
            </button>
          </div>
          
          {showStatsSummary && showPolygons && (
             <div className="mt-auto pt-4 border-t border-slate-700/80 text-[10px] text-slate-300">
               <div className="font-semibold text-emerald-400 mb-1 flex justify-between items-center">
                 <span>สรุปข้อมูล:</span>
                 <button onClick={() => setShowStatsSummary(false)}><X className="w-3 h-3 hover:text-white"/></button>
               </div>
               <div>{activeMetricConfig.titleTh}</div>
               {choroplethStats.isNumeric && (
                 <div className="mt-1">เฉลี่ย <strong className="text-white font-bold">{choroplethStats.avg.toFixed(1)}</strong> {activeMetricConfig.unit}</div>
               )}
               <div className="mt-1">จำนวน {choroplethStats.count} เขตพื้นที่</div>
             </div>
          )}

        </div>
        <div className="flex items-center pointer-events-none">
          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="pointer-events-auto bg-slate-900/95 p-1 rounded-r-xl border-y border-r border-slate-700/80 text-white shadow-lg ml-[-1px] hover:bg-slate-800 transition-colors"
          >
            {isLeftPanelOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Right Side Panel (Layers, Settings, Controls, Legend) */}
      <div className={`absolute top-4 right-0 bottom-6 z-[1001] flex transition-transform duration-300 pointer-events-none ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center pointer-events-none">
          <button
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="pointer-events-auto bg-slate-900/95 p-1 rounded-l-xl border-y border-l border-slate-700/80 text-white shadow-lg mr-[-1px] hover:bg-slate-800 transition-colors"
          >
            {isRightPanelOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        <div className="bg-slate-900/95 backdrop-blur-md p-4 border-y border-l border-slate-700/80 shadow-2xl rounded-l-2xl pointer-events-auto flex flex-col gap-4 w-80 sm:w-84 h-full overflow-y-auto no-scrollbar">
          
          {/* Quick Actions Horizontal */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-700/80">
            <div className="text-emerald-400 font-semibold text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>การตั้งค่าแผนที่</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowGisConnectorModal(true)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="ศูนย์เชื่อมโยงข้อมูล GIS (GeoJSON)"
              >
                <Database className="w-4 h-4 text-indigo-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = getLocationCoordinates(selectedDistrict, selectedSubDistrict);
                  mapInstanceRef.current?.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                title="เลื่อนแผนที่มาที่กึ่งกลาง"
              >
                <LocateFixed className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict('all');
                  setSelectedSubDistrict('all');
                  setSelectedVillage('all');
                  mapInstanceRef.current?.flyTo([8.4304, 99.9631], 10, { duration: 1 });
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="รีเซ็ตมุมมองทั้งจังหวัดนครศรีธรรมราช"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Tabs Content - Modified to fit nicely */}
          <div className="flex bg-slate-800 rounded-lg p-1 text-[11px] font-semibold text-slate-400 shrink-0">
            <button
              onClick={() => setActiveDrawerTab('layers')}
              className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                activeDrawerTab === 'layers' ? 'bg-slate-950 text-emerald-400 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              เปิด/ปิด ชั้นข้อมูล
            </button>
            <button
              onClick={() => setActiveDrawerTab('thematic')}
              className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                activeDrawerTab === 'thematic' ? 'bg-slate-950 text-amber-400 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              ตั้งค่าเรขาคณิต
            </button>
            <button
              onClick={() => setActiveDrawerTab('basemap')}
              className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                activeDrawerTab === 'basemap' ? 'bg-slate-950 text-indigo-400 shadow-xs' : 'hover:text-slate-200'
              }`}
            >
              แผนที่ฐาน
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar text-xs">
            {activeDrawerTab === 'layers' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 mb-1">ชั้นข้อมูลระบาดวิทยา (Epidemiology Layers)</div>
                  
                  <label className="flex items-center justify-between p-2 rounded-xl border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      </div>
                      <span className="text-slate-200 group-hover:text-white font-medium">จุดพบสัตว์ติดเชื้อ (Positive Cases)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showPositives ? 'bg-rose-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showPositives ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showPositives} onChange={(e) => setShowPositives(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-rose-900/30 bg-rose-950/10 hover:bg-rose-900/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-rose-500/60 flex items-center justify-center">
                        <span className="text-[9px] text-rose-400 font-bold">3k</span>
                      </div>
                      <span className="text-slate-300 group-hover:text-white">รัศมีเฝ้าระวัง 3 กม. (Outbreak Area)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showBuffer3km ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showBuffer3km ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showBuffer3km} onChange={(e) => setShowBuffer3km(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-amber-900/30 bg-amber-950/10 hover:bg-amber-900/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
                        <span className="text-[9px] text-amber-400 font-bold">5k</span>
                      </div>
                      <span className="text-slate-300 group-hover:text-white">รัศมีเฝ้าระวัง 5 กม. (Surveillance Area)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showBuffer5km ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showBuffer5km ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showBuffer5km} onChange={(e) => setShowBuffer5km(e.target.checked)} />
                  </label>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>จุดเสี่ยง & ทรัพยากร (Risk & Resources)</span>
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-amber-900/20 bg-amber-950/20 hover:bg-amber-900/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Home className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-200 group-hover:text-white font-medium">แหล่งพักพิงสุนัขจรจัด (Stray Habitats)</span>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showStrayHabitats ? 'bg-amber-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showStrayHabitats ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showStrayHabitats} onChange={(e) => setShowStrayHabitats(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-indigo-900/20 bg-indigo-950/10 hover:bg-indigo-900/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-white">สถานพยาบาล / รพ.สต. (Hospitals)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showHospitals ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showHospitals ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showHospitals} onChange={(e) => setShowHospitals(e.target.checked)} />
                  </label>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-1">ภูมิประเทศ & ขอบเขต (Geography)</div>
                  
                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-slate-500 bg-slate-800 flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-white">แสดงเส้นขอบเขตระดับอำเภอทับซ้อน</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showDistricts ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showDistricts ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                        <Droplet className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-slate-300 group-hover:text-white">แหล่งน้ำ / แม่น้ำ (Waterways)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showWaterways ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showWaterways ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showWaterways} onChange={(e) => setShowWaterways(e.target.checked)} />
                  </label>
                </div>
              </div>
            )}

            {activeDrawerTab === 'thematic' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400">ความทึบแสงของพื้นที่ (Opacity: {Math.round(polygonOpacity * 100)}%)</div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={polygonOpacity}
                    onChange={(e) => setPolygonOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>โปร่งใส (0%)</span>
                    <span>ทึบ (100%)</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800">
                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 group-hover:text-white">แสดงการลงสีพื้นที่ (Choropleth Polygons)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showPolygons ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showPolygons ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showPolygons} onChange={(e) => setShowPolygons(e.target.checked)} />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 group-hover:text-white">แสดงชื่อพื้นที่ (Polygon Labels)</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${showChoroplethLabels ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-xs transition-all ${showChoroplethLabels ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    <input type="checkbox" className="sr-only" checked={showChoroplethLabels} onChange={(e) => setShowChoroplethLabels(e.target.checked)} />
                  </label>
                </div>
              </div>
            )}

            {activeDrawerTab === 'basemap' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400 mb-1">เลือกสไตล์แผนที่ฐาน (Tile Layer):</div>
                <div className="space-y-1.5">
                  {(Object.keys(TILE_CONFIGS) as MapTileStyle[]).map((key) => {
                    const cfg = TILE_CONFIGS[key];
                    const isSelected = mapStyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMapStyle(key)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-xs'
                            : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-inner overflow-hidden relative ${
                            key === 'dark' ? 'bg-slate-900' :
                            key === 'satellite' ? 'bg-emerald-900' :
                            key === 'light' ? 'bg-slate-100' :
                            key === 'hot' ? 'bg-orange-100' :
                            key === 'topo' ? 'bg-amber-100' : 'bg-blue-50'
                          }`}>
                            {key === 'satellite' ? <Globe2 className="w-4 h-4 text-emerald-400" /> : <MapPin className={`w-4 h-4 ${key === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {cfg.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Legend Area Moved Here */}
          {showPolygons && (
            <div className="mt-4 pt-3 border-t border-slate-700/80">
              <div className="flex justify-between items-center mb-2">
                 <div className="text-xs font-bold text-white flex items-center gap-1.5">
                   <Sliders className="w-3.5 h-3.5 text-slate-400" />
                   คำอธิบายสัญลักษณ์ (Legend)
                 </div>
              </div>
              <div className="text-[10px] text-slate-300 font-medium bg-slate-950/60 p-1.5 rounded-md mb-2 border border-slate-700/50">
                 {activeMetricConfig.titleTh}
              </div>
              <div className="space-y-1.5 text-xs pb-4">
                {activeMetricConfig.legends.map((lg, idx) => {
                  const count = choroplethStats.classCounts[idx] || 0;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-md shrink-0 border border-white/30 shadow-xs"
                          style={{ backgroundColor: lg.color }}
                        />
                        <span className="text-slate-300">{lg.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Interactive Leaflet Map Canvas */}"""

    content = content[:start_idx] + new_ui + content[end_idx:]
    
    # We also need to remove the old legend which was at the bottom right.
    # Look for id="gis-map-legend"
    legend_start_marker = '<div id="gis-map-legend"'
    legend_start_idx = content.find(legend_start_marker)
    if legend_start_idx != -1:
        # find the end of this div. It's an absolute div at the end.
        # Just search for the end of it manually or replace it empty.
        legend_content_block = re.search(r'<div id="gis-map-legend".*?</div>\s*</div>\s*</div>', content, re.DOTALL)
        if legend_content_block:
             content = content.replace(legend_content_block.group(0), "")

    with open('src/components/map/LeafletGisMap.tsx', 'w') as f:
        f.write(content)
else:
    print("Could not find markers")
