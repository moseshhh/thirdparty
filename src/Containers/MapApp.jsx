import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {ContextType} from '../Context'
import { loadModules } from 'esri-loader';
import { Button, Descriptions, Divider, Drawer, Slider, Checkbox, Space, Result, Empty } from 'antd'
import ButtonNotif from '../Components/ButtonNotif';
import ButtonClear from '../Components/ButtonClear';
import DeforestationForm from '../Components/DeforestationForm';
import DfrsCard from '../Components/DfrsCard'
import moment from 'moment'
import PickerButton from 'antd/lib/date-picker/PickerButton';

const WsEndPoint = "http://10.7.12.21:8000/service/WGService.asmx/"

class MapApp extends React.Component {
  static contextType = ContextType

  constructor(props, context) {
    super(props, context)
    this.mapRef = React.createRef()
    this.state = {
      isDrawerShow : false,
      dfrsResult : null,
      timedata : []
    }

    this.f_fetchTimeDfrs()
  }

  //=============================================================
  // FUNCTION
  //=============================================================
  f_showDrawer = (showed) => {
    this.setState({
      isDrawerShow : showed
    })
  }

  f_dfrsFormOnFinish = (datamoment, type) => {
    console.log(datamoment, type)
    let startDate, endDate
    if(type == "range-picker"){
      startDate = datamoment["range-picker"][0].format("YYYY-MM-DD")
      endDate = datamoment["range-picker"][1].format("YYYY-MM-DD")
    }
    else if(type == "period"){
      console.log(datamoment["period-time"].split("|"))
      let [start, end ] = datamoment["period-time"].split("|")

      startDate = start
      endDate = end
    }

    // let startDate = datamoment["range-picker"][0].format("YYYY-MM-DD")
    // let endDate = datamoment["range-picker"][1].format("YYYY-MM-DD")

    let query =  this.layerDeforestationPoint.createQuery()
    // query.where = `start_date >= '${startDate}' and end_date <= '${endDate}'`
    query.where = `end_date >= '${startDate}' and end_date <= '${endDate}'`
    // this.layerDeforestationPoint.queryFeatures(query).then(response => console.log("query", response.features))
    this.layerDeforestationPoint.queryFeatures(query).then(response => this.setState({ dfrsResult : response.features }) )

    // this.layerDeforestationPoint.definitionExpression = `start_date >= '${startDate}' and end_date <= '${endDate}'`
    this.layerDeforestationPoint.definitionExpression = `end_date >= '${startDate}' and end_date <= '${endDate}'`
    this.layerDeforestationPoint.visible = true
  }

  f_zoomTo = (lat, lon) => {
    console.log(lat, lon)
    this.view.center = [lon, lat]
    this.view.zoom = 13
  }

  f_fetchTimeDfrs = () => {
    fetch(`https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Deforestation/MapServer/0/query?f=json&outFields=[start_date,end_date]&where=1=1&returnGeometry=false`)
      .then(response => response.json() )
      .then( data => this.setState({
        timedata : data.features
      }) )
  }

  f_clearBufferLayers = () => {
    this.bufferLayer.removeAll()
  }

