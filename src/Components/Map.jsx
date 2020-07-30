import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom'
import { loadModules, loadCss } from 'esri-loader';
import { Button, Badge, Descriptions, Divider } from 'antd'
import { NotificationFilled } from '@ant-design/icons'

export const WebMapView = () => {
  const mapRef = useRef("refMap");

  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      // loadCss('https://js.arcgis.com/4.12/themes/dark/main.css', 'style')
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/VectorTileLayer', 'esri/widgets/BasemapGallery', 'esri/widgets/Expand', "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/Graphic", "esri/layers/GraphicsLayer"], { css: true })
        .then(([ArcGISMap, MapView, VectorTileLayer, BasemapGallery, Expand, LayerList, FeatureLayer, GroupLayer, Graphic, GraphicsLayer]) => {
          //===============================================================
          // LOCAL COMPONENT
          //===============================================================
          const DescriptionTable = (props) => {
            let [isTrace, setTrace] = useState(false)

            console.log(props)
            let data = props.data

            let detailDescription = []
            for (var key of Object.keys(data)) {
              detailDescription.push(<Descriptions.Item label={key} key={key} >{data[key]}</Descriptions.Item>)
            }

            // Function to draw spider map from POM to refinery
            let f_traceRefinery = (pomid) => {
              setTrace(true)
              fetch(`http://10.7.12.21:8000/service/WGService.asmx/_GetRefinery_?pom=${pomid}`)
                .then(response => response.json())
                .then(resultData => {
                  // DRAW LINE
                  let lineSymbol = {
                    type: 'simple-line',
                    color: [226, 119, 40],
                    width: 2
                  }

                  resultData.map(el => {
                    let pet = [
                      [props.position.longitude, props.position.latitude],
                      [parseFloat(el.X_Coor), parseFloat(el.Y_Coor)]
                    ]

                    console.log(pet)
                    let spiderLine = {
                      type: "polyline",
                      paths: [
                        [props.position.longitude, props.position.latitude],
                        [parseFloat(el.X_Coor), parseFloat(el.Y_Coor)]
                      ]
                    }

                    let spiderLineGraphic = new Graphic({
                      geometry: spiderLine,
                      symbol: lineSymbol
                    })

                    view.graphics.add(spiderLineGraphic)
                    layerRefinery.visible = true
                  })

                })
                .catch(error => console.log('error', error));

            }

            let f_traceData = (id, layername) => {
              let url
              if(layername="Refinery"){
                url = `http://10.7.12.21:8000/service/WGService.asmx/_GetPOMSupplier_?refinery=${id}`
              }

              setTrace(true)
              fetch(url)
                .then(response => response.json())
                .then(resultData => {
                  console.log(resultData)
                  // DRAW LINE
                  let lineSymbol = {
                    type: 'simple-line',
                    color: [226, 119, 40],
                    width: 2
                  }

                  resultData.map(el => {
                    let spiderLine = {
                      type: "polyline",
                      paths: [
                        [props.position.longitude, props.position.latitude],
                        [parseFloat(el.X_Coor), parseFloat(el.Y_Coor)]
                      ]
                    }

                    let spiderLineGraphic = new Graphic({
                      geometry: spiderLine,
                      symbol: lineSymbol
                    })

                    view.graphics.add(spiderLineGraphic)
                    layerRefinery.visible = true
                  })

                })
                .catch(error => console.log('error', error));

            }

            let f_clearGraphic = () => {
              view.graphics.removeAll()
              layerRefinery.visible = false
              setTrace(false)
            }

            let f_button = () => {
              console.log(props.title)
              if (props.title === "POM") {
                if (isTrace) {
                  return <Button type="primary" onClick={f_clearGraphic} danger >Clear</Button>
                }
                return <Button type="primary" onClick={() => f_traceRefinery(data.pomid)} >Trace</Button>
              }
              else if(props.title === "Refinery"){
                if (isTrace) {
                  return <Button type="primary" onClick={f_clearGraphic} danger >Clear</Button>
                }
                return <Button type="primary" onClick={() => f_traceData(data.rfid, props.title)} >Trace</Button>
              }
            }


            return (
              <React.Fragment>
                <Descriptions title={props.title} style={{ fontSize: '12px' }} bordered column={1} size="small">
                  {detailDescription}
                </Descriptions>
                <Divider />
                {f_button()}
              </React.Fragment>
            )
          }


          //===============================================================
          // BASE FUNCTION
          //===============================================================
          // Generate table to popup
          function generateContent(target, title) {
            console.log(target, title)
            let pomPopupDiv = document.createElement('div')
            pomPopupTemplate.content = pomPopupDiv
            ReactDOM.render(<DescriptionTable data={target.graphic.attributes} title={title} position={{ latitude: target.graphic.geometry.latitude, longitude: target.graphic.geometry.longitude }} />, pomPopupDiv)
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
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [118, 0],
            zoom: 6
          });

          //==============================================================
          // LAYER
          //==============================================================
          var layerPkCrushing = new FeatureLayer({
            url: "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/0",
            title: "PK Crushing",
            visible: false
          });
          var layerPlantationPoint = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/1",
            url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/0",
            title: "Oil Palm Plantation of Third Party Supplier",
            visible: false
          });
          var layerRefinery = new FeatureLayer({
            url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Layer_Refinery_201908_sde/MapServer/0",
            title: "Refinery",
            visible: false,
            popupEnabled : true,
            // outFields : [ 'rfid', 'RFName']
            outFields : [ '*']
          });
          var layerPom = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/3",
            // url : "https://gisportal.wilmar.co.id/arcgisserver/rest/services/NewGISInteractiveMap_2/Pom_Supplier/MapServer/1",
            url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/1",
            title: "POM Supplier",
            visible: false,
            popupEnabled: true,
            outFields: ['pomid', 'PomName', 'CompanyNam', 'PlaceName', 'Tankcap', 'Silocap']
          });
          var layerPlantationArea = new FeatureLayer({
            // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/4",
            url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/2",
            title: "Oil Palm Area",
            visible: false
          });
          var gl = new GroupLayer({
            title: "Industries"
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
            view: view,
            listItemCreatedFunction: function (event) {
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
            view: view,
            content: layerList,
            expandTooltip: 'Layer List'
          })
          view.ui.add(expandLayerList, "top-right")

          //=================================================================
          //POPUP SET
          //=================================================================
          let pomPopupTemplate = {
            title: 'POM Suplier',
            content: (target) => generateContent(target, "POM")
          }
          layerPom.popupTemplate = pomPopupTemplate

          let refineryPopupTemplate = {
            title : 'Refinery',
            content : (target) => generateContent(target, "Refinery")
          }
          layerRefinery.popupTemplate = refineryPopupTemplate


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