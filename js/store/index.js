import { combineReducers } from 'redux';
import FilesystemStorage from 'redux-persist-filesystem-storage'

import host from './host/reducer';
import nav from './nav/reducer';

const persistConfig = (key) => ({
    key,
    storage: FilesystemStorage,
    debug: true,
});

const log = (state = {}, action) => {
    console.log('dispatched', action.type);
    return state
};

export default combineReducers({
    host,
    log,
    nav,
});
