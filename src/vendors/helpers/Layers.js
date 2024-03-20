/**
 * Creates a map layer instance for the given layer configuration.
 * 
 * Supports various layer types like MVT, WMS, WFS, XYZ, GeoJSON.
 * Handles creating the appropriate ol layer class and source 
 * based on the provided layerConfig.
 * 
 * Returns null if layer type is not supported.
 */
import { Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { OSM, XYZ, TileWMS, Vector as VectorSource, VectorTile as VectorTileSource } from 'ol/source';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import MVT from 'ol/format/MVT';
import GeoJSON from 'ol/format/GeoJSON';
import { geoJsonStyleFunction } from './Styles'

export function createLayer(layerConfig) {
  if (!layerConfig || !layerConfig.type) {
    console.warn("Skipping layer due to missing type or configuration:", layerConfig);
    return null;
  }

  switch (layerConfig.type) {
    case 'mvt':
      return new VectorTileLayer({
        name: layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        source: new VectorTileSource({
          attributions: layerConfig.attributions,
          format: new MVT(),
          url: layerConfig.source.url,
        }),
      });
    case 'wms':
      return new TileLayer({
        name: layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        source: new TileWMS({
          url: layerConfig.source.url,
          params: layerConfig.source.params,
          serverType: layerConfig.source.serverType,
          crossOrigin: layerConfig.source.crossOrigin,
        }),
      });
    case 'wfs':
      return new VectorLayer({
        name: layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        source: new VectorSource({
          format: new GeoJSON(),
          url: layerConfig.source.url,
        }),
      });
    case 'xyz':
      return new TileLayer({
        name: layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        source: new XYZ({
          url: layerConfig.source.url,
        }),
      });
    case 'geojson':
      return new VectorLayer({
        name: layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        source: new VectorSource({
          features: new GeoJSON().readFeatures(layerConfig.source.data, {
            // Ensure the features are read with the correct projection
            dataProjection: 'EPSG:4326', // Assuming the GeoJSON is in WGS 84
            featureProjection: 'EPSG:3857' // Assuming the map projection
          }),
        }),
        // Add this line to apply a generic style to the layer
        style: geoJsonStyleFunction
      });

    case 'cog':
      return new TileLayer({
        name: layerConfig.name,
        minZoom: layerConfig.minZoom,
        maxZoom: layerConfig.maxZoom,
        visible: layerConfig.visible,
        opacity: layerConfig.opacity,
        source: new GeoTIFF({
          sources: [
            {
              url: layerConfig.source.url,
              tileSize: 512,
              nodata: 0,
            },
          ],
          converToRGB: true,
          interpolate: true,
          normalize: true,
          opaque: true,
          wrapX: false,
          projection: 'EPSG:4326',
        }),
      });

    case 'stylegl':
    // Example: return applyStyle(new VectorTileLayer({ declutter: true }), layerConfig.source.styleURL);
    // break;
    default:
      //Error will cause issue within lowcoder. So just use log
      console.error(`Unsupported layer type: ${layerConfig.type}`);
      return null
  }
};