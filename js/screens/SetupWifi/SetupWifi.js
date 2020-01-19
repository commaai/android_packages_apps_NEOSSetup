import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    FlatList,
    Image,
    RefreshControl,
    TextInput,
    TouchableOpacity,
    View,
    Keyboard,
} from 'react-native';
import PopupDialog, { DialogButton } from 'react-native-popup-dialog';
import { NetworkInfo } from 'react-native-network-info';

import Logging from '../../native/Logging';
import WifiModule from '../../native/Wifi';
import X from '../../themes';
import ChffrPlus from '../../native/ChffrPlus';
import Styles from './SetupWifiStyles';
import { updateHasDataConnection } from '../../store/host/actions';

const SECURITY_UNSECURED = 'Unsecured';
const BarImagesByLevel = {
  0: require('../../img/indicator_wifi_25.png'),
  1: require('../../img/indicator_wifi_50.png'),
  2: require('../../img/indicator_wifi_75.png'),
  3: require('../../img/indicator_wifi_100.png'),
};

class SetupWifi extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        handleSetupWifiMoreOptionsPressed: PropTypes.func,
        handleSetupWifiCompleted: PropTypes.func,
        handleSetupWifiBackPressed: PropTypes.func,
        hasDataConnection: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            networks: [],
            attemptedNetworkSsid: null,
            connectedNetworkSsid: null,
            connectingNetwork: null,
            hasSim: false,
            hasAuthProblem: false,
            password: '',
            showPassword: false,
            errorMessage: 'There was a problem scanning WiFi networks. \nMake sure WiFi is enabled in \"More Options\" above.',
        };

        this.updateAvailableNetworks = this.updateAvailableNetworks.bind(this);
    }

    componentWillMount() {
        this.refreshNetworks();
        DeviceEventEmitter.addListener('onWifiStateChange', this.onWifiStateChange);
    }

    componentDidMount() {
        this.testConnection();
        this.checkHasConnection = setInterval(() => {
            this.testConnection();
        }, 2000);
        this.checkHasSim = setInterval(() => {
            WifiModule.hasSim().then((hasSim) => {
                this.setState({
                    hasSim
                })
            })
        }, 1000);
        this.checkWifiEnabled = setInterval(() => {
            if (this.state.networks.length < 1) {
                this.handleProblemScanningNetworks()
            }
        }, 15000);
    }

    componentWillUnmount() {
        clearInterval(this.checkHasConnection);
        clearInterval(this.checkWifiEnabled);
        clearInterval(this.checkHasSim);
        DeviceEventEmitter.removeListener('onWifiStateChange', this.onWifiStateChange);
    }

    testConnection() {
        fetch('https://api.commadotai.com/v1/me').then(() => {
            this.props.updateHasDataConnection(true);
        }).catch(() => {
            this.props.updateHasDataConnection(false);
        })
    }

    handleProblemScanningNetworks = () => {
        this.setState({
            isLoading: false,
        })
    }

    onWifiStateChange = ({ isConnected, connectedSsid, hasAuthProblem }) => {
        let _attemptedNetworkSsid = null;
        let _connectedNetworkSsid = null;
        let _hasAuthProblem = false;

        if (isConnected && !hasAuthProblem) {
            _connectedNetworkSsid = connectedSsid;
        } else if (hasAuthProblem) {
            _attemptedNetworkSsid = connectedSsid;
            _hasAuthProblem = true;
        } else {
            _attemptedNetworkSsid = connectedSsid;
        }

        this.setState({
            attemptedNetworkSsid: _attemptedNetworkSsid,
            connectedNetworkSsid: _connectedNetworkSsid,
            hasAuthProblem: _hasAuthProblem,
        }, () => this.updateAvailableNetworks());
    }

    updateAvailableNetworks = (networks) => {
        if (networks === undefined) {
            networks = this.state.networks;
        };

        const { connectedNetworkSsid } = this.state;
        networks = networks.sort((lhs, rhs) => {
            if (lhs.ssid === connectedNetworkSsid) {
                return -1;
            } else {
                return rhs.level - lhs.level;
            }
        });

        this.setState({ networks, isLoading: false });
    }

    refreshNetworks = () => {
        this.setState({ isLoading: true });

        WifiModule.listAvailableNetworks().then(networks => {
            let { connectedNetworkSsid } = this.state;
            const connectedNetwork = networks.find(network => network.isConnected);
            connectedNetworkSsid = (connectedNetwork && connectedNetwork.ssid) || connectedNetworkSsid;

            this.setState({ connectedNetworkSsid, networks }, this.updateAvailableNetworks);
        });
    }

    connectToNetwork = (network, password) => {
        try {
            WifiModule.connect(network.ssid, password || null);
            this.setState({ connectingNetwork: network });
        } catch(err) {
            this.setState({ connectingNetwork: null });
            if (err.code === 'E_WIFI_ERR') {
                Logging.cloudLog('Failed to connect to network', { network });
            } else {
                throw err;
            }
        }
    }

    onTapToConnect = async (network) => {
        if (this.state.connectingNetwork !== null) {
            // currently can only connect to 1 network at a time
            // todo, cancel existing
            return;
        }

        NetworkInfo.getSSID(ssid => {
            if (ssid === network.ssid) {
                // Already connected
                this.setState({ connectedNetworkSsid: ssid }, this.updateAvailableNetworks);
            } else {
                this.setState({
                    connectingNetwork: network,
                    password: '',
                }, () => {
                    if (network.security === SECURITY_UNSECURED) {
                        this.connectToNetwork(network);
                    } else {
                        this.passwordDialog.show();
                        this.passwordInput.focus();
                    }
                });
            }
        });
    }

    onPasswordPromptConnectPressed = () => {
        const { password, connectingNetwork } = this.state;
        if (password.length < 8 || connectingNetwork == null) return;

        this.passwordDialog.dismiss();
        this.connectToNetwork(connectingNetwork, password);
        Keyboard.dismiss();
    }

    onDismissPasswordPrompt = () => {
        Keyboard.dismiss();
        this.passwordDialog.dismiss();
        this.setState({ connectingNetwork: null });
    }

    onDismissDataConnectionDialog = () => {
        this.dataConnectionDialog.dismiss();
    }

    handleSetupWifiContinuePressed = () => {
        const { hasDataConnection } = this.props;
        const { connectedNetworkSsid } = this.state;
        const hasNetworkSsid = (connectedNetworkSsid && connectedNetworkSsid !== '<unknown ssid>');
        if (hasDataConnection) {
            fetch('https://api.commadotai.com/v1/me').then(() => {
                this.props.handleSetupWifiCompleted();
            }).catch(() => {
                this.dataConnectionDialog.show();
            })
        } else if (hasNetworkSsid) {
            this.dataConnectionDialog.show();
        }
    }

    renderNetwork = ({ item }) => {
        const { attemptedNetworkSsid, connectedNetworkSsid, connectingNetwork, hasAuthProblem } = this.state;
        const hasAttempted = item.ssid == attemptedNetworkSsid && hasAuthProblem;
        const isConnected = item.ssid === connectedNetworkSsid;
        const isConnecting = connectingNetwork && item.ssid === connectingNetwork.ssid;

        return (
            <TouchableOpacity
                key={ item.ssid }
                activeOpacity={ 0.8 }
                onPress={ () => this.onTapToConnect(item) }>
                <View style={ Styles.setupWifiNetwork } key={ item.ssid }>
                    <Image
                        source={ BarImagesByLevel[item.level] }
                        style={ Styles.setupWifiNetworkIcon }
                        resizeMode='contain' />
                    <View style={ Styles.setupWifiNetworkDetails }>
                        <X.Text
                            color='white'
                            size='small'
                            weight='semibold'>
                            { item.ssid }
                        </X.Text>
                        <X.Text
                            size='tiny'
                            color='lightGrey200'
                            weight='light'>
                            { isConnected ? 'Connected'
                                : isConnecting ? 'Authenticating...'
                                : hasAttempted ? 'Authentication problem'
                                : item.security }
                        </X.Text>
                    </View>
                    <View style={ Styles.setupWifiNetworkStatus }>
                        { isConnected ? (
                            <X.Button
                                color='setupInverted'
                                size='small'
                                style={ Styles.setupWifiNetworkButtonConnected }>
                                <Image
                                    source={ require('../../img/circled-checkmark.png') }
                                    style={ Styles.setupWifiNetworkButtonConnectedIcon }
                                    resizeMode='contain' />
                                <X.Text
                                    color='white'
                                    size='small'
                                    weight='semibold'>
                                    Connected
                                </X.Text>
                            </X.Button>
                        ): isConnecting ? (
                            <X.Button
                                color='setupInverted'
                                size='small'
                                onPress={ () => this.onTapToConnect(item) }
                                style={ Styles.setupWifiNetworkButton }>
                                <ActivityIndicator
                                    color='white'
                                    refreshing={ true }
                                    size={ 37 }
                                    style={ Styles.setupWifiConnectingIndicator }/>
                            </X.Button>
                        ) : null }
                        { !isConnected && !isConnecting ? (
                            <X.Button
                                color='setupInverted'
                                size='small'
                                onPress={ () => this.onTapToConnect(item) }
                                style={ Styles.setupWifiNetworkButton }>
                                Connect
                            </X.Button>
                        ) : null }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    handleShowPasswordToggled = () => {
        this.setState({ showPassword: !this.state.showPassword });
    }

    keyExtractor = item => item.ssid;

    render() {
        const { networks, connectingNetwork, connectedNetworkSsid, showPassword, isLoading, hasSim } = this.state;
        const { hasDataConnection } = this.props;
        const hasNetworkSsid = (connectedNetworkSsid && connectedNetworkSsid !== '<unknown ssid>');
        return (
            <X.Gradient
                color='dark_black'>
                <X.Entrance style={ Styles.setupWifi }>
                    <PopupDialog
                        onDismissed={ this.onDismissPasswordPrompt }
                        ref={ (ref) => this.passwordDialog = ref }
                        height={ 0.5 }
                        dialogStyle={ Styles.setupWifiPasswordDialog }
                        haveOverlay={ true }
                        dismissOnTouchOutside={ false }
                        actions={ [
                            <View
                                key="dialog_buttons"
                                style={ Styles.setupWifiDialogButtons }>
                                <View style={ Styles.setupWifiPasswordDialogCheckbox }>
                                    <X.CheckboxField
                                        size='tiny'
                                        color='dark'
                                        isChecked={ showPassword }
                                        onPress={ this.handleShowPasswordToggled }
                                        label='Show password' />
                                </View>
                                <X.Button
                                    key='cancel'
                                    size='small'
                                    color='setupInvertedLight'
                                    onPress={ this.onDismissPasswordPrompt }
                                    style={ Styles.setupWifiDialogButton }>
                                    <X.Text
                                        color='lightGrey700'
                                        size='small'
                                        weight='semibold'>
                                        Cancel
                                    </X.Text>
                                </X.Button>
                                <X.Button
                                    key='connect'
                                    size='small'
                                    color='setupPrimary'
                                    onPress={ () => this.onPasswordPromptConnectPressed() }
                                    style={ Styles.setupWifiDialogButton }>
                                    <X.Text
                                        color='white'
                                        size='small'
                                        weight='semibold'>
                                        Connect
                                    </X.Text>
                                </X.Button>
                            </View>
                        ] }>
                        <X.Text
                            size='small'
                            weight='semibold'>
                            The network "{ connectingNetwork ? connectingNetwork.ssid : '' }" requires a password.
                        </X.Text>
                        <View style={ Styles.setupWifiPasswordInputRow }>
                            <View style={ Styles.setupWifiPasswordInputLabel }>
                                <X.Text
                                    size='small'
                                    color='whiteFieldLabel'
                                    style={ Styles.setupWifiPasswordInputLabelText }>
                                    Password:
                                </X.Text>
                            </View>
                            <TextInput
                                onChangeText={ (password) => this.setState({ password }) }
                                value={ this.state.password }
                                secureTextEntry={ !showPassword }
                                ref={ ref => this.passwordInput = ref }
                                disableFullscreenUI={ true }
                                style={ Styles.setupWifiPasswordInputField }
                                underlineColorAndroid='transparent'
                                keyboardType={ showPassword ? 'email-address' : null }
                            />
                        </View>
                    </PopupDialog>
                    <PopupDialog
                        onDismissed={ this.onDismissDataConnectionDialog }
                        ref={ (ref) => this.dataConnectionDialog = ref }
                        height={ 0.48 }
                        dialogStyle={ Styles.setupWifiNoDataConnectionDialog }
                        haveOverlay={ true }
                        dismissOnTouchOutside={ false }
                        actions={ [
                            <View
                                key="dialog_buttons"
                                style={ Styles.setupWifiDialogButtons }>
                                <X.Button
                                    key='connect'
                                    size='small'
                                    color='setupPrimary'
                                    onPress={ this.onDismissDataConnectionDialog }
                                    style={ Styles.setupWifiDialogButton }>
                                    <X.Text
                                        color='white'
                                        size='small'
                                        weight='semibold'>
                                        OK
                                    </X.Text>
                                </X.Button>
                            </View>
                        ] }>
                        <X.Text
                            size='small'
                            weight='semibold'>
                            The network "{ connectedNetworkSsid }" is not connected to the internet.
                        </X.Text>
                        <X.Text
                            size='small'
                            color='whiteFieldLabel'
                            style={ Styles.setupWifiNoDataConnectionDialogText }>
                            Please try another WiFi network with an active data connection.
                        </X.Text>
                    </PopupDialog>
                    <View style={ Styles.setupWifiHeader }>
                        <X.Text
                            color='white'
                            size='big'
                            weight='bold'>
                            Connect to WiFi
                        </X.Text>
                        <X.Button
                            size='small'
                            color='setupInverted'
                            onPress={ this.props.handleSetupWifiMoreOptionsPressed }
                            style={ Styles.setupWifiHeaderButton }>
                            More Options
                        </X.Button>
                    </View>
                    <View style={ Styles.setupWifiNetworks }>
                        <FlatList
                            data={ networks }
                            renderItem={ this.renderNetwork }
                            style={ Styles.setupWifiNetworksList }
                            keyExtractor={ this.keyExtractor }
                            extraData={ this.state }
                            refreshControl={
                                <RefreshControl
                                    refreshing={ isLoading }
                                    onRefresh={ this.refreshNetworks } />
                            }
                            ListEmptyComponent={
                                <View style={ Styles.setupWifiNetworksEmpty }>
                                    <X.Text
                                        color='white'
                                        size='small'>
                                        { isLoading && networks.length == 0 ? 'Scanning WiFi Networks...' : this.state.errorMessage }
                                    </X.Text>
                                </View>
                            }>
                        </FlatList>
                    </View>
                    <View style={ Styles.setupWifiButtons }>
                        <X.Button
                            color='setupInverted'
                            onPress={ () => this.props.handleSetupWifiBackPressed(isLoading, hasDataConnection) }
                            style={ Styles.setupWifiBackButton }>
                            Go Back
                        </X.Button>
                        <X.Button
                            color={ (hasNetworkSsid && hasDataConnection) ? 'setupPrimary' : hasDataConnection ? 'setupInverted' : 'setupDisabled' }
                            onPress={ this.handleSetupWifiContinuePressed }
                            style={ Styles.setupWifiContinueButton }>
                            <X.Text
                                color={ hasDataConnection ? 'white' : 'setupDisabled' }
                                weight='semibold'>
                                { hasNetworkSsid ? 'Continue' : 'Skip' }
                            </X.Text>
                            { !(hasNetworkSsid || hasDataConnection) && (
                                <X.Text
                                    color={ hasNetworkSsid || hasDataConnection ? 'white' : 'setupDisabled' }
                                    size='small'>
                                    { hasSim ? 'Waiting on cellular connection...' : 'No SIM inserted' }
                                </X.Text>
                            ) }
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
    updateHasDataConnection: (hasDataConnection) => {
        dispatch(updateHasDataConnection(hasDataConnection));
    },
    handleSetupWifiMoreOptionsPressed: () => {
        ChffrPlus.openWifiSettings();
    },
    handleSetupWifiCompleted: () => {
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
    handleSetupWifiBackPressed: (isLoading, hadDataConnection) => {
        if (hadDataConnection) {
            fetch('https://api.commadotai.com/v1/me').then(() => {
                dispatch(NavigationActions.reset({
                    index: 0,
                    key: null,
                    actions: [
                        NavigationActions.navigate({
                            routeName: 'SetupInstall',
                        })
                    ]
                }))
            }).catch(() => {
                dispatch(NavigationActions.reset({
                    index: 0,
                    key: null,
                    actions: [
                        NavigationActions.navigate({
                            routeName: 'SetupWelcome',
                        })
                    ]
                }))
            })
        } else {
            dispatch(NavigationActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({
                        routeName: 'SetupWelcome',
                    })
                ]
            }))
        }
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupWifi);
