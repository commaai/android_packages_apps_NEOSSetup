import React, { Component } from 'react';
import { View } from 'react-native';
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
    }

    constructor(props) {
        super(props);
        this.state = {
            statusText: "Once your software has finished downloading, the installation will begin.",
        }
    }

    render() {
        const { statusText } = this.state;
        return (
            <X.Gradient
                color='dark_black'
                style={ Styles.setupInstallConfirm }>
                <X.Entrance style={ Styles.setupInstallConfirmBody }>
                    <X.Text
                        size='jumbo'
                        weight='bold'
                        color='white'
                        style={ Styles.setupInstallConfirmHeadline }>Downloading software...</X.Text>
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
                            Cancel
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
