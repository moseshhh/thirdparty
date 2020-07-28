import React, { useEffect, useRef, useState } from 'react';
import ReactDOMServer from 'react-dom/server'
import ReactDOM from 'react-dom'
import { loadModules } from 'esri-loader';
import {Button, Badge} from 'antd'
import {NotificationFilled} from '@ant-design/icons'

export const WebMapView = () => {
  const mapRef = useRef("refMap");
  const [refVisible, setRefVisible] = useState(false)

  const buttonNotifOnClick = (e) => {
    console.log(e)
    setRefVisible(true)
  }

  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/VectorTileLayer', 'esri/widgets/BasemapGallery', 'esri/widgets/Expand', "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/GroupLayer"], { css: true })
        .then(([ArcGISMap, MapView, VectorTileLayer, BasemapGallery, Expand, LayerList, FeatureLayer, GroupLayer]) => {

          //
          // MAP INIT
          //
          const map = new ArcGISMap({
            basemap: 'topo-vector'
          });

          //
          // VIEW INIT
          //
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [118, 0],
            zoom: 6
          });

          //
          // LAYER
          //
          var layerPkCrushing = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/0",
            title : "PK Crushing",
            visible : false
          });
          var layerPlantationPoint = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/1",
            url : "https://gisportal.wilmar.co.id/arcgisserver/rest/services/NewGISInteractiveMap_2/Pom_Supplier/MapServer/0",
            title : "Plantation Point",
            visible : false
          });
          var layerRefinery = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/2",
            title : "Refinery",
            // visible : false
            visible : refVisible
          });
          var layerPom = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/3",
            url : "https://gisportal.wilmar.co.id/arcgisserver/rest/services/NewGISInteractiveMap_2/Pom_Supplier/MapServer/1",
            title : "POM Supplier",
            visible : false,
            popupEnabled : true,
            outFields : [ '*' ] 
          });
          var layerPlantationArea = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/4",
            title : "Plantation Area",
            visible : false
          });
          var gl = new GroupLayer({
            title : "Industries"
          });
          //Basemap WILMAR
          var basemapWilmar = new VectorTileLayer({
            url: 'https://gisportal.wilmar.co.id/arcgisserver/rest/services/Hosted/Wilmar_Basemap2/VectorTileServer?f=pjson'
          });

          gl.addMany([layerPlantationArea, layerPkCrushing, layerPlantationPoint, layerRefinery, layerPom,]);
          map.add(gl)


          // BASEMAP GALLERY
          var basemapGallery = new BasemapGallery({
            view: view
          });
          var expand = new Expand({
            view: view,
            content: basemapGallery,
            expandTooltip: 'Change Basemap'
          });
          view.ui.add(expand, "top-right");

          // LAYERLIST
          var layerList = new LayerList({
            view : view
          })
          var expandLayerList = new Expand({
            view : view,
            content : layerList,
            expandTooltip : 'Layer List'
          })
          view.ui.add(expandLayerList, "top-right")


          //POPUP SET
          let pomPopupTemplate = {
            title : 'POM Suplier',
          }
          let pomPopupDiv = document.createElement('div')
          pomPopupTemplate.content = pomPopupDiv
          ReactDOM.render(<Button type="primary">Trace</Button>, pomPopupDiv)

          layerPom.popupTemplate = pomPopupTemplate


          return () => {
            if (view) {
              // destroy the map view
              view.container = null;
            }
          };

        });
    }
  );

  return (
    <React.Fragment>
      <div className="webmap" ref={mapRef} />
      <div className="button-notif">
        <Badge count={2}>
          {/* <Button type="primary" shape="circle" size="large" onClick={buttonNotifOnClick} > */}
          <Button type="primary" shape="circle" size="large" id="buttonNotif" >
            <NotificationFilled />
          </Button>
        </Badge>
      </div>
    </React.Fragment>
  )
};