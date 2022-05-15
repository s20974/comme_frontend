import React from "react";
import Input from "../components/Input";
import ButtonWithProgress from "../components/ButtonWithProgress";
import { connect } from "react-redux";
import * as authActions from '../redux/authActions';

export class UserSignupPage extends React.Component {

    state = {
        username: '',
        surname: '',
        password: '',
        passwordRepeat: '',
        pendingApiCall: false,
        errors: {},
        passwordRepeatConfirmed: true
    };

    onChangeName = (event) => {  
        const value = event.target.value;
        const errors = {...this.state.errors};
        delete errors.username;
        this.setState({username: value, errors});
    };

    onChangeSurname = (event) => {  
        const value = event.target.value;
        const errors = {...this.state.errors};
        delete errors.surname;
        this.setState({surname: value, errors});
    };

    onChangePassword = (event) => {  
        const value = event.target.value;
        const passwordRepeatConfirmed = this.state.passwordRepeat === value;
        const errors = {...this.state.errors};
        delete errors.password;
        errors.passwordRepeat = passwordRepeatConfirmed ? '' : 'Does not match to password';
        this.setState({password: value, passwordRepeatConfirmed, errors});
    };

    onChangePasswordRepeat = (event) => {  
        const value = event.target.value;
        const passwordRepeatConfirmed = this.state.password === value;
        const errors = {...this.state.errors};
        errors.passwordRepeat = passwordRepeatConfirmed ? '' : 'Does not match to password';
        this.setState({passwordRepeat: value, passwordRepeatConfirmed, errors});
    };

    onClickSignup = () => {
        const user = {
            username: this.state.username,
            surname: this.state.surname,
            password: this.state.password
        }
        this.setState({pendingApiCall: true})
        this.props.actions.postSignup(user).then(
            (response) => {
                this.setState({ pendingApiCall: false }, 
                () => this.props.history.push('/'));
            }
        ).catch((apiError) => {
                let errors = {...this.state.errors}
                if(apiError.response.data && apiError.response.data.validationErrors){
                    errors = {...apiError.response.data.validationErrors}
                }
                this.setState({pendingApiCall: false, errors});
            }
        );
    }

    render(){
        return(
            <div className="container">
                <h1 className="text-center">Sign Up</h1>
                <div className="col-12 mb-3">
                    <Input 
                        label="Name"
                        placeholder = "Your Name" 
                        value = {this.state.username}
                        onChange = {this.onChangeName}
                        hasError={this.state.errors.username && true}
                        error={this.state.errors.username}
                    />
                </div>
                <div className="col-12 mb-3">
                    <Input 
                        label="Surname"
                        className="form-control"
                        placeholder="Your Surname"
                        value = {this.state.surname}
                        onChange = {this.onChangeSurname}
                        hasError={this.state.errors.surname && true}
                        error={this.state.errors.surname}
                    />
                </div>
                <div className="col-12 mb-3">
                    <Input 
                        label="Password"
                        className="form-control"
                        placeholder="Your Password" 
                        type="password"
                        value = {this.state.password}
                        onChange = {this.onChangePassword}
                        hasError={this.state.errors.password && true}
                        error={this.state.errors.password}
                    />
                </div>
                <div className="col-12 mb-3">
                    <Input 
                        label="Repeat Password"
                        className="form-control"
                        placeholder="Repeat Password" 
                        type="password"
                        value = {this.state.passwordRepeat}
                        onChange = {this.onChangePasswordRepeat}      
                        hasError={this.state.errors.passwordRepeat && true}
                        error={this.state.errors.passwordRepeat}     
                    />
                </div>
                <div className="text-center">
                    <ButtonWithProgress onClick={this.onClickSignup} 
                                        disabled={this.state.pendingApiCall || !this.state.passwordRepeatConfirmed}
                                        pendingApiCall={this.state.pendingApiCall}
                                        text="Sign Up">

                    </ButtonWithProgress>
                </div>
            </div>
        )
    }
}

UserSignupPage.defaultProps = {
    actions: {
        postSignup: () => 
        new Promise((resolve, reject) => {
            resolve({});
        })
    },
    history: {
        push: () => {}
    }
}

const mapDispatchToProps  = dispatch => {
    return {
        actions: {
            postSignup: (user) => dispatch(authActions.loginHandler(user))
        }
    }
}

export default connect(null, mapDispatchToProps)(UserSignupPage);