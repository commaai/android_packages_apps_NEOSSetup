import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { NetworkInfo } from 'react-native-network-info';

import { updateSoftwareUrl } from '../../store/host/actions';
import X from '../../themes';
import Styles from './SetupInstallStyles';

class SetupInstall extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        handleSoftwareUrlChanged: PropTypes.func,
        handleSetupInstallCompleted: PropTypes.func,
        handleSetupInstallBackPressed: PropTypes.func,
        handleSetupConnectToWifiPressed: PropTypes.func,
        hasDataConnection: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedOption: '',
            connectedNetworkSsid: '',
        };
    }

    componentWillMount() {
        NetworkInfo.getSSID(connectedNetworkSsid => {
            if (connectedNetworkSsid !== '<unknown ssid>') {
                this.setState({ connectedNetworkSsid })
            }
        })
    }

    handleInstallOptionPressed(selectedOption) {
        this.setState({ selectedOption });
        if (selectedOption == 'dashcam') {
            this.props.handleSoftwareUrlChanged('https://chffrplus.comma.ai');
        }
    }

    render() {
        const { selectedOption, connectedNetworkSsid } = this.state;
        const { hasDataConnection } = this.props;
        return (
            <X.Gradient
                color='dark_black'>
                <X.Entrance style={ Styles.setupInstall }>
                    <View style={ Styles.setupInstallHeader }>
                        <X.Text
                            color='white'
                            size='big'
                            weight='bold'>
                            Choose Software to Install
                        </X.Text>
                        <X.Button
                            size='small'
                            color='setupInverted'
                            onPress={ this.props.handleSetupConnectToWifiPressed }
                            style={ Styles.setupInstallHeaderButton }>
                            { connectedNetworkSsid !== '' ? (
                                <X.Image
                                    source={ require('../../img/circled-checkmark.png') }
                                    style={ Styles.setupInstallHeaderConnectedIcon }
                                    isFlex={ false } />
                            ) : null }
                            <X.Text
                                color='white'
                                size='small'
                                weight={ connectedNetworkSsid == '' ? 'semibold' : 'regular' }>
                                { connectedNetworkSsid == '' ? 'Connect to WiFi' : 'Connected to WiFi' }
                            </X.Text>
                        </X.Button>
                    </View>
                    <View style={ Styles.setupInstallOptions }>
                        <TouchableOpacity
                            activeOpacity={ 0.9 }
                            style={ [Styles.setupInstallOption, selectedOption == 'dashcam' && Styles.setupInstallOptionSelected ] }
                            onPress={ () => this.handleInstallOptionPressed('dashcam') }>
                            <View style={ [ Styles.setupInstallOptionBubble, selectedOption == 'dashcam' && Styles.setupInstallOptionBubbleSelected ] }>
                                <View style={ [Styles.setupInstallOptionBubbleCenter, selectedOption == 'dashcam' && Styles.setupInstallOptionBubbleCenterSelected ] }>
                                </View>
                            </View>
                            <X.Text
                                color='white'
                                size='medium'
                                weight='semibold'
                                style={ Styles.setupInstallOptionText }>
                                Dashcam Software
                            </X.Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={ 0.9 }
                            style={ [Styles.setupInstallOption, selectedOption == 'custom' && Styles.setupInstallOptionSelected] }
                            onPress={ () => this.handleInstallOptionPressed('custom') }>
                            <View style={ [Styles.setupInstallOptionBubble, selectedOption == 'custom' && Styles.setupInstallOptionBubbleSelected] }>
                                <View style={ [Styles.setupInstallOptionBubbleCenter, selectedOption == 'custom' && Styles.setupInstallOptionBubbleCenterSelected] }>
                                </View>
                            </View>
                            <X.Text
                                color='white'
                                size='medium'
                                weight='semibold'
                                style={ Styles.setupInstallOptionText }>
                                Custom Software (Advanced)
                            </X.Text>
                        </TouchableOpacity>
                    </View>
                    <View style={ Styles.setupInstallButtons }>
                        <X.Button
                            color='setupInverted'
                            onPress={ () => this.props.handleSetupInstallBackPressed(hasDataConnection) }
                            style={ Styles.setupInstallButtonsBack }>
                            Go Back
                        </X.Button>
                        <X.Button
                            color={ selectedOption !== '' ? 'setupPrimary' : 'setupDisabled' }
                            onPress={ () => this.props.handleSetupInstallCompleted(selectedOption) }
                            style={ Styles.setupInstallButtonsContinue }>
                            <X.Text
                                color={ selectedOption !== '' ? 'white' : 'setupDisabled' }
                                weight='semibold'>
                                { selectedOption == 'custom' ? 'Continue' : 'Install Software' }
                            </X.Text>
                        </X.Button>
                    </View>
                </X.Entrance>
            </X.Gradient>
        );
    }
}

function mapStateToProps(state) {
    return {
        hasDataConnection: state.host.hasDataConnection,
    }
}

const mapDispatchToProps = dispatch => ({
    handleSoftwareUrlChanged: (softwareUrl) => {
        dispatch(updateSoftwareUrl(softwareUrl));
    },
    handleSetupInstallCompleted: async (selectedOption) => {
        const routeName = selectedOption == 'custom' ? 'SetupInstallCustom' : 'SetupInstallConfirm';
        if (selectedOption !== '') {
            dispatch(NavigationActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({
                        routeName,
                    })
                ]
            }))
        }
    },
    handleSetupInstallBackPressed: (hasDataConnection) => {
        const routeName = hasDataConnection ? 'SetupWelcome' : 'SetupWifi';
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName,
                })
            ]
        }))
    },
    handleSetupConnectToWifiPressed: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupWifi',
                })
            ]
        }))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupInstall);
