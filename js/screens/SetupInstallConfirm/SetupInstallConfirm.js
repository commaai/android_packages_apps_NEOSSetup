import React, { Component } from 'react';
import { View, DeviceEventEmitter } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import X from '../../themes';
import Styles from './SetupInstallConfirmStyles';

class SetupInstallConfirm extends Component {
    static navigationOptions = {
        header: null,
    };

    componentDidMount() {
        const { softwareUrl } = this.props;
        this.props.handleSetupInstallConfirmCompleted(softwareUrl);
        DeviceEventEmitter.addListener('onDownloadFailed', (e) => {
            this.setState({
                statusTitle: 'Download failed',
                statusText: 'Please check the URL and try again.',
                buttonText: 'Go back',
            });
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            statusTitle: 'Downloading software...',
            statusText: 'Once your software has finished downloading, the installation will begin.',
            buttonText: 'Cancel',
        }
    }

    render() {
        const { statusTitle, statusText, buttonText } = this.state;
        return (
            <X.Gradient
                color='dark_black'
                style={ Styles.setupInstallConfirm }>
                <X.Entrance style={ Styles.setupInstallConfirmBody }>
                    <X.Text
                        size='jumbo'
                        weight='bold'
                        color='white'
                        style={ Styles.setupInstallConfirmHeadline }>
                        { statusTitle }
                    </X.Text>
                    <X.Text
                        size='medium'
                        color='white'
                        weight='light'
                        style={ Styles.setupInstallConfirmIntro }>
                        { statusText }
                    </X.Text>
                    <View style={ Styles.setupInstallConfirmButton }>
                        <X.Button
                            color='setupInverted'
                            size='small'
                            onPress={ this.props.handleSetupInstallConfirmBackPressed }>
                            { buttonText }
                        </X.Button>
                    </View>
                </X.Entrance>
            </X.Gradient>
        );
    }
}

let mapStateToProps = function(state) {
    return {
        softwareUrl: state.host.softwareUrl,
    }
}


const mapDispatchToProps = dispatch => ({
    handleSetupInstallConfirmCompleted: (softwareUrl) => {
        ChffrPlus.startInstaller(softwareUrl);
    },
    handleSetupInstallConfirmBackPressed: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupInstall',
                })
            ]
        }))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupInstallConfirm);
