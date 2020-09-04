import React from 'react'
import { Table, Divider } from 'antd'

const ModalContent = (props) => {
  const pomData = props.data[0].map( (el, i) => {
    return {
      key : i,
      no : i + 1,
      // name : el.attributes.PomName,
      name : el.attributes.PomName,
      distance : 1
    }
  })
  const concData = props.data[1].map( (el, i) => {
    return {
      key : i,
      no : i + 1,
      // name : el.attributes.PomName,
      name : el.attributes.Name,
      area : 10
    }
  })

  const columns = [
    {
      title : 'No',
      dataIndex : 'no',
      key : 'no',
      span : 1
    },
    {
      title: 'Pom Name',
      dataIndex: 'name',
      key: 'name',
      span : 10
    },
    {
      title: 'Distance (estimation)',
      dataIndex: 'distance',
      key: 'distance',
      span : 10
    },
    {
      title : "Status",
      dataIndex : 'status',
      key : 'status',
      span : 10,
    },
    {
      title : "Reffinery",
      dataIndex : 'reffinery',
      key : 'reffinery',
      span : 10
    }
  ];
  const columns2 = [
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
      dataIndex: 'area',
      key: 'area',
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
      <Table dataSource={pomData} columns={columns} />
      <Divider />
      <h2>Concession</h2>
      <Table dataSource={ concData } columns={columns2} />
    </div>
  )
}

export default ModalContent