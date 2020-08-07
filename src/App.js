import React from 'react';
import ButtonNotif from './Components/ButtonNotif';
import Sidebar from './Containers/Sidebar'
import MapApp from './Containers/MapApp'
import { ContextProvider } from './Context'
import { Layout } from 'antd';
import './App.css';

const { Content } = Layout

function App() {
  return (
    <ContextProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout className="site-layout">
          <Content style={{ margin: '0 0px' }}>
            <div className="site-layout-background" style={{ minHeight: '100vh' }}>
              <MapApp />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ContextProvider>

  );
}

export default App;
