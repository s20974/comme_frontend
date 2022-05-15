import { createStore, applyMiddleware } from 'redux';
import authReducer from './authReducer';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import * as apiCalls from "../api/apiCalls";

const configureStore = (addLogger = true) => {
    let localStorageData = localStorage.getItem('com-auth');
    let persistendState = {
        id: 0,
        username: '',
        surname: '',
        image: '',
        password: '',
        isLoggedIn: false
    };

    if(localStorageData){
        try{
            persistendState = JSON.parse(localStorageData);
            apiCalls.setAuthorizationHeader(persistendState);
        } catch (error){

        }
    }

    const middleware = addLogger ? applyMiddleware(thunk ,logger) : applyMiddleware(thunk)
    const store = createStore(authReducer, persistendState, middleware);
    store.subscribe(() => {
        localStorage.setItem('com-auth', JSON.stringify(store.getState()));
        apiCalls.setAuthorizationHeader(store.getState())
    })
    return store;
}

export default configureStore;