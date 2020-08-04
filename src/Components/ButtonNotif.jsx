import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom'
import { loadModules, loadCss } from 'esri-loader';
import { Button, Badge, Descriptions, Divider, Drawer, DatePicker, Form } from 'antd'
import { NotificationFilled } from '@ant-design/icons'

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

const DeforestationForm = () => {
  return(
    <Form name="deforestation_control" {...formItemLayout} >
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
      </Form.Item>
    </Form>
  )
}

let ButtonNotif = () => {
  let [visible, setVisible] = useState(false)
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <React.Fragment>
      <div className="button-notif">
        <Badge count={2}>
          <Button type="primary" shape="circle" size="large" id="buttonNotif" onClick={showDrawer} >
            <NotificationFilled />
          </Button>
        </Badge>
      </div>
      <Drawer
        title="Deforestation"
        placement="right"
        closable={true}
        onClose={onClose}
        visible={visible}
        width={500}
      >
        <DeforestationForm />
      </Drawer>
    </React.Fragment>
  )
}

export default ButtonNotif