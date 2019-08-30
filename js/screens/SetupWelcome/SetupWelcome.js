import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import X from '../../themes';
import Styles from './SetupWelcomeStyles';
import { updateHasDataConnection } from '../../store/host/actions';

class SetupWelcome extends Component {
    static navigationOptions = {
        header: null,
    };

    componentWillMount() {
        fetch('https://api.commadotai.com/me').then(() => {
            this.props.updateHasDataConnection(true);
        }).catch(() => {
            this.props.updateHasDataConnection(false);
        })
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
                        style={ Styles.welcomeHeadline }>Getting started with EON</X.Text>
                    <X.Text
                        size='medium'
                        color='white'
                        weight='light'
                        style={ Styles.welcomeIntro }>
                        Before we get on the road, let{"\'"}s cover some details and connect to the internet.
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
        const routeName = hasDataConnection ? 'SetupTerms' : 'SetupWifi';
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
