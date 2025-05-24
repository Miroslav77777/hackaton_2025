import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import * as turf from '@turf/turf';
import { autorun } from 'mobx';


import mapStore from '../../stores/MapStore'; // путь подставь свой

const TILE_SIZE = 0.003; // ~500 м




const TileLayerComponent = ({ tile, layerGroup, tileLayersRef, cacheRef }) => {
  const cachedData = cacheRef.current.get(tile.key);

  const { data, error } = useQuery({
    queryKey: ['buildings', tile.south, tile.west, tile.north, tile.east],
    queryFn: async ({ queryKey }) => {
      const [, s, w, n, e] = queryKey;
      const res = await fetch(`http://localhost:5000/buildings?south=${s}&west=${w}&north=${n}&east=${e}`);
      return await res.json();
    },
    staleTime: 1000 * 60 * 5,
    enabled: !cachedData,
  });

  useEffect(() => {
    if (!layerGroup || !tileLayersRef || (!data && !cachedData)) return;
    if (tileLayersRef.current.has(tile.key)) return;

    const geojsonData = data || cachedData;

    const geoJsonLayer = L.geoJSON(geojsonData, {
      style: (feature) => {
        const isSelected = mapStore.selectedFeature?.id === feature.id;
        return {
          color: isSelected ? '#5ED05E' : 'white',
          weight: isSelected ? 2 : 1,
          fillOpacity: isSelected ? 0.4 : 0.1,
        };
      },
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: () => layer.setStyle({ color: '#5ED05E', weight: 2 }),
          mouseout: () => {
            const isSelected = mapStore.selectedFeature?.id === feature.id;
            layer.setStyle({ color: isSelected ? '#5ED05E' : 'white', weight: isSelected ? 2 : 1 });
          },
          click: () => {
            mapStore.setSelectedFeature(feature);
            tileLayersRef.current.forEach((layer) => {
            if (layer.setStyle) {
              layer.setStyle((f) => {
                const isSelected = f.id === feature.id;
                return {
                  color: isSelected ? '#5ED05E' : 'white',
                  weight: isSelected ? 2 : 1,
                  fillOpacity: isSelected ? 0.4 : 0.1,
                };
              });
            }
          });
            try {
              const center = turf.center(feature).geometry.coordinates;
              if (mapStore.mapInstance) {
                mapStore.mapInstance.flyTo([center[1], center[0]], 18, {
                  animate: true,
                  duration: 1,
                });
              }
            } catch (e) {
              console.warn('Ошибка определения центра:', e);
            }
          },
        });

        const houseNumber = feature.properties?.['addr:housenumber'];
        if (houseNumber) {
          layer.bindTooltip(houseNumber, {
            permanent: true,
            direction: 'center',
            className: 'house-number-tooltip',
          }).openTooltip();
        }
      },
    });

    geoJsonLayer.addTo(layerGroup);
    tileLayersRef.current.set(tile.key, geoJsonLayer);

    if (!cachedData && data) {
      cacheRef.current.set(tile.key, data);
    }

    return () => {
      if (tileLayersRef.current.has(tile.key)) {
        layerGroup.removeLayer(tileLayersRef.current.get(tile.key));
        tileLayersRef.current.delete(tile.key);
      }
    };
  }, [data, cachedData, layerGroup, tile.key, tileLayersRef, cacheRef]);

  // 🔁 MobX autorun для обновления цвета при смене selectedFeature
  useEffect(() => {
    if (!tileLayersRef.current.has(tile.key)) return;
    const geoJsonLayer = tileLayersRef.current.get(tile.key);

    const dispose = autorun(() => {
      const selectedId = mapStore.selectedFeature?.id;
      geoJsonLayer.setStyle((feature) => {
        const isSelected = selectedId === feature.id;
        return {
          color: isSelected ? '#5ED05E' : 'white',
          weight: isSelected ? 2 : 1,
          fillOpacity: isSelected ? 0.4 : 0.1,
        };
      });
    });

    return () => dispose();
  }, [tile.key]);

  if (error) {
    console.error('Ошибка загрузки тайла:', error);
  }

  return null;
};



const OverpassBuildings = () => {
  const map = useMap();
  const [visibleTiles, setVisibleTiles] = useState([]);
  const tileLayersRef = useRef(new Map()); // key -> Leaflet layer
  const cacheRef = useRef(new Map()); // key -> geojson данные

  useEffect(() => {
    mapStore.setMapInstance(map);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const layerGroup = L.layerGroup();
    layerGroup.addTo(map);
    tileLayersRef.current.layerGroup = layerGroup;

    // Дебаунс обновления тайлов — 300 мс
    const updateTilesDebounced = debounce(() => {
      const zoom = map.getZoom();

      if (zoom < 18) {
        // Очищаем слои и кеш
        tileLayersRef.current.forEach((layer) => layerGroup.removeLayer(layer));
        tileLayersRef.current.clear();
        setVisibleTiles([]);
        return;
      }

      const bounds = map.getBounds();
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();

      const newTiles = [];
      const newKeysSet = new Set();

      for (let lat = Math.floor(south / TILE_SIZE) * TILE_SIZE; lat < north; lat += TILE_SIZE) {
        for (let lng = Math.floor(west / TILE_SIZE) * TILE_SIZE; lng < east; lng += TILE_SIZE) {
          const key = `${lat.toFixed(5)}_${lng.toFixed(5)}`;
          newTiles.push({
            key,
            south: lat,
            west: lng,
            north: lat + TILE_SIZE,
            east: lng + TILE_SIZE,
          });
          newKeysSet.add(key);
        }
      }

      // Удаляем тайлы вне видимости
      tileLayersRef.current.forEach((layer, key) => {
        if (!newKeysSet.has(key)) {
          layerGroup.removeLayer(layer);
          tileLayersRef.current.delete(key);
        }
      });

      setVisibleTiles(newTiles);
    }, 300);

    updateTilesDebounced();

    map.on('moveend zoomend', updateTilesDebounced);
    return () => {
      map.off('moveend zoomend', updateTilesDebounced);
      updateTilesDebounced.cancel();
      tileLayersRef.current.forEach((layer) => layerGroup.removeLayer(layer));
      tileLayersRef.current.clear();
      map.removeLayer(layerGroup);
      setVisibleTiles([]);
    };
  }, [map]);

  return (
    <>
      {visibleTiles.map((tile) => (
        <TileLayerComponent
          key={tile.key}
          tile={tile}
          layerGroup={tileLayersRef.current.layerGroup}
          tileLayersRef={tileLayersRef}
          cacheRef={cacheRef}
        />
      ))}
    </>
  );
};

const queryClient = new QueryClient();

export default function MapComponent() {
  const center = [45.03547, 38.97531]; // Краснодар

  return (
    <QueryClientProvider client={queryClient}>
      <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <OverpassBuildings />
      </MapContainer>
    </QueryClientProvider>
  );
}
