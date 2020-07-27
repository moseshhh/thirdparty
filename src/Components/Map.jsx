import React, { useEffect, useRef, useState } from 'react';
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

          // MAP INIT
          const map = new ArcGISMap({
            basemap: 'topo-vector'
          });

          // LAYER
          // var fl = new FeatureLayer("https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/0");//city limit
          var layerPkCrushing = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/0",
            title : "PK Crushing",
            visible : false
          });
          var layerPlantationPoint = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/1",
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
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/3",
            title : "POM",
            visible : false
          });
          var layerPlantationArea = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/4",
            title : "Plantation Area",
            visible : false
          });
          var gl = new GroupLayer({
            title : "Industries"
          });
          // var gl1 = new GroupLayer();

          // gl1.addMany([fl1, fl2, fl3]);
          gl.addMany([layerPlantationArea, layerPkCrushing, layerPlantationPoint, layerRefinery, layerPom,]);

          map.add(gl)

          //Basemap WILMAR
          let basemapWilmar = new VectorTileLayer({
            url: 'https://gisportal.wilmar.co.id/arcgisserver/rest/services/Hosted/Wilmar_Basemap2/VectorTileServer?f=pjson'
          })

          // VIEW INIT
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [118, 0],
            zoom: 6
          });

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

          // view.ui.add(basemapGallery, {
          //   position: "top-right"
          // });

          // let buttonNotif = document.getElementById('buttonNotif')
          // buttonNotif.addEventListener('click', e => {
          //   console.log("halo")
          //   layerRefinery.visible = true
          // })


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
          <Button type="primary" shape="circle" size="large" onClick={buttonNotifOnClick} >
          {/* <Button type="primary" shape="circle" size="large" id="buttonNotif" > */}
            <NotificationFilled />
          </Button>
        </Badge>
      </div>
    </React.Fragment>
  )
};