import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {ContextType} from '../Context'
import { loadModules } from 'esri-loader';
import { Button, Descriptions, Divider, Drawer } from 'antd'


const WsEndPoint = "http://10.7.12.21:8000/service/WGService.asmx/"

export class WebMapView extends React.Component {
  static contextType = ContextType

  constructor(props, context) {
    super(props, context)
    this.mapRef = React.createRef()
    this.state = {
      tes : true
    }
  }

  //=============================================================
  // FUNCTION
  //=============================================================


  componentDidMount() {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/VectorTileLayer', 'esri/widgets/BasemapGallery', 'esri/widgets/Expand', "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/Graphic", "esri/layers/GraphicsLayer"], { css: true }).then(
      ([ArcGISMap, MapView, VectorTileLayer, BasemapGallery, Expand, LayerList, FeatureLayer, GroupLayer, Graphic, GraphicsLayer]) => {

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
          let f_traceData = (id, layername) => {
            let url
            if (layername === "Refinery") {
              url = `${WsEndPoint}_GetPOMSupplier_?refinery=${id}`
              layerPom.visible = true
            }
            else if (layername === "POM") {
              url = `${WsEndPoint}_GetRefinery_?pom=${id}`
              layerRefinery.visible = true
            }

            // setTrace(true)

            return fetch(url)
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

                  this.view.graphics.add(spiderLineGraphic)
                })
              })
              .then(() => setTrace(true))
              .catch(error => console.log('error', error));

          }

          let f_clearGraphic = () => {
            this.view.graphics.removeAll()
            layerRefinery.visible = false
            setTrace(false)
          }

          let f_button = () => {

            switch (props.title) {
              case "POM":
                return isTrace ? <Button type="primary" onClick={f_clearGraphic} danger >Clear</Button> : <Button type="primary" onClick={() => f_traceData(data.pomid, props.title)} >Trace</Button>
                break
              case "Refinery":
                return isTrace == true ? <Button type="primary" onClick={f_clearGraphic} danger >Clear</Button> : <Button type="primary" onClick={() => f_traceData(data.rfid, props.title)} >Trace</Button>
                break
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
        // DOM
        //===============================================================
        // document.getElementById("button-form-deforestation").addEventListener('click', function(e){
        //   console.log(e)
        // })

        //===============================================================
        // MAP INIT
        //===============================================================
        const map = new ArcGISMap({
          basemap: 'streets-night-vector'
        });

        //===============================================================
        // VIEW INIT
        //===============================================================
        this.view = new MapView({
          container: this.mapRef.current,
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
        this.layerPlantationPoint = new FeatureLayer({
          // url : "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/1",
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/0",
          title: "Oil Palm Plantation of Third Party Supplier",
          visible: false
        });
        var layerRefinery = new FeatureLayer({
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Layer_Refinery_201908_sde/MapServer/0",
          title: "Refinery",
          visible: false,
          popupEnabled: true,
          // outFields : [ 'rfid', 'RFName']
          outFields: ['*']
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

        gl.addMany([layerPlantationArea, layerPkCrushing, this.layerPlantationPoint, layerRefinery, layerPom,]);
        map.add(gl)

        //=================================================================
        // BASEMAP GALLERY
        //=================================================================
        var basemapGallery = new BasemapGallery({
          view: this.view
        });
        var expand = new Expand({
          view: this.view,
          content: basemapGallery,
          expandTooltip: 'Change Basemap'
        });
        this.view.ui.add(expand, "top-right");

        //=================================================================
        // LAYERLIST
        //=================================================================
        var layerList = new LayerList({
          view: this.view,
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
          view: this.view,
          content: layerList,
          expandTooltip: 'Layer List'
        })
        this.view.ui.add(expandLayerList, "top-right")

        //=================================================================
        //POPUP SET
        //=================================================================
        let pomPopupTemplate = {
          title: 'POM Suplier',
          content: (target) => generateContent(target, "POM")
        }
        layerPom.popupTemplate = pomPopupTemplate

        let refineryPopupTemplate = {
          title: 'Refinery',
          content: (target) => generateContent(target, "Refinery")
        }
        layerRefinery.popupTemplate = refineryPopupTemplate

      });

      setTimeout(() => {
        this.setState({
          tes : false
        })
      }, 25000);
  }

  componentDidUpdate(){
    // console.log(this.state, this.view)
    console.log(this.context)
    this.layerPlantationPoint.visible = true
  }

  componentWillMount() {
    if (this.view) {
      this.view.container = null
    }
  }

  render() {
    return (
      <React.Fragment>
        <div className="webmap" ref={this.mapRef} />
      </React.Fragment>
    )
  }
}