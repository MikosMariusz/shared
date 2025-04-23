import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Circle from 'ol/geom/Circle';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import {transform} from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

let map;

export const initMap = (
    config = {
        center: [16.561546, 50.733413],
        zoom: 14,
        epsg: 'EPSG:4326',
        target: 'mapContainer',
    }
) => {
    const center = transform(config.center, config.epsg, 'EPSG:3857');
    map = new Map({
        target: config.target,
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
        ],
        view: new View({
            center,
            zoom: config.zoom,
        }),
    });
};

export const getMap = () => map;

let mapClickEvent;

export const addMapClickEvent = (callback) => {
    if (!map) {
        console.error('Map is not initialized. Call initMap first.');
        return;
    }
    mapClickEvent = (event) => {
        const coordinate = transform(
            event.coordinate,
            'EPSG:3857',
            'EPSG:4326'
        );
        callback({lat: coordinate[1], lng: coordinate[0]});
    };
    map.on('click', mapClickEvent);
};

export const removeMapClickEvent = () => {
    if (!map || !mapClickEvent) {
        return;
    }
    map.un('click', mapClickEvent);
    mapClickEvent = null;
};

export const drawCircle = (center, radius) => {
    clearVectorLayer();
    const coordinate = transform(center, 'EPSG:4326', 'EPSG:3857');
    const circle = new Circle(coordinate, radius);
    const feature = new Feature(circle);
    const style = new Style({
        stroke: new Stroke({
            color: '#800080',
            width: 2,
        }),
    });
    feature.setStyle(style);
    const vectorSource = new VectorSource({
        projection: 'EPSG:3857',
        features: [feature],
    });
    const vectorLayer = new VectorLayer({
        source: vectorSource,
    });
    map.addLayer(vectorLayer);
    flyTo(coordinate, () => {});
};

export const clearVectorLayer = () => {
    map.getLayers().forEach((layer) => {
        if (layer instanceof VectorLayer) {
            map.removeLayer(layer);
        }
    });
};

export const flyTo = (location, done) => {
    const view = map.getView();
    const duration = 2000;
    const zoom = view.getZoom();
    let parts = 2;
    let called = false;
    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }
    view.animate(
        {
            center: location,
            duration,
        },
        callback
    );
    view.animate(
        {
            zoom: zoom - 1,
            duration: duration / 2,
        },
        {
            zoom,
            duration: duration / 2,
        },
        callback
    );
};
