import {
    ACTION_SIM_STATE_CHANGED,
    ACTION_CONNECTION_STATUS_CHANGED,
    ACTION_WIFI_STATE_CHANGED,
    ACTION_DEVICE_IDS_AVAILABLE,
    ACTION_DEVICE_REFRESHED,
    ACTION_SOFTWARE_URL_CHANGED,
    ACTION_TERMS_VERSION_CHANGED,
} from './actions';
import SimState from './SimState';
import { Constants } from '../../config';

const initialHostState = {
    simState: SimState.UNKNOWN,
    isConnected: false,
    wifiState: {},
    imei: null,
    serial: null,
    deviceJwt: null,
    device: null,
    softwareUrl: 'https://',
    termsVersion: Constants.INITIAL_SOFTWARE_URL,
};

export default (state = initialHostState, action) => {
    switch (action.type) {
        case ACTION_SIM_STATE_CHANGED:
            return {
                ...state,
                simState: action.simState,
            }
        case ACTION_CONNECTION_STATUS_CHANGED:
            return {
                ...state,
                isConnected: action.isConnected,
            }
        case ACTION_WIFI_STATE_CHANGED:
            return {
                ...state,
                wifiState: action.wifiState,
            }
        case ACTION_DEVICE_IDS_AVAILABLE:
            return {
                ...state,
                imei: action.imei,
                serial: action.serial,
                deviceJwt: action.deviceJwt,
            }
        case ACTION_DEVICE_REFRESHED:
            return {
                ...state,
                device: action.device,
            }
        case ACTION_SOFTWARE_URL_CHANGED:
            return {
                ...state,
                softwareUrl: action.softwareUrl,
            }
        case ACTION_TERMS_VERSION_CHANGED:
            return {
                ...state,
                termsVersion: action.termsVersion,
            }
        default:
            return state;
    }
}
