import React, { Component } from 'react';
// import reducers from './reducers';
import Navigation from './navigation';
import { 
	Alert,
  BackHandler
} from 'react-native';
// const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

export default class Main extends Component {
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backAction)
  }

  backAction = () => {
    console.log(this)
    console.log(this.navigator)
    console.log(this.navigator)
    // get the tabBar state.index to see what tab is focused
    // get the individual tab's index to see if it's at 0 or if there  is a screen to 'pop'
    if (this.navigator.state.nav.index != 0) {
      console.log(this.navigator.state.nav.index)
      return false
    } else {
      console.log('ok pressed')
      console.log(this.navigator.context)
      //this.navigator._navigation.setParams({ exitRegister: true })
      return true
    }
  }

  render() {
    return (
      // <Provider store={createStoreWithMiddleware()}>
      <Navigation
        ref={(ref) => this.navigator = ref}
      />
      // </Provider>
    );
  }
}