import React, { useEffect, useRef, useState } from 'react';
import {Consumer} from '../Context'
import { Button, Badge, Descriptions, Divider, Drawer, DatePicker, Form } from 'antd'
import { NotificationFilled } from '@ant-design/icons'
import { propTypes } from 'react-bootstrap/esm/Image';

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

const DeforestationForm = (props) => {
  return(

    <Form name="deforestation_control" {...formItemLayout} onFinish={props.onFinish} >
            <Form.Item name="range-picker" label="Time Range">
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                xs: {
                  span: 24,
                  offset: 0,
                },
                sm: {
                  span: 16,
                  offset: 8,
                },
              }}
            >
              <Button type="primary" htmlType="submit" id="button-form-deforestation">
                Submit
              </Button>
              <Button type="primary" htmlType="submit" id="button-form-deforestation">
                Clear
              </Button>
            </Form.Item>
          </Form>


    // <Consumer>
    //   {
    //     (context) => (
    //       // <Form name="deforestation_control" {...formItemLayout} onFinish={context.f_setDfrsFormData} >
    //       <Form name="deforestation_control" {...formItemLayout} onFinish={props.onFinish} >
    //         <Form.Item name="range-picker" label="Time Range">
    //           <DatePicker.RangePicker />
    //         </Form.Item>
    //         <Form.Item
    //           wrapperCol={{
    //             xs: {
    //               span: 24,
    //               offset: 0,
    //             },
    //             sm: {
    //               span: 16,
    //               offset: 8,
    //             },
    //           }}
    //         >
    //           <Button type="primary" htmlType="submit" id="button-form-deforestation">
    //             Submit
    //           </Button>
    //         </Form.Item>
    //       </Form>
    //     )
    //   }
    // </Consumer>

  )
}

export default DeforestationForm