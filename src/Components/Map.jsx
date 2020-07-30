import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'
import { loadModules } from 'esri-loader';
import {Button, Badge, Descriptions, Divider } from 'antd'
import {NotificationFilled} from '@ant-design/icons'

export const WebMapView = () => {
  const mapRef = useRef("refMap");
  
  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/VectorTileLayer', 'esri/widgets/BasemapGallery', 'esri/widgets/Expand', "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/Graphic", "esri/layers/GraphicsLayer"], { css: true })
        .then(([ArcGISMap, MapView, VectorTileLayer, BasemapGallery, Expand, LayerList, FeatureLayer, GroupLayer, Graphic, GraphicsLayer]) => {
          //===============================================================
          // LOCAL COMPONENT
          //===============================================================
          const DescriptionTable = (props) => {
            console.log(props)
            let data = props.data

            // Function to draw spider map from POM to refinery
            let f_traceRefinery = (pomid) => {
              fetch(`http://10.7.12.21:8000/service/WGService.asmx/_GetRefinery_?pom=${pomid}`)
                .then( response => response.json() )
                .then( resultData => {
                  console.log(resultData)

                  // DRAW LINE
                  let lineSymbol = {
                    type : 'simple-line',
                    color : [226, 119, 40],
                    width : 2
                  }

                  resultData.map( el => {
                    let pet = [
                      [ props.position.longitude, props.position.latitude ],
                      [ parseFloat( el.X_Coor ), parseFloat( el.Y_Coor ) ]
                    ]

                    console.log(pet)
                    let spiderLine = {
                      type : "polyline",
                      paths : [
                        [ props.position.longitude, props.position.latitude ],
                        [ parseFloat( el.X_Coor ), parseFloat( el.Y_Coor ) ]
                      ]
                    }

                    let spiderLineGraphic = new Graphic({
                      geometry : spiderLine,
                      symbol : lineSymbol
                    })

                    view.graphics.add(spiderLineGraphic)
                  } )

                  // console.log(map)
                } )
                .catch(error => console.log('error', error));

            }
      
            let detailDescription = []
            for (var key of Object.keys(data)){
              detailDescription.push( <Descriptions.Item label={key} >{data[key]}</Descriptions.Item> )
            }
          
            return(
              <React.Fragment>
                <Descriptions title={props.title} style={{fontSize : '12px'}} bordered column={1} size="small">
                  { detailDescription }
                </Descriptions>
                <Divider />
                {
                  props.title === "POM" ?  <Button type="primary" onClick={() => f_traceRefinery(data.pomid) } >Trace</Button> : null
                }
               
              </React.Fragment>
            )
          }
          

          //===============================================================
          // BASE FUNCTION
          //===============================================================
          // Generate table to popup
          function generateContent(target, title){
            console.log(target)
            let pomPopupDiv = document.createElement('div')
            pomPopupTemplate.content = pomPopupDiv
            ReactDOM.render(<DescriptionTable data={target.graphic.attributes} title={title} position={{ latitude : target.graphic.geometry.latitude, longitude : target.graphic.geometry.longitude }} /> , pomPopupDiv)
            return pomPopupDiv
          }


          //===============================================================
          // MAP INIT
          //===============================================================
          const map = new ArcGISMap({
            basemap: 'streets-night-vector'
          });

          //===============================================================
          // VIEW INIT
          //===============================================================

          var graphicsLayer = new GraphicsLayer();
          map.add(graphicsLayer)

          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [118, 0],
            zoom: 6
          });

          let lineSymbol = {
            type: "simple-line",
            color: [226, 119, 40], // orange
            width: 2
          }

          let spiderLine = {
            type: "polyline",
         paths: [
           [116.78089000000013, 0.5109700000000379],
           [150.16067, 1.4405],
          //  [-118.808878330345, 34.0016642996246]
         ]
          }
          // let spiderLine = {
          //   type : "polyline",
          //   path : [
          //     [116.78089000000013, 0.5109700000000379],
          //     [150.16067, 1.4405]
          //   ]
          // }

          let spiderLineGraphic = new Graphic({
            geometry : spiderLine,
            symbol : lineSymbol
          })


          console.log(graphicsLayer)
          // graphicsLayer.add(spiderLineGraphic)

          //==============================================================
          // LAYER
          //==============================================================
          var layerPkCrushing = new FeatureLayer({
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/0",
            title : "PK Crushing",
            visible : false
          });
          var layerPlantationPoint = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/1",
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/0",
            title : "Oil Palm Plantation of Third Party Supplier",
            visible : false
          });
          var layerRefinery = new FeatureLayer({
            url : "http://10.7.12.106:6080/arcgis/rest/services/NewGISInteractiveMap/Layer_Refinery_201908_sde/MapServer/0",
            title : "Refinery",
            visible : false
            // visible : refVisible
          });
          var layerPom = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/3",
            // url : "https://gisportal.wilmar.co.id/arcgisserver/rest/services/NewGISInteractiveMap_2/Pom_Supplier/MapServer/1",
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/1",
            title : "POM Supplier",
            visible : false,
            popupEnabled : true,
            outFields : [ 'pomid', 'PomName', 'CompanyNam', 'PlaceName', 'Tankcap', 'Silocap' ] 
          });
          var layerPlantationArea = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/4",
            url : "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/2",
            title : "Oil Palm Area",
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

          //=================================================================
          // BASEMAP GALLERY
          //=================================================================
          var basemapGallery = new BasemapGallery({
            view: view
          });
          var expand = new Expand({
            view: view,
            content: basemapGallery,
            expandTooltip: 'Change Basemap'
          });
          view.ui.add(expand, "top-right");

          //=================================================================
          // LAYERLIST
          //=================================================================
          var layerList = new LayerList({
            view : view,
            listItemCreatedFunction: function(event) {
              const item = event.item;
              if (item.layer.type !== "group") {
                // don't show legend twice
                item.panel = {
                  content: "legend",
                  open: true
                };
              }
            }
          })
          var expandLayerList = new Expand({
            view : view,
            content : layerList,
            expandTooltip : 'Layer List'
          })
          view.ui.add(expandLayerList, "top-right")

          //=================================================================
          //POPUP SET
          //=================================================================
          let pomPopupTemplate = {
            title : 'POM Suplier',
            content : (target) => generateContent(target, "POM")
          }
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