import React, { Component } from 'react';
import { View, TextInput } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { updateSoftwareUrl } from '../../store/host/actions';
import { Constants } from '../../config';
import X from '../../themes';
import Styles from './SetupInstallCustomStyles';

class SetupInstallCustom extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        softwareUrl: PropTypes.string,
        handleSoftwareUrlChanged: PropTypes.func,
        handleSetupInstallCustomCompleted: PropTypes.func,
        handleSetupInstallCustomBackPressed: PropTypes.func,
    };

    componentDidMount() {
        this.props.handleSoftwareUrlChanged(Constants.INITIAL_SOFTWARE_URL);
    }

    render() {
        const { softwareUrl } = this.props;
        return (
            <X.Gradient
                color='dark_black'>
                <X.Entrance style={ Styles.setupInstallCustom }>
                    <View style={ Styles.setupInstallCustomHeader }>
                    </View>
                    <View style={ Styles.setupInstallCustomBody }>
                        <X.Text
                            color='white'
                            size='medium'
                            weight='bold'
                            style={ Styles.setupInstallCustomTitle }>
                            Custom Software URL:
                        </X.Text>
                        <TextInput
                            onChangeText={ (softwareUrl) => this.props.handleSoftwareUrlChanged(softwareUrl) }
                            value={ this.props.softwareUrl }
                            ref={ ref => this.softwareUrlInput = ref }
                            style={ Styles.setupInstallCustomInput }
                            underlineColorAndroid='transparent'
                            disableFullscreenUI={ true }
                        />
                    </View>
                    <View style={ Styles.setupInstallCustomButtons }>
                        <X.Button
                            color='setupInverted'
                            onPress={ this.props.handleSetupInstallCustomBackPressed }
                            style={ Styles.setupInstallCustomButtonsBack }>
                            Go Back
                        </X.Button>
                        <X.Button
                            color={ softwareUrl !== Constants.INITIAL_SOFTWARE_URL ? 'setupPrimary' : 'setupDisabled' }
                            onPress={ softwareUrl !== Constants.INITIAL_SOFTWARE_URL ? this.props.handleSetupInstallCustomCompleted : null }
                            style={ Styles.setupInstallCustomButtonsContinue }>
                            <X.Text
                                color={ softwareUrl !== Constants.INITIAL_SOFTWARE_URL ? 'white' : 'setupDisabled' }
                                weight='semibold'>
                                Install Software
                            </X.Text>
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
    handleSoftwareUrlChanged: (softwareUrl) => {
        dispatch(updateSoftwareUrl(softwareUrl));
    },
    handleSetupInstallCustomCompleted: async () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupInstallConfirm',
                })
            ]
        }))
    },
    handleSetupInstallCustomBackPressed: () => {
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupInstallCustom);
