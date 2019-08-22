import { StyleSheet } from 'react-native';

export default StyleSheet.create({
     welcome: {
       alignItems: 'center',
       justifyContent: 'center',
       display: 'flex',
     },
     welcomeBody: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 50,
        paddingTop: 60,
        width: 420,
     },
     welcomeHeadline: {
        flex: 0.3,
     },
     welcomeIntro: {
        flex: 0.5,
        textAlign: 'center',
     },
     welcomeButton: {
        flex: 0.5,
        width: 360,
     },
});
