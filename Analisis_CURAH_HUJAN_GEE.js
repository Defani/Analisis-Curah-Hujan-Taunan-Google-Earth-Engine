var aoi = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Jawa Barat'))
  .geometry();

Map.centerObject(aoi, 8);

var citraCurahHujan = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filter(ee.Filter.date('2023-01-01', '2023-12-31'))
  .sum()
  .clip(aoi);

var parameterVisual = {
  min: 1000.0,
  max: 5000.0,
  palette: [
    '#ffffcc', '#ffeda0', '#fed976', '#feb24c', 
    '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'
  ]
};

Map.addLayer(citraCurahHujan, parameterVisual, 
            'Curah Hujan Tahunan 2023 (mm)');

var legenda = ui.Panel({
  style: {
    position: 'bottom-left', padding: '8px 15px', 
    border: '1px solid #cccccc'
  }
});

var judulLegenda = ui.Label({
  value: 'Curah Hujan Tahunan (mm)\nProvinsi Jawa Barat',
  style: {
    fontWeight: 'bold', fontSize: '15px', margin: '0 0 6px 0', 
    padding: '0', whiteSpace: 'pre'
  }
});
legenda.add(judulLegenda);

var nSteps = parameterVisual.palette.length;
var step = (parameterVisual.max - parameterVisual.min) / (nSteps - 1);

for (var i = 0; i < nSteps; i++) {
  var minVal = parameterVisual.min + i * step;
  var color = parameterVisual.palette[i];
  var label;

  if (i === 0) {
    label = '< ' + Math.round(minVal);
  } else if (i === nSteps - 1) {
    label = '> ' + Math.round(minVal);
  } else {
    var maxVal = minVal + step;
    label = Math.round(minVal) + ' - ' + Math.round(maxVal);
  }

  var colorBox = ui.Label({ style: { backgroundColor: color, padding: '8px',
       margin: '0 0 4px 0' } });
  var description = ui.Label({ value: label, 
       style: { margin: '0 0 4px 6px' } });

  var barisLegenda = ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
  legenda.add(barisLegenda);
}

var sumberLabel = ui.Label('Sumber Data: CHIRPS Daily v2.0', 
  {margin: '8px 8px 4px 8px', fontSize: '10px'});
legenda.add(sumberLabel);

Map.add(legenda);


Export.image.toDrive({
  image: citraCurahHujan,
  description: 'CurahHujan_JawaBarat_2023',
  folder: 'GEE_Export',          
  fileNamePrefix: 'CurahHujan_JawaBarat_2023',
  region: aoi,                   
  scale: 5000,                   
  maxPixels: 1e13,               
  crs: 'EPSG:4326'               
});
