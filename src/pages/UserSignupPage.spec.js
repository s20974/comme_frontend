import React from "react";
import { render, fireEvent, waitForDomChange, waitForElement } from "@testing-library/react";
import {UserSignupPage} from './UserSignupPage';

describe('UserSignupPage', () => {


    describe('Layout', () => {
        it('has header of Sign Up', () => {
            const { container } = render(<UserSignupPage/>);
            const header = container.querySelector('h1');
            expect(header).toHaveTextContent('Sign Up');
        })
        it('has input for name', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const nameInput = queryByPlaceholderText('Your Name');
            expect(nameInput).toBeInTheDocument();
        })
        it('has input for surname', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const surnameInput = queryByPlaceholderText('Your Surname');
            expect(surnameInput).toBeInTheDocument();
        })
        it('has input for password', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const passwordInput = queryByPlaceholderText('Your Password');
            expect(passwordInput).toBeInTheDocument();
        })
        it('has password type for password input', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const passwordInput = queryByPlaceholderText('Your Password');
            expect(passwordInput.type).toBe('password');
        })
        it('has input for password repeat', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const passwordRepeatInput = queryByPlaceholderText('Repeat Password');
            expect(passwordRepeatInput).toBeInTheDocument();
        })
        it('has password type for repeat password input', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const passwordRepeatInput = queryByPlaceholderText('Your Password');
            expect(passwordRepeatInput.type).toBe('password');
        })
        it('has submit button', () => {
            const { container } = render(<UserSignupPage/>);
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        })
    })

    describe('Interactions', () => {
        const changeEvent = (content) => {
            return {
                target: {
                    value: content
                }
            };
        };

        const mockAsyncDelayed = () => {
            return jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({});
                    }, 300)
                })
            })
        }

        let button, nameInput, surnameInput, passwordInput, passwordRepeatInput;

        const setupForSubmit = (props) => {
            const rendered = render(
                <UserSignupPage {...props}/>
            );

            const {container, queryByPlaceholderText} = rendered;

            nameInput = queryByPlaceholderText('Your Name');
            surnameInput = queryByPlaceholderText('Your Surname');
            passwordInput = queryByPlaceholderText('Your Password');
            passwordRepeatInput = queryByPlaceholderText('Repeat Password');

            fireEvent.change(nameInput, changeEvent('my-name'));
            fireEvent.change(surnameInput, changeEvent('my-surname'));
            fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
            fireEvent.change(passwordRepeatInput, changeEvent('P@ssw0rd'));

            button = container.querySelector('button');

            return rendered;
        }


        it('set the name value into state', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const nameInput = queryByPlaceholderText('Your Name');

            fireEvent.change(nameInput, changeEvent('my-name'));

            expect(nameInput).toHaveValue('my-name');
        })

        it('set the surname value into state', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const surnameInput = queryByPlaceholderText('Your Surname');

            fireEvent.change(surnameInput, changeEvent('my-surname'));

            expect(surnameInput).toHaveValue('my-surname');
        })

        it('set the password value into state', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const passwordInput = queryByPlaceholderText('Your Password');

            fireEvent.change(passwordInput, changeEvent('my-password'));

            expect(passwordInput).toHaveValue('my-password');
        })
    
        it('set the password repeat value into state', () => {
            const { queryByPlaceholderText } = render(<UserSignupPage/>);
            const passwordRepeatInput = queryByPlaceholderText('Repeat Password');

            fireEvent.change(passwordRepeatInput, changeEvent('my-repeat-password'));

            expect(passwordRepeatInput).toHaveValue('my-repeat-password');
        })

        it('calls postSignup when the fields are valid and the actions are provided in props', () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            }
            setupForSubmit({actions});
            fireEvent.click(button);
            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        })

        it('does not throw exception when clicking the button when actions not provided in props', () => {
            const {container, queryByPlaceholderText} = setupForSubmit();
            expect(() => fireEvent.click(button)).not.toThrow();
        
        })

        it('calls post with user body when the fields are valid', () => {
            const actions = {
                postSignup: jest.fn().mockResolvedValueOnce({})
            }
            setupForSubmit({actions});
            fireEvent.click(button);
            const expectedUserObject = {
                username: 'my-name',
                surname: 'my-surname',
                password: 'P@ssw0rd'
            }
            expect(actions.postSignup).toHaveBeenCalledWith(expectedUserObject);
        })

        xit('does not allow user to click the Sign Up button when there is an ongoing api call', () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            }
            setupForSubmit({actions});
            fireEvent.click(button);
            fireEvent.click(button);
            expect(actions.postSignup).toHaveBeenCalledTimes(1);
        })

        xit('display spinner where there is on ongoing api call', () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            const spinner = queryByText('Loading...');
            expect(spinner).toBeInTheDocument();
        })

        it('hide spinner after api call finishes successfully', async () => {
            const actions = {
                postSignup: mockAsyncDelayed()
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            await waitForDomChange();

            const spinner = queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();
        })

        it('hide spinner after api call finishes with error', async () => {
            const actions = {
                postSignup: jest.fn().mockImplementation(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            reject({
                                response: {
                                    data: {
                                    }
                                }
                            });
                        }, 300)
                    })
                })
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            await waitForDomChange();

            const spinner = queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();
        })

        it('display validation error for displayName when error is received for the field', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                username: 'Cannot be null'
                            }
                        }
                    }
                })
            }

            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);
            
            const errorMessage = await waitForElement(() => queryByText('Cannot be null'));
            expect(errorMessage).toBeInTheDocument();
        })

        it('enable the signup button when password and repeat password have same value', () => {
            setupForSubmit();
            expect(button).not.toBeDisabled();
        })

        it('disable the signup button when password and repeat password dont have same value', () => {
            setupForSubmit();
            fireEvent.change(passwordRepeatInput, changeEvent('new-pass'));
            expect(button).toBeDisabled();
        })

        it('disable the signup button when password dont match to password repeat', () => {
            setupForSubmit();
            fireEvent.change(passwordInput, changeEvent('new-pass'));
            expect(button).toBeDisabled();
        })

        it('dispaly error style for password repeat input when password repeat mismatch', () => {
            const {queryByText} = setupForSubmit();
            fireEvent.change(passwordRepeatInput, changeEvent('new-pass'));
            const mismatchWatching = queryByText('Does not match to password')
            expect(mismatchWatching).toBeInTheDocument();
        })

        it('dispaly error style for password repeat input when password input mismatch', () => {
            const {queryByText} = setupForSubmit();
            fireEvent.change(passwordInput, changeEvent('new-pass'));
            const mismatchWatching = queryByText('Does not match to password')
            expect(mismatchWatching).toBeInTheDocument();
        })

        it('hider the validation error when user changes the content of name', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                username: 'Cannot be null'
                            }
                        }
                    }
                })
            }

            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);
            
            await waitForElement(() => queryByText('Cannot be null'));
            fireEvent.change(nameInput, changeEvent('name updated'));

            const errorMessage = queryByText('Cannot be null');
            expect(errorMessage).not.toBeInTheDocument();
        })

        it('hider the validation error when user changes the content of surname', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                surname: 'Surname cannot be null'
                            }
                        }
                    }
                })
            }

            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);
            
            await waitForElement(() => queryByText('Surname cannot be null'));
            fireEvent.change(surnameInput, changeEvent('name updated'));

            const errorMessage = queryByText('Surname cannot be null');
            expect(errorMessage).not.toBeInTheDocument();
        })

        it('hider the validation error when user changes the content of surname', async () => {
            const actions = {
                postSignup: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            validationErrors: {
                                password: 'Password cannot be null'
                            }
                        }
                    }
                })
            }

            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);
            
            await waitForElement(() => queryByText('Password cannot be null'));
            fireEvent.change(passwordInput, changeEvent('password-updated'));

            const errorMessage = queryByText('Password cannot be null');
            expect(errorMessage).not.toBeInTheDocument();
        })
    })
});

console.error = () => {};