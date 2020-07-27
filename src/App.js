import React, {useState} from 'react';
import {WebMapView} from './Components/Map';
import {Layout, Menu, Breadcrumb } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import logo from './logo.svg';
import './App.css';

const {Header, Footer, Sider, Content} = Layout
const { SubMenu } = Menu;

function App() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    // <WebMapView />
    <Layout style={{minHeight : '100vh'}}>
      {/* <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}> */}
      <Sider collapsed={collapsed}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            Option 1
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
            Option 2
          </Menu.Item>
          <SubMenu key="sub1" icon={<UserOutlined />} title="User">
            <Menu.Item key="3">Tom</Menu.Item>
            <Menu.Item key="4">Bill</Menu.Item>
            <Menu.Item key="5">Alex</Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
            <Menu.Item key="6">Team 1</Menu.Item>
            <Menu.Item key="8">Team 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9" icon={<FileOutlined />} />
        </Menu>
      </Sider>
      <Layout className="site-layout">
          <Content style={{ margin: '0 0px' }}>
            <div className="site-layout-background" style={{ minHeight: '100vh' }}>
              <WebMapView />
            </div>
          </Content>
          {/* <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer> */}
        </Layout>
    </Layout>

  );
}

export default App;
