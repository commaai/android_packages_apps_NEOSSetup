import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import X from '../../themes';
import Styles from './SetupWelcomeStyles';
import { updateHasDataConnection } from '../../store/host/actions';

class SetupWelcome extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        updateHasDataConnection: PropTypes.func,
        navigateToSetup: PropTypes.func,
        hasDataConnection: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.isTestingConnection = false;
    }

    componentWillMount() {
        this.testConnection();
        this.checkHasConnection = setInterval(() => {
            this.testConnection();
        }, 2000);
    }

    testConnection() {
        if (!this.isTestingConnection) {
            this.isTestingConnection = true;
            fetch('https://api.commadotai.com/v1/me').then(() => {
                this.props.updateHasDataConnection(true);
                this.isTestingConnection = false;
            }).catch(() => {
                this.props.updateHasDataConnection(false);
                this.isTestingConnection = false;
            })
        }
    }

    componentWillUnmount() {
        clearInterval(this.checkHasConnection);
    }

    render() {
        const { hasDataConnection } = this.props;
        return (
            <X.Gradient
                color='dark_black'
                style={ Styles.welcome }>
                <X.Entrance style={ Styles.welcomeBody }>
                    <X.Text
                        size='jumbo'
                        weight='bold'
                        color='white'
                        style={ Styles.welcomeHeadline }>Getting Started</X.Text>
                    <X.Text
                        size='medium'
                        color='white'
                        weight='light'
                        style={ Styles.welcomeIntro }>
                        Before we get on the road, let{"\'"}s finish installation and cover some details.
                    </X.Text>
                    <View style={ Styles.welcomeButton }>
                        <X.Button
                            color='setupPrimary'
                            size='big'
                            onPress={ () => this.props.navigateToSetup(hasDataConnection) }>
                            Continue to Setup
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
    navigateToSetup: (hasDataConnection) => {
        const routeName = hasDataConnection ? 'SetupInstall' : 'SetupWifi';
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupWelcome);
