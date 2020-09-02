import React, { useEffect, useRef, useState } from 'react';
import { Button, Badge, Descriptions, Divider, Drawer, DatePicker, Form } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import DeforestationForm from './DeforestationForm'

const ButtonClear = (props) => {
  let [visible, setVisible] = useState(false)
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <React.Fragment>
      <div className="button-clear">
        <Badge count={props.count}>
          {/* <Button type="primary" shape="circle" size="large" id="ButtonClear" onClick={showDrawer} > */}
          <Button type="primary" shape="circle" size="large" id="buttonClear" onClick={props.onClick} >
            <ClearOutlined />
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
        {/* <DeforestationForm onFinish={(data) => console.log("halo", data)} /> */}
      </Drawer>
    </React.Fragment>
  )
}

export default ButtonClear