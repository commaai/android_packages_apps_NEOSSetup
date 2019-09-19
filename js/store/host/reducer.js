import {
    ACTION_CONNECTION_STATUS_CHANGED,
    ACTION_HAS_DATA_CONNECTION_CHANGED,
    ACTION_WIFI_STATE_CHANGED,
    ACTION_DEVICE_IDS_CHANGED,
    ACTION_SOFTWARE_URL_CHANGED,
} from './actions';
import { Constants } from '../../config';

const initialHostState = {
    isConnected: false,
    hasDataConnection: false,
    wifiState: {},
    imei: null,
    serial: null,
    softwareUrl: Constants.INITIAL_SOFTWARE_URL,
};

export default (state = initialHostState, action) => {
    switch (action.type) {
        case ACTION_CONNECTION_STATUS_CHANGED:
            return {
                ...state,
                isConnected: action.isConnected,
            }
        case ACTION_HAS_DATA_CONNECTION_CHANGED:
            return {
                ...state,
                hasDataConnection: action.hasDataConnection,
            }
        case ACTION_WIFI_STATE_CHANGED:
            return {
                ...state,
                wifiState: action.wifiState,
            }
        case ACTION_DEVICE_IDS_CHANGED:
            return {
                ...state,
                imei: action.imei,
                serial: action.serial,
            }
        case ACTION_SOFTWARE_URL_CHANGED:
            return {
                ...state,
                softwareUrl: action.softwareUrl,
            }
        default:
            return state;
    }
}
