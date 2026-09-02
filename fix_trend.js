const fs = require('fs');
let code = fs.readFileSync('src/components/views/ExecutiveDashboard.tsx', 'utf8');

code = code.replace(
  /const yearlyTrendData = \[([\s\S]*?)\];/,
  `const yearlyTrendData = [
    { year: '2564', tested: 48, positive: 4, humanDeath: 0, coverage: 74.5 },
    { year: '2565', tested: 52, positive: 3, humanDeath: 0, coverage: 76.8 },
    { year: '2566', tested: 61, positive: 4, humanDeath: 0, coverage: 78.2 },
    { year: '2567', tested: 58, positive: 3, humanDeath: 0, coverage: 80.1 },
    { year: '2568', tested: 65, positive: 2, humanDeath: 0, coverage: 82.5 },
    { year: '2569', tested: totalAnimalTested, positive: positiveAnimalCases, humanDeath: humanDeathsSelectedYear, coverage: vaccineCoverageRate },
  ];`
);

code = code.replace(
  /แนวโน้มการตรวจพบเชื้อและอัตราความครอบคลุมวัคซีนในสัตว์ \(2564 - 2568\)/,
  "แนวโน้มการตรวจพบเชื้อและอัตราความครอบคลุมวัคซีนในสัตว์ (2564 - 2569)"
);

fs.writeFileSync('src/components/views/ExecutiveDashboard.tsx', code);
