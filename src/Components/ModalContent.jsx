import React, {useEffect, useState} from 'react'
import { Table, Divider, Tag, Button } from 'antd'
import { getDistance } from 'geolib'
import {loadModules} from 'esri-loader'

// loadModules([
//   "esri/geometry/geometryEngine"
// ]).then( ([geometryEngine]) => { 
//   cen = geometryEngine
// })

const ModalContent = (props) => {
  const [pomData, setPomData] = useState([])
  const [concData, setConcData] = useState([])
  const dfrsLoc = { latitude : props.location.latitude, longitude : props.location.longitude }
  console.log("dfrsarea", props.dfrsArea )

  useEffect(
    () => { loadModules([
        "esri/geometry/geometryEngine",
        "esri/geometry/projection",
        "esri/geometry/SpatialReference"
      ]).then( ([geometryEngine, projection, SpatialReference]) => { 
        // let wgs84 = new SpatialReference


        let dataPom = props.data[0].map( (el, i) => {
          let endLoc = { latitude : el.geometry.latitude, longitude : el.geometry.longitude }
          let jarak = getDistance(dfrsLoc, endLoc)
          let status = jarak > 1000 ? 'warning' : 'impacted'
          console.log("jarak", jarak)
          return {
            key : i,
            no : i + 1,
            name : el.attributes.PomName,
            distance : jarak / 1000,
            distanceNumber : jarak,
            status : status   
          }
        })
        dataPom.sort( (a,b) => a.distanceNumber - b.distanceNumber )

        let dataConc = props.data[1].map( (el, i) => {
          console.log("conc", el)
          projection.load().then(
            () => {
              var outSpatialReference = new SpatialReference({
                wkid: 3857 //Sphere_Sinusoidal projection
              });
              let g1 = projection.project(props.dfrsArea, outSpatialReference)
              let g2 = projection.project(el.geometry, outSpatialReference)
              let j = geometryEngine.distance(g1,g2)
              console.log("j", j)
            }
          )
          

          let jar = geometryEngine.distance(props.dfrsArea, el.geometry)
          let result = {
            key : i,
            no : i + 1,
            name : el.attributes.Name,
            area : 10,
            jar : jar
          }
          // return {
          //   key : i,
          //   no : i + 1,
          //   name : el.attributes.Name,
          //   area : 10
          // }
          return result
        })
        console.log(dataConc)

        setPomData(dataPom)
        setConcData(dataConc)

      })
    }
  , [])

  

  

  

  const columnsPom = [
    // {
    //   title : 'No',
    //   dataIndex : 'no',
    //   key : 'no',
    //   span : 1
    // },
    {
      title: 'Pom Name',
      dataIndex: 'name',
      key: 'name',
      span : 10,
      sorter : (a,b) => a.name.localeCompare(b.name),
      sortDirections: ['ascend']
    },
    {
      title: 'Distance (estimation) in Km',
      dataIndex: 'distance',
      key: 'distance',
      span : 10,
      sorter : (a,b) => a.distance - b.distance
    },
    {
      title : "Status",
      dataIndex : 'status',
      key : 'status',
      span : 10,
      render : status => {
        let color = status == "warning" ? 'yellow' : 'red'
        return(
          <Tag color={color} key={status}>
            {status}
          </Tag>
        )
      }
    },
    {
      title : "Action",
      dataIndex : 'action',
      key : 'action',
      span : 10
    }
  ];
  const columnsConc = [
    {
      title : 'No',
      dataIndex : 'no',
      key : 'no',
      span : 1
    },
    {
      title: 'Concession',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Area (estimation)',
      dataIndex: 'jar',
      key: 'jar',
    },
    {
      title : "Status",
      dataIndex : 'status',
      key : 'status',
      span : 10,
    },
  ];
  
  
  return(
    <div style={{height : '60vh', overflow : 'scroll', paddingLeft : '5vw', paddingRight : '5vw'}}>
      <h2>POM</h2>
      <Table dataSource={pomData} columns={columnsPom } />
      <Divider />
      <h2>Concession</h2>
      <Table dataSource={ concData } columns={columnsConc } />
    </div>
  )
}

export default ModalContent