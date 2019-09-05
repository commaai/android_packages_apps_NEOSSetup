import React, { Component } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import X from '../../themes';
import Styles from './SetupTermsStyles';
import { updateHasDataConnection } from '../../store/host/actions';

class SetupTerms extends Component {
    static navigationOptions = {
        header: null,
    };

    static propTypes = {
        handleSetupTermsCompleted: PropTypes.func,
        handleSetupTermsBackPressed: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            hasScrolled: false,
            isAtBottom: false,
            terms: "",
            loadingMessage: "Please wait...",
        };
    }

    async componentDidMount() {
        try {
            const _terms = await fetch('https://chffrdist.blob.core.windows.net/connect/terms.json?t=' + Date.now());
            const terms = await _terms.json();
            this.setState({ terms: terms.text });
            this.props.updateHasDataConnection(true);
        } catch(error) {
            this.props.updateHasDataConnection(false);
            this.setState({ loadingMessage: 'Fetching terms failed. Please go back to try another WiFi network.' })
        }
    }

    onScroll = ({ nativeEvent }) => {
        const isAtBottom = (nativeEvent.contentSize.height - nativeEvent.contentOffset.y - this.scrollViewHeight) < 10;
        if (!this.state.isAtBottom) {
            this.setState({ isAtBottom });
        }
        if (!this.state.hasScrolled) {
            this.setState({ hasScrolled: true });
        }
    }

    onScrollViewLayout = ({ nativeEvent: { layout: { width, height }}}) => {
        this.scrollViewHeight = height;
    }

    render() {
        const {
          hasScrolled,
          isAtBottom,
          terms,
          loadingMessage,
        } = this.state;
        const { hasDataConnection } = this.props;

        return (
            <X.Gradient
                color='dark_black'>
                <X.Entrance style={ Styles.setupTerms }>
                    <View style={ Styles.setupTermsHeader }>
                        <X.Text
                            color='white'
                            size='big'
                            weight='bold'>
                            Review Terms
                        </X.Text>
                    </View>
                    <View style={ Styles.setupTermsScroll }>
                        <ScrollView
                            onScroll={ this.onScroll }
                            style={ Styles.setupTermsScrollView }
                            onLayout={ this.onScrollViewLayout }>
                            <X.Text
                                size='small'
                                color='white'
                                style={ Styles.setupTermsText }>
                                { terms == "" ? loadingMessage : terms }
                            </X.Text>
                        </ScrollView>
                    </View>
                    <View style={ Styles.setupTermsButtons }>
                        <X.Button
                            color='setupInverted'
                            onPress={ () => this.props.handleSetupTermsBackPressed(hasDataConnection) }
                            style={ Styles.setupTermsButtonsDecline }>
                            { 'Go Back' }
                        </X.Button>
                        <X.Button
                            color={ isAtBottom ? 'setupPrimary' : 'setupDefault'}
                            onPress={ isAtBottom ? this.props.handleSetupTermsCompleted : null }
                            style={ Styles.setupTermsButtonsAccept }>
                            { isAtBottom ? 'I agree to the terms' : 'Read to Continue' }
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
    handleSetupTermsCompleted: async () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({
                    routeName: 'SetupPair',
                })
            ]
        }))
    },
    handleSetupTermsBackPressed: (hasDataConnection) => {
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupTerms);
