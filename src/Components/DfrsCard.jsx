import React from 'react'
import { Card, Descriptions, Button } from 'antd'
import moment from 'moment'

const DfrsCard = props => {
  return (
    <Card type="inner" title={`Deforestation ${props.index}`} extra={<Button type="dashed" onClick={props.zoomTo} >Zoom to</Button>}>
      <Descriptions size="small" layout="vertical" >
        <Descriptions.Item label="Latitude">{props.lat}</Descriptions.Item>
        <Descriptions.Item label="Longitude">{props.lon}</Descriptions.Item>
        <Descriptions.Item label="Start Date">{ moment(new Date(props.startdate)).format("yyyy/MM/DD")}</Descriptions.Item>
        <Descriptions.Item label="End Date">{ moment( new Date(props.enddate)).format("yyyy/MM/DD")}</Descriptions.Item>
        <Descriptions.Item label="Peatland">{props.peatland} ha</Descriptions.Item>
        <Descriptions.Item label="Mangrove">{props.mangrove} ha</Descriptions.Item>
        <Descriptions.Item label="Other">{props.other} ha</Descriptions.Item>
        <Descriptions.Item label="Total">{props.total} ha</Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
export default DfrsCard