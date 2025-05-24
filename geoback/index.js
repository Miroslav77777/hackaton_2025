const express = require('express');
const cors = require('cors'); // <-- импорт
const app = express();
const port = 5000; // или любой другой порт
app.use(cors()); // <-- разрешить CORS для всех источников (все домены)

const fs = require('fs');
const turf = require('@turf/turf'); // для геоопераций

// Загрузим GeoJSON из файла (замени на свой путь)
const geojson = JSON.parse(fs.readFileSync('./krasnodar_buildings.geojson'));

// Преобразуем в массив фич
const features = geojson.features;

app.get('/buildings', (req, res) => {
  // Получаем bbox из query: south, west, north, east
  const { south, west, north, east } = req.query;

  if (![south, west, north, east].every(Number)) {
    return res.status(400).json({ error: 'Invalid bbox parameters' });
  }

  const bboxPolygon = turf.bboxPolygon([Number(west), Number(south), Number(east), Number(north)]);

  // Фильтруем фичи по пересечению с bbox
  const filteredFeatures = features.filter((feature) => {
    try {
      return turf.booleanIntersects(feature, bboxPolygon);
    } catch {
      // Если какая-то геометрия некорректна — пропускаем
      return false;
    }
  });

  res.json({
    type: 'FeatureCollection',
    features: filteredFeatures,
  });
});

app.get('/autocomplete', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  const query = q.toLowerCase();
  const results = [];

  for (const feature of features) {
    const props = feature.properties || {};
    const street = props['addr:street'] || '';
    const number = props['addr:housenumber'] || '';
    const baseAddress = `${street} ${number}`.trim().toLowerCase();

    const buildingType = props['building'];
    const flatsCount = parseInt(props['building:flats'], 10);

    let coords;
    try {
      coords = turf.center(feature).geometry.coordinates;
    } catch {
      continue;
    }

    // если query входит в адрес дома
    if (baseAddress.includes(query)) {
      if ((buildingType === 'apartments' || buildingType === 'flats') && flatsCount > 0) {
        const maxFlats = Math.min(flatsCount, 200); // защита от перегрузки
        for (let i = 1; i <= maxFlats; i++) {
          results.push({
            id: feature.id,
            address: `${street} ${number}, кв. ${i}`,
            coordinates: coords,
          });
        }
      } else {
        results.push({
          id: feature.id,
          address: `${street} ${number}`,
          coordinates: coords,
        });
      }
    }

    if (results.length >= 50) break; // ограничим общий список
  }

  res.json(results);
});



app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
