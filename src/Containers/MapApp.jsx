import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {ContextType} from '../Context'
import { loadModules } from 'esri-loader';
import { Button, Descriptions, Divider, Drawer, Slider, Checkbox } from 'antd'
import ButtonNotif from '../Components/ButtonNotif';
import DeforestationForm from '../Components/DeforestationForm';

const WsEndPoint = "http://10.7.12.21:8000/service/WGService.asmx/"

class MapApp extends React.Component {
  static contextType = ContextType

  constructor(props, context) {
    super(props, context)
    this.mapRef = React.createRef()
    this.state = {
      isDrawerShow : false
    }
  }

  //=============================================================
  // FUNCTION
  //=============================================================
  f_showDrawer = (showed) => {
    this.setState({
      isDrawerShow : showed
    })
  }

  f_dfrsFormOnFinish = (data) => {
    console.log(data)
    this.layerDeforestationPoint.visible = true
  }

  componentDidMount() {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/VectorTileLayer', 'esri/widgets/BasemapGallery', 'esri/widgets/Expand', "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/widgets/Legend", "esri/geometry/geometryEngine"], { css: true }).then(
      ([ArcGISMap, MapView, VectorTileLayer, BasemapGallery, Expand, LayerList, FeatureLayer, GroupLayer, Graphic, GraphicsLayer, Legend, geometryEngine]) => {

        //===============================================================
        // LOCAL COMPONENT
        //===============================================================
        const DescriptionTable = (props) => {
          let [isTrace, setTrace] = useState(false)

          let data = props.data

          let detailDescription = []
          for (var key of Object.keys(data)) {
            detailDescription.push(<Descriptions.Item label={key} key={key} >{data[key]}</Descriptions.Item>)
          }

          // Function to draw spider map from POM to refinery
          let f_traceData = (id, layername, lon, lat) => {
            let url
            if (layername === "Refinery") {
              url = `${WsEndPoint}_GetPOMSupplier_?refinery=${id}`
              this.layerPom.visible = true
            } else if (layername === "POM") {
              url = `${WsEndPoint}_GetRefinery_?pom=${id}`
              this.layerRefinery.visible = true
            }

            fetch(url)
              .then(response => response.json())
              .then(resultData => {
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
                      // [props.position.longitude, props.position.latitude],
                      [lon, lat],
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
            this.layerRefinery.visible = false
            setTrace(false)
          }

          let f_button = () => {
            switch (props.title) {
              case "POM":
                return isTrace ? <Button type="primary" onClick={f_clearGraphic} danger >Clear</Button> : <Button type="primary" onClick={() => f_traceData(data.pomid, props.title, props.position.longitude, props.position.latitude)} >Trace</Button>
                break
              case "Refinery":
                return isTrace == true ? <Button type="primary" onClick={f_clearGraphic} danger >Clear</Button> : <Button type="primary" onClick={() => f_traceData(data.rfid, props.title, props.position.longitude, props.position.latitude)} >Trace</Button>
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

        const DfrsPopupContent = (props) => {
          const layerOptions = [
            { label : 'POM', value : this.layerPom  },
            { label : 'Reffinery', value : this.layerRefinery },
            { label : 'Concession Area', value : this.layerPlantationArea }]

          let onCheckboxChange = layerList => {
            layerOptions.map( layer => {
              if( layerList.includes( layer.value ) ){
                layer.value.visible = true
              } else{
                layer.value.visible = false
              } 
            })
          }

          return(
            <>
              <Divider />
              <h4>Buffer Radius in Kilometers</h4>
              <div style={{width : '80%'}}>
                <Slider defaultValue={0} tooltipVisible tooltipPlacement="bottom" onChange={ props.onSliderChange } />
              </div>
              <Divider />
              <h4>Choose layer to include in analysis</h4>
              {/* <Checkbox.Group options={layerOptions} onChange={ props.onCheckboxChange } /> */}
              <Checkbox.Group options={layerOptions} onChange={ onCheckboxChange } />
              <Divider />
              <Button type="primary">Export to Report</Button>
            </>
          )
        }

        //===============================================================
        // BASE FUNCTION
        //===============================================================
        
        var polySym = {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: [140, 140, 222, 0.5],
          outline: {
            color: [0, 0, 0, 0.5],
            width: 2
          }
        };

        let updateBufferGraphic = ( geometry,size ) => {
          if (size > 0){
            var bufferGeometry = geometryEngine.geodesicBuffer( geometry, size, "kilometers")
            if(this.bufferLayer.graphics.length === 0){
              this.bufferLayer.add(
                new Graphic({
                  geometry : bufferGeometry,
                  symbol : polySym
                })
              )
            } else {
              this.bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry
            }
          } else{
            this.bufferLayer.removeAll()
          }
        }

        // Generate table to popup
        let generateContent = (target, title) => {
          console.log(target, title)
          let popupDiv = document.createElement('div')

          if(title === "POM"){
            pomPopupTemplate.content = popupDiv
            ReactDOM.render(<DescriptionTable data={target.graphic.attributes} title={title} position={{ latitude: target.graphic.geometry.latitude, longitude: target.graphic.geometry.longitude }} />, popupDiv)
          } else if (title === "Deforestation Point"){
            dpPopupTemplate.content = popupDiv

            let onSliderChange = (bufferSize) => {
              let pointGeometry = target.graphic.geometry
              updateBufferGraphic(pointGeometry, bufferSize)
            }

            let onCheckboxChange = layerList => {
              layerList.map( layer => {
                layer.visible = true
              })
            }

            // ReactDOM.render(<DfrsPopupContent onSliderChange={onSliderChange} onCheckboxChange={onCheckboxChange} />, popupDiv)
            ReactDOM.render(<DfrsPopupContent onSliderChange={onSliderChange} />, popupDiv)

          }

          return popupDiv
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
          zoom: 5
        });

        //==============================================================
        // LAYER
        //==============================================================
        
        // GROUP PLANTATION
        //
        this.layerPlantationPoint = new FeatureLayer({
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/0",
          title: "Oil Palm Plantation of Third Party Supplier",
          visible: false
        });

        this.layerPlantationArea = new FeatureLayer({
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/2",
          title: "Oil Palm Area",
          visible: false
        });
        
        // GROUP INDUSTRIES
        //
        this.layerPkCrushing = new FeatureLayer({
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/industries_MIL1/MapServer/0",
          title: "PK Crushing",
          visible: false
        });

        this.layerRefinery = new FeatureLayer({
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Layer_Refinery_201908_sde/MapServer/0",
          title: "Refinery",
          visible: false,
          popupEnabled: true,
          outFields: ['*']
        });

        this.layerPom = new FeatureLayer({
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/1",
          title: "POM Supplier",
          visible: false,
          popupEnabled: true,
          outFields: ['pomid', 'PomName', 'CompanyNam', 'PlaceName', 'Tankcap', 'Silocap']
        });

        // GROUP DEFORESTATION
        //
        this.layerDeforestationPoint = new FeatureLayer({
          url : "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Deforestation/MapServer/0",
          title : "Deforestation Point",
          visible : false,
          popupEnabled: true,
        });
        map.add(this.layerDeforestationPoint)

        this.layerDeforestationArea = new FeatureLayer({
          url : "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Deforestation/MapServer/1",
          title : "Deforestation Area",
          visible : false
        });

        // Basemap WILMAR
        //
        var basemapWilmar = new VectorTileLayer({
          url: 'https://gisportal.wilmar.co.id/arcgisserver/rest/services/Hosted/Wilmar_Basemap2/VectorTileServer?f=pjson'
        });

        // SKETCH LAYER
        //
        this.sketchLayer = new GraphicsLayer()
        this.bufferLayer = new GraphicsLayer()
        map.addMany([this.sketchLayer, this.bufferLayer])

        // LAYER GROUPING
        //
        var glIndustries = new GroupLayer({
          title: "Industries"
        });

        var glPlantation = new GroupLayer({
          title : "Plantation"
        });

        var glDeforestation = new GroupLayer({
          title : "Deforestation"
        })

        glIndustries.addMany([ this.layerPkCrushing, this.layerRefinery, this.layerPom, ]);
        glPlantation.addMany([ this.layerPlantationArea, this.layerPlantationPoint ])
        glDeforestation.addMany([ this.layerDeforestationPoint, this.layerDeforestationArea ])
        map.addMany([ glPlantation, glIndustries, glDeforestation]);

        //=================================================================
        // WIDGET
        //=================================================================

        // BASEMAP GALERY
        //
        var basemapGallery = new BasemapGallery({
          view: this.view
        });
        var expand = new Expand({
          view: this.view,
          content: basemapGallery,
          expandTooltip: 'Change Basemap'
        });
        this.view.ui.add(expand, "top-right");

        // LAYERLIST
        //
        var layerList = new LayerList({
          view: this.view,
        })
        var expandLayerList = new Expand({
          view: this.view,
          content: layerList,
          expandTooltip: 'Layer List'
        })
        this.view.ui.add(expandLayerList, "top-right")

        // LEGEND
        //
        var legend = new Legend({
          view : this.view,
        })
        this.view.ui.add(legend, "bottom-right")

        //=================================================================
        //POPUP SET
        //=================================================================
        let pomPopupTemplate = {
          title: 'POM Suplier',
          content: (target) => generateContent(target, "POM")
        }
        this.layerPom.popupTemplate = pomPopupTemplate

        let refineryPopupTemplate = {
          title: 'Refinery',
          content: (target) => generateContent(target, "Refinery")
        }
        this.layerRefinery.popupTemplate = refineryPopupTemplate

        let dpPopupTemplate = {
          title : 'Deforestation Point',
          content : target => generateContent(target, "Deforestation Point")
        }
        this.layerDeforestationPoint.popupTemplate = dpPopupTemplate 

      });

  }

  componentDidUpdate(){
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
        <ButtonNotif onClick={ ()=>this.f_showDrawer(true) } />
        <Drawer
          title="Deforestation"
          placement="right"
          closable={true}
          onClose={ () => this.f_showDrawer(false) }
          visible={this.state.isDrawerShow}
          width={500}
        >
          <DeforestationForm onFinish={this.f_dfrsFormOnFinish} />
        </Drawer>
      </React.Fragment>
    )
  }
}

export default MapApp