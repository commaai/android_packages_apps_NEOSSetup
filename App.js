import React, { Component } from 'react';
import {
    StatusBar,
    Platform,
} from 'react-native';
import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import RootReducer from './js/store';
import StackNavigator from './js/navigators/StackNavigator';
import SimStateListener from './js/utils/SimStateListener';
import WifiStateListener from './js/utils/WifiStateListener';

import {
    updateSimState,
    updateWifiState,
    setDeviceIds,
    refreshDeviceInfo,
} from './js/store/host/actions';

import { Sentry } from 'react-native-sentry';

if (!__DEV__) {
    // Sentry.config("https://9df5c8e976614af38b62b67faf49bf41@sentry.io/1540422").install();
}

function createNeosSetupStore() {
    let transforms = compose(applyMiddleware(thunk));
    const store = createStore(RootReducer,
                              undefined,
                              transforms);
    return { store };
}

export default class App extends Component {
    constructor(props) {
        super(props);

        const { store } = createNeosSetupStore();
        this.store = store;
    }

    async onBeforeLift() {
        // Called after store is rehydrated from disk
        this.store.dispatch(setDeviceIds()).then(() => this.store.dispatch(refreshDeviceInfo()));
        SimStateListener.register(this.store.dispatch);
        WifiStateListener.register(this.store.dispatch);
    }

    componentDidMount() {
        this.store.dispatch(updateSimState());
        this.store.dispatch(updateWifiState());
        StatusBar.setHidden(true);
    }

    componentWillUnmount() {
        SimStateListener.unregister();
        WifiStateListener.unregister();
    }

    render() {
        return (
            <Provider store={ this.store }>
                <StackNavigator />
            </Provider>
        );
    }

}
