(async () => {
  const shp = (await import('shpjs')).default;
  console.log(typeof shp);
  const shp2 = await import('shpjs');
  console.log(Object.keys(shp2));
})();
