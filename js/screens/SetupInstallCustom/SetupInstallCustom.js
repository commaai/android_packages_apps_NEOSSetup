import React, { Component } from 'react';
import { View, TextInput, Keyboard, TouchableOpacity } from 'react-native';
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

    constructor(props) {
        super(props);

        this.state = {
            urlInputIsDirty: false,
        }
    }

    componentDidMount() {
        this.props.handleSoftwareUrlChanged(Constants.INITIAL_SOFTWARE_URL);
        this.softwareUrlInput.focus();
    }

    handleSoftwareUrlChanged(softwareUrl) {
        this.setState({ urlInputIsDirty: true });
        this.props.handleSoftwareUrlChanged(softwareUrl);
    }

    handleOverlayPressed() {
        Keyboard.dismiss();
    }

    hasValidURL(softwareUrl) {
        const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,18}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var pattern = new RegExp(expression);
        return pattern.test(softwareUrl);
    }

    render() {
        const { urlInputIsDirty } = this.state;
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
                            onChangeText={ (softwareUrl) => this.handleSoftwareUrlChanged(softwareUrl) }
                            value={ this.props.softwareUrl }
                            ref={ ref => this.softwareUrlInput = ref }
                            style={ Styles.setupInstallCustomInput }
                            underlineColorAndroid='transparent'
                            disableFullscreenUI={ true }
                            keyboardType='email-address'
                        />
                        { !this.hasValidURL(softwareUrl) && urlInputIsDirty ? (
                            <X.Text
                                color='white'
                                size='small'>
                                The URL you have entered is not valid.
                            </X.Text>
                        ) : null }
                        <TouchableOpacity
                            activeOpacity={ 1 }
                            style={ Styles.setupInstallCustomOverlay }
                            onPress={ this.handleOverlayPressed }
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
                            color={ this.hasValidURL(softwareUrl) ? 'setupPrimary' : 'setupDisabled' }
                            onPress={ this.hasValidURL(softwareUrl) ? this.props.handleSetupInstallCustomCompleted : null }
                            style={ Styles.setupInstallCustomButtonsContinue }>
                            <X.Text
                                color={ this.hasValidURL(softwareUrl) ? 'white' : 'setupDisabled' }
                                weight='semibold'>
                                Install Software
                            </X.Text>
                        </X.Button>
                    </View>
                    <TouchableOpacity
                        activeOpacity={ 1 }
                        style={ Styles.setupInstallCustomOverlay }
                        onPress={ this.handleOverlayPressed }
                    />
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
