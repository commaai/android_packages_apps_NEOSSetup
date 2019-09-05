import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, NetInfo, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import ChffrPlus from '../../native/ChffrPlus';
import X from '../../themes';
import Styles from './SetupPairStyles';
import { setDeviceIds, updateConnectionState, updateDeviceIsPaired } from '../../store/host/actions';

class SetupPair extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        onContinue: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            pairToken: null,
        }
    }

    async componentDidMount() {
        await this.props.setDeviceIds();
        const { serial, imei } = this.props;
        this.checkPaired = setInterval(async () => {
            const _isPairedRequest = await fetch(`https://api.commadotai.com/v1/devices/is_paired_setup?serial=${ serial }&imei=${ imei }`);
            const _isPairedJson = await _isPairedRequest.json();
            this.props.handleDeviceIsPairedChanged(_isPairedJson.is_paired);
        }, 2500);
        NetInfo.isConnected.addEventListener('connectionChange', this.props.handleConnectionChange);
        NetInfo.isConnected.fetch().then(this.props.handleConnectionChange);
        ChffrPlus.createJwt({ pair: true }).then((pairToken) => {
            this.setState({ pairToken });
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.deviceIsPaired) {
            this.props.handleSetupPairCompleted();
        }
    }

    componentWillUnmount() {
        clearInterval(this.checkPaired);
        NetInfo.isConnected.removeEventListener('connectionChange', this.props.handleConnectionChange);
    }

    render() {
        const { serial, imei, deviceIsPaired } = this.props;
        return (
            <X.Gradient
                color='dark_black'>
                <X.Entrance style={ Styles.setupPairing }>
                    <View style={ Styles.setupPairingHeader }>
                        <X.Text
                            color='white'
                            size='big'
                            weight='bold'>
                            Pair Your Account
                        </X.Text>
                    </View>
                    <View style={ Styles.setupPairingBody }>
                        <View style={ Styles.setupPairingCode }>
                            { this.state.pairToken && serial && imei ? (
                                <View style={ Styles.setupPairingCodeWrapper }>
                                    { deviceIsPaired ? (
                                      <View style={ Styles.setupPairingCodeOverlay }>
                                          <View style={ Styles.setupPairingCodeOverlayCheckmark }>
                                              <X.Image
                                                  source={ require('../../img/icon_checkmark.png') }
                                                  style={ Styles.setupPairingCodeOverlayCheckmarkIcon }
                                                  tintColor='#178644' />
                                          </View>
                                      </View>
                                    ) : null }
                                    <QRCode
                                        value={ this.props.imei + '--' + this.props.serial + '--' + this.state.pairToken }
                                        size={ 250 } />
                                </View>
                            ) : (
                                <ActivityIndicator
                                    color='#ACB7BD'
                                    refreshing={ true }
                                    size={ 37 }
                                    style={ Styles.setupPairingLoadingIndicator }/>
                            ) }
                        </View>
                        <View style={ Styles.setupPairingContext }>
                            <View style={ Styles.setupPairingText }>
                                <X.Text>
                                    <X.Text
                                        color='white'
                                        size='medium'>
                                        { deviceIsPaired ? 'Successfully paired to an account in ' : 'Download '}
                                    </X.Text>
                                    <X.Text
                                        color='white'
                                        size='medium'
                                        weight='bold'>
                                        { 'comma connect ' }
                                    </X.Text>
                                    { deviceIsPaired ? null : (
                                      <X.Text
                                          color='white'
                                          size='medium'>
                                          { 'and scan this code to pair.' }
                                      </X.Text>
                                    ) }
                                </X.Text>
                            </View>
                            <View style={ Styles.setupPairingIcons }>
                                <View style={ Styles.setupPairingIconsApp }>
                                    <X.Image
                                        source={ require('../../img/icon_connect_app.png') }
                                        style={ Styles.setupPairingIconsApp } />
                                </View>
                                <View style={ Styles.setupPairingIconsStores }>
                                    <X.Image
                                        source={ require('../../img/icon_app_store.png') }
                                        style={ Styles.setupPairingIconsAppStore } />
                                    <X.Image
                                        source={ require('../../img/icon_play_store.png') }
                                        style={ Styles.setupPairingIconsPlayStore } />
                                </View>
                            </View>
                            <View style={ Styles.setupPairingButtons }>
                                <X.Button
                                    color='setupInverted'
                                    onPress={ this.props.handleSetupPairBackPressed }
                                    style={ Styles.setupPairingButtonsBack }>
                                    Go Back
                                </X.Button>
                                { deviceIsPaired ? (
                                    <X.Button
                                        color='setupPrimary'
                                        onPress={ this.props.handleSetupPairCompleted }
                                        style={ Styles.setupPairingButtonsContinue }>
                                        Continue
                                    </X.Button>
                                ) : (
                                    <X.Button
                                        color='setupInverted'
                                        onPress={ this.props.handleSetupPairSkipped }
                                        style={ Styles.setupPairingButtonsContinue }>
                                        Skip for Now
                                    </X.Button>
                                ) }
                            </View>
                        </View>
                    </View>
                </X.Entrance>
            </X.Gradient>
        );

    }
}

function mapStateToProps(state) {
    return {
        imei: state.host.imei,
        serial: state.host.serial,
        deviceIsPaired: state.host.deviceIsPaired,
        isConnected: state.host.isConnected,
    }
}

const mapDispatchToProps = dispatch => ({
    setDeviceIds: () => {
        return dispatch(setDeviceIds());
    },
    handleDeviceIsPairedChanged: (deviceIsPaired) => {
        dispatch(updateDeviceIsPaired(deviceIsPaired));
    },
    handleConnectionChange: (isConnected) => {
        dispatch(updateConnectionState(isConnected));
    },
    handleSetupPairCompleted: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupInstall',
                })
            ]
        }))
    },
    handleSetupPairSkipped: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupInstall',
                })
            ]
        }))
    },
    handleSetupPairBackPressed: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupTerms',
                })
            ]
        }))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupPair);
