import React from 'react';
import ReactDOM from 'react-dom';
import {UserSignupPage} from './pages/UserSignupPage';
import {LoginPage} from "./pages/LoginPage";
import * as apiCalls from "./api/apiCalls";

const actions = {
  postSignup: apiCalls.signup
}

ReactDOM.render(
  <LoginPage/>,
  document.getElementById('root')
);
