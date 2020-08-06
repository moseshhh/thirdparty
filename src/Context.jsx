import React from 'react'
let ContextType
const { Provider, Consumer } = (ContextType = React.createContext())

class ContextProvider extends React.Component {
  state = {
    dfrsFormData: {}
  }

  f_setDfrsFormData = (data) => {
    this.setState({
      dfrsFormData : data
    })
  }

  render() {
    return (
      <Provider value={{
        ...this.state,
        f_setDfrsFormData : this.f_setDfrsFormData
      }}>
        {this.props.children}
      </Provider>
    )
  }
}

export { ContextProvider, Consumer, ContextType }