import React, { useEffect, useRef, useState } from 'react';
import { Consumer } from '../Context'
import { Button, Badge, Descriptions, Divider, Drawer, DatePicker, Form, Space, Select, Checkbox, Radio } from 'antd'
import { NotificationFilled } from '@ant-design/icons'
import { propTypes } from 'react-bootstrap/esm/Image';
import moment from 'moment'

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
}

const wrapperStyle = {
  xs: {
    span: 24,
    offset: 0,
  },
  sm: {
    span: 16,
    offset: 8,
  },
}

const DeforestationForm = (props) => {
  const [isTimeRangeDisable, setTimeRangeDisabled ] = useState(false)
  const [isPeriodDisable, setPeriodDisabled ] = useState(true)
  const [activeRadio, setActiveRadio] = useState('range-picker')

  const onRadioChange = e => {
    setActiveRadio(e.target.value)
    if(e.target.value == "period"){
      setPeriodDisabled(false)
        setTimeRangeDisabled(true)
    }
    else if(e.target.value == "range-picker"){
      setPeriodDisabled(true)
        setTimeRangeDisabled(false)
    }
    else if(e.target.value == "all"){
      setPeriodDisabled(true)
      setTimeRangeDisabled(true)
    }
  }

  function getDatesRange(startdate, enddate){
    let nextStartDate = startdate
    let arr = []
    while(nextStartDate <= enddate){
      let start = nextStartDate.format()
      let end = nextStartDate.add(13, 'days').format()
      arr.push([ start, end ])
      nextStartDate = nextStartDate.add(1, 'days')
    }
    return arr.reverse()
  }

  let timesRange =  getDatesRange(moment("20190215"), moment())

  return (
    <Form name="deforestation_control" {...formItemLayout} onFinish={ (e) => props.onFinish(e, activeRadio) } >
      <Radio.Group onChange={ onRadioChange } value={activeRadio}>
        <Radio value="range-picker">Time Range</Radio>
        <Radio value="period">Time Period</Radio>
        <Radio value="all">Select All</Radio>
      </Radio.Group>
      <Divider />
      <Form.Item name="range-picker" label="Time Range">
          <DatePicker.RangePicker format="YYYY/MM/DD" disabled={isTimeRangeDisable} />
      </Form.Item>
      <Divider>Or</Divider>
      <Form.Item name="period-time" label="Period Time">
        <Select placeholder="select time period" disabled={isPeriodDisable}>
          {
            timesRange.map( (el, i) => {
              let [start, end] = el
              return (<Select.Option key={i} value={ `${ moment(start).format("YYYY-MM-DD") }|${ moment( end ).format("YYYY-MM-DD") }`}>
                { moment( start ).format("MMM Do YYYY")} - { moment( end ).format("MMM Do YYYY")}
              </ Select.Option> )
            })
          }
        </Select>
      </Form.Item>
      <Form.Item wrapperCol={wrapperStyle} >
        <Space>
          <Button type="primary" htmlType="submit" id="button-form-deforestation">Submit</Button>
          <Button type="primary" htmlType="submit" id="button-form-deforestation">Clear</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default DeforestationForm