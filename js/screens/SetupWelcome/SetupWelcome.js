import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import X from '../../themes';
import Styles from './SetupWelcomeStyles';

class SetupWelcome extends Component {
    static navigationOptions = {
        header: null,
    };

    render() {
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
                            onPress={ this.props.navigateToSetup }>
                            Continue to Setup
                        </X.Button>
                    </View>
                </X.Entrance>
            </X.Gradient>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    navigateToSetup: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupWifi',
                })
            ]
        }))
    }
});

export default connect(null, mapDispatchToProps)(SetupWelcome);
