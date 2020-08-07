import React, { useEffect, useRef, useState } from 'react';
import { Button, Badge, Descriptions, Divider, Drawer, DatePicker, Form } from 'antd'
import { NotificationFilled } from '@ant-design/icons'
import DeforestationForm from './DeforestationForm'

let ButtonNotif = (props) => {
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
        <Badge count={props.count}>
          {/* <Button type="primary" shape="circle" size="large" id="buttonNotif" onClick={showDrawer} > */}
          <Button type="primary" shape="circle" size="large" id="buttonNotif" onClick={props.onClick} >
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
        {/* <DeforestationForm onFinish={(data) => console.log("halo", data)} /> */}
      </Drawer>
    </React.Fragment>
  )
}

export default ButtonNotif