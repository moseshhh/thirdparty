import { loadModules } from 'esri-loader';

const layers = loadModules(['esri/layers/FeatureLayer']).then(([FeatureLayer]) => {
  let layerPom = new FeatureLayer({
    url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/1",
    title: "POM Supplier",
    visible: false,
    popupEnabled: true,
    outFields: ['pomid', 'PomName', 'CompanyNam', 'PlaceName', 'Tankcap', 'Silocap']
  });
  return { layerPom : layerPom}
})

export default layers