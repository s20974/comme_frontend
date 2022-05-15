import React from "react";
import Input from "../components/Input";
import ButtonWithProgress from "../components/ButtonWithProgress";
import { connect } from "react-redux";
import * as authActions from "../redux/authActions";

export class LoginPage extends React.Component{
    state = {
        username: '',
        password: '',
        errors: undefined,
        pendingApiCall: false
    }

    onChangeName = (event) => {  
        const value = event.target.value;
        this.setState({username: value, errors: undefined});
    };

    onChangePassword = (event) => {  
        const value = event.target.value;
        this.setState({password: value, errors: undefined});
    };

    onClickLogin = () => {
        const user = {
            username: this.state.username,
            password: this.state.password
        }
        
        this.setState({pendingApiCall: true});

        this.props.actions.postLogin(user)
        .then((response) => {
            this.setState({pendingApiCall: false}, () => {
                this.props.history.push('/')
            });
        })
        .catch((error) => {
            if(error.response){
                this.setState({
                    errors: error.response.data.message,
                    pendingApiCall: false
                })
            }
        });
    }

    render(){
        let disableSubmit = false;
        if(this.state.username === ''){
            disableSubmit = true;
        }
        if(this.state.password === ''){
            disableSubmit = true;
        }
        return(
            <div className="container">
                <h1 className="text-center">Login</h1>
                <div className="col-12 mb-3">
                    <Input 
                        label="Name"
                        placeholder = "Your Name" 
                        value={this.state.username}
                        onChange={this.onChangeName}
                    />
                </div>
                <div className="col-12 mb-3">
                    <Input 
                        label="Password"
                        placeholder = "Your Password" 
                        type="password"
                        value={this.state.password}
                        onChange={this.onChangePassword}
                    />
                </div>
                {
                    this.state.errors && (
                        <div className="col-12 mb-3">
                            <div className="alert alert-danger">
                                {this.state.errors}
                            </div>
                        </div>
                    )
                }

                <div className="text-center">
                    <ButtonWithProgress onClick={this.onClickLogin} 
                                        disabled={disableSubmit || this.state.pendingApiCall}
                                        pendingApiCall={this.state.pendingApiCall}
                                        text="Login"/>
                </div>
            </div>
        )
    }
}

LoginPage.defaultProps = {
    actions: {
        postLogin: () => new Promise((resolve, reject) => resolve({}))
    },
    dispatch: () => {}
}

const mapDispatchToProps  = dispatch => {
    return {
        actions: {
            postLogin: (user) => dispatch(authActions.loginHandler(user))
        }
    }
}

export default connect(null, mapDispatchToProps)(LoginPage);