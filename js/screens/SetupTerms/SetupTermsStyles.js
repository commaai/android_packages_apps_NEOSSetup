import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    setupTerms: {
        flex: 1,
        paddingLeft: 40,
        paddingRight: 40,
    },
    setupTermsHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 80,
        paddingTop: 10,
    },
    setupTermsScroll: {
        backgroundColor: 'rgba(3, 4, 4, 0.16)',
        borderColor: '#1D2225',
        borderWidth: 1,
        borderRadius: 13,
        flex: 0.65,
        position: 'relative',
    },
    setupTermsScrollView: {
        padding: 20,
    },
    setupTermsButtons: {
        flex: 0.25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    setupTermsButtonsDecline: {
        display: 'flex',
        height: '100%',
        width: 160,
    },
    setupTermsButtonsAccept: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        width: 320,
    },
});