  componentDidMount() {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/VectorTileLayer', 'esri/widgets/BasemapGallery', 'esri/widgets/Expand', "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/GroupLayer", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/widgets/Legend", "esri/geometry/geometryEngine", "esri/core/watchUtils", "esri/widgets/DistanceMeasurement2D", "esri/tasks/support/Query"], { css: true }).then(
      ([ArcGISMap, MapView, VectorTileLayer, BasemapGallery, Expand, LayerList, FeatureLayer, GroupLayer, Graphic, GraphicsLayer, Legend, geometryEngine, watchUtils, DistanceMeasurement2D, Query]) => {
        //===============================================================
        // LOCAL COMPONENT
        //===============================================================
        // Table deskripsi pada popup information
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

        // Konten saat Deforestation point di klik
        const DfrsPopupContent = (props) => {
          const [pomContent, setPomContent] = useState([])
          const [concContent, setConcContent] = useState([])
          const layerOptions = [
            { label : 'POM', value : this.layerPom  },
            { label : 'Reffinery', value : this.layerRefinery },
            { label : 'Concession Area', value : this.layerPlantationArea }]

          const onCheckboxChange = layerList => {
            layerOptions.map( layer => {
              if( layerList.includes( layer.value ) ){
                layer.value.visible = true
              } else{
                layer.value.visible = false
              } 
            })
          }

          const buttonOnClick = () => {
            console.log(this.bufferLayer.graphics.getItemAt(0))
            let geom = ( this.bufferLayer.graphics.getItemAt(0) !== undefined ) ? this.bufferLayer.graphics.getItemAt(0).geometry : false
            if(geom){
              const query = new Query()
              query.geometry = geom
              query.spatialRelationship = "intersects";

              // Querying POM
              this.layerPom.queryFeatures(query).then( response => {
                let features = response.features
                let pom = features.map(el => {
                  return el.attributes.PomName
                })
                setPomContent(pom)
              })

              // Querying Concession
              this.layerPlantationArea.queryFeatures(query).then( result => {
                console.log(result.features)
                let concession = result.features.map( el => {
                  return el.attributes.Name
                })
                setConcContent(concession)
              })
            }
            // this.layerPom.definitionExpression = "pomid = 7"
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
              {pomContent.length > 0 ? <h2>POM</h2> : null}
              {pomContent.map(el => {
                return <li key={el}>{el}</li>
              })}
              {concContent.length > 0 ? <><br/><h2>Concession</h2></> : null}
              {
                concContent.map(el => <li key={el}>{el}</li>)
              }
              <Divider />
              {/* <Button type="primary" onClick={ props.onClick }>Export to Report</Button> */}
              <Button type="primary" onClick={ buttonOnClick }>Analysze</Button>
            </>
          )
        }

        //===============================================================
        // BASE FUNCTION
        //===============================================================
        // Fungsi untuk menggambar buffer
        const updateBufferGraphic = ( geometry,size ) => {
          let polySym = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [140, 140, 222, 0.5],
            outline: {
              color: [0, 0, 0, 0.5],
              width: 2
            }
          };
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

        // Generate isi dari popup
        const generateContent = (target, title) => {
          console.log(target, title)
          
          let pomContent = ''

          let popupDiv = document.createElement('div')

          if(title === "POM"){
            pomPopupTemplate.content = popupDiv
            ReactDOM.render(<DescriptionTable data={target.graphic.attributes} title={title} position={{ latitude: target.graphic.geometry.latitude, longitude: target.graphic.geometry.longitude }} />, popupDiv)
          } else if (title === "Deforestation Point"){
            dpPopupTemplate.content = popupDiv

            const onSliderChange = (bufferSize) => {
              let pointGeometry = target.graphic.geometry
              updateBufferGraphic(pointGeometry, bufferSize)
            }

            const onCheckboxChange = layerList => {
              layerList.map( layer => {
                layer.visible = true
              })
            }

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
        this.map = new ArcGISMap({
          basemap: 'streets-night-vector'
        });

        //===============================================================
        // VIEW INIT
        //===============================================================
        this.view = new MapView({
          container: this.mapRef.current,
          map: this.map,
          center: [118, 0],
          zoom: 4
        });

        this.view.when(
          function(){console.log("sukses") },
          function(err){console.log(err)}
        )

        //==============================================================
        // LAYER
        //==============================================================
        
        // GROUP PLANTATION
        //
        this.layerPlantationPoint = new FeatureLayer({
          // url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Third_Party_Supplier/MapServer/0",
          url: "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/OilPalm_Plantation_TP_Supplier/MapServer/0",
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
        // this.layerPom = importedLayer.layerPom

        // GROUP DEFORESTATION
        //
        this.layerDeforestationPoint = new FeatureLayer({
          url : "https://idjktsvr10.wil.local/arcgis/rest/services/NewGISInteractiveMap/Deforestation/MapServer/0",
          title : "Deforestation Point",
          visible : false,
          popupEnabled: true,
        });
        this.map.add(this.layerDeforestationPoint)

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
        this.sketchLayer = new GraphicsLayer({
          listMode : "hide"
        })
        this.bufferLayer = new GraphicsLayer({
          listMode : "hide"
        })
        this.map.addMany([this.sketchLayer, this.bufferLayer])

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
        glDeforestation.addMany([ this.layerDeforestationArea, this.layerDeforestationPoint,  ])
        this.map.addMany([ glPlantation, glIndustries, glDeforestation]);

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

        //==================================================================
        // EVENT
        //==================================================================
        watchUtils.whenTrue(this.view, "stationary", () => {
          if(this.view.zoom >= 10){
            console.log(this.view.zoom)
            this.layerDeforestationArea.visible = this.layerDeforestationPoint.visible ? true : false 
          }
          else{
            this.layerDeforestationArea.visible = false
          }
        })
      });
  }

  componentDidUpdate(){
    // console.log(this.context)
    // this.layerPlantationPoint.visible = true
  }

  componentWillMount() {
    if (this.view) {
      this.view.container = null
    }
  }

  render() {
    let dfrsContent
    if(this.state.dfrsResult == null){
      dfrsContent = <Result title="Please choose date range" />
    }
    else if(this.state.dfrsResult.length == 0){
      dfrsContent = <Empty />
    } 
    else {
      let content = []
      this.state.dfrsResult.map( (features, index) => {
        content.push(<DfrsCard key={index} lat={features.attributes.POINT_X} lon={features.attributes.POINT_Y} startdate={features.attributes.start_date} enddate={features.attributes.end_date} peatland={features.attributes.peatland} mangrove={features.attributes.mangrove} other={features.attributes.other} total={features.attributes.total} index={index + 1} zoomTo={()=>this.f_zoomTo(features.attributes.POINT_Y, features.attributes.POINT_X) }  />)
      })
        dfrsContent = <Space direction="vertical">{content}</Space>
    }

    return (
      <React.Fragment>
        <div className="webmap" ref={this.mapRef} />
        <ButtonNotif onClick={ ()=>this.f_showDrawer(true) } count={4} />
        <ButtonClear onClick={ this.f_clearBufferLayers }  />
        <Drawer
          title="Deforestation"
          placement="right"
          closable={true}
          onClose={ () => this.f_showDrawer(false) }
          visible={this.state.isDrawerShow}
          width={500}
        >
          <DeforestationForm periodData={this.state.timedata} onFinish={this.f_dfrsFormOnFinish} />
          <Divider />
          <div style={{display : 'flex', flexDirection : 'column', justifyContent : 'space-between'}}>
            {dfrsContent}
          </div>
        </Drawer>
      </React.Fragment>
    )
  }
}

export default MapApp