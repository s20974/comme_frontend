import React from "react";
import { fireEvent, render, waitForDomChange, waitForElement } from "@testing-library/react";
import { LoginPage } from "./LoginPage";

describe('LoginPage', () => { 
    describe('Layout', () => { 
        it('has header of Login', () => {
            const {container} = render(<LoginPage/>);
            const header = container.querySelector('h1');

            expect(header).toHaveTextContent('Login');
        })

        it('has input for username', () => {
            const {queryByPlaceholderText} = render(<LoginPage/>);
            const usernameInput = queryByPlaceholderText('Your Name');
            expect(usernameInput).toBeInTheDocument();
        })

        it('has input for passwor', () => {
            const {queryByPlaceholderText} = render(<LoginPage/>);
            const passwordInput = queryByPlaceholderText('Your Password');
            expect(passwordInput).toBeInTheDocument()
        })

        it('has password type for password input', () => {
            const { queryByPlaceholderText } = render(<LoginPage />);
            const passwordInput = queryByPlaceholderText('Your Password');
            expect(passwordInput.type).toBe('password');
        });

        it('has login button', () => {
            const { container } = render(<LoginPage />);
            const button = container.querySelector('button');
            expect(button).toBeInTheDocument();
        });
     })

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
                }, 300);
            })
        })
    }

    let usernameInput, passwordInput, button;

    const setupForSubmit = (props) => {
        const rendered = render(<LoginPage {...props}></LoginPage>);

        const {container, queryByPlaceholderText} = rendered;

        usernameInput = queryByPlaceholderText('Your Name');
        fireEvent.change(usernameInput, changeEvent('my-user-name'));
        passwordInput = queryByPlaceholderText('Your Password');
        fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
        button = container.querySelector('button');

        return rendered;
    }

    describe('Interactions', () => {
        it('sets the username value into state', () => {
            const { queryByPlaceholderText } = render(<LoginPage/>);
            const usernameInput = queryByPlaceholderText('Your Name');
            fireEvent.change(usernameInput, changeEvent('my-user-name'));
            expect(usernameInput).toHaveValue('my-user-name')
        })

        it('sets the password value into state', () => {
            const { queryByPlaceholderText } = render(<LoginPage/>)
            const passwordInput = queryByPlaceholderText('Your Password')
            fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
            expect(passwordInput).toHaveValue('P@ssw0rd');
        })

        it('calls postLogin when the actions are provided in props and input filed have value', () => {
            const actions = {
                postLogin: jest.fn().mockResolvedValue({})
            }

            setupForSubmit({actions})
            fireEvent.click(button);
            expect(actions.postLogin).toHaveBeenCalledTimes(1);
        })

        it('does not throw exception when dont provided actions', () => {
            setupForSubmit();
            expect(() => fireEvent.click(button)).not.toThrow();
        })

        it('calls postLogin with credentials in body', () => {
            const actions = {
                postLogin: jest.fn().mockResolvedValue({})
            };
            setupForSubmit({actions});
            fireEvent.click(button);
            const userObject = {
                username: 'my-user-name',
                password: 'P@ssw0rd'
            };

            expect(actions.postLogin).toHaveBeenCalledWith(userObject);
        })

        it('enables the button when username and password is not empty', () => {
            setupForSubmit();
            expect(button).not.toBeDisabled();
        })

        it('disables the button when username is empty', () => {
            setupForSubmit();
            fireEvent.change(usernameInput, changeEvent(''));
            expect(button).toBeDisabled();
        })

        it('disables the button when password is empty', () => {
            setupForSubmit();
            fireEvent.change(passwordInput, changeEvent(''));
            expect(button).toBeDisabled();
        })

        it('displays alert when login fails', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            message: 'Login failed'
                        }
                    }
                })
            };

            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            const alert = await waitForElement(() => queryByText('Login failed'));
            expect(alert).toBeInTheDocument();
        })

        it('clears alert when user changes username', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            message: 'Login failed'
                        }
                    }
                })
            };

            const {queryByText} = setupForSubmit({actions})
            fireEvent.click(button)

            await waitForElement(() => queryByText('Login failed'));
            fireEvent.change(usernameInput, changeEvent('updated-username'));

            const alert = queryByText('Login failed');
            expect(alert).not.toBeInTheDocument();
        })

        
        it('clears alert when user changes password', async () => {
            const actions = {
                postLogin: jest.fn().mockRejectedValue({
                    response: {
                        data: {
                            message: 'Login failed'
                        }
                    }
                })
            };

            const {queryByText} = setupForSubmit({actions})
            fireEvent.click(button)

            await waitForElement(() => queryByText('Login failed'));
            fireEvent.change(passwordInput, changeEvent('updated-P@ssw0rd'));

            const alert = queryByText('Login failed');
            expect(alert).not.toBeInTheDocument();
        })

        it('does not allow user to click the Login button when there is an ongoing api call', () => {
            const actions = {
                postLogin: mockAsyncDelayed()
            };
            setupForSubmit({actions});
            fireEvent.click(button);
            fireEvent.click(button);
            expect(actions.postLogin).toHaveBeenCalledTimes(1);
        })

        it('displays spinner when there is an ongoing api call', () => {
            const actions = {
                postLogin: mockAsyncDelayed()
            };
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button);

            const spinner = queryByText('Loading...');
            expect(spinner).toBeInTheDocument();
        })

        it('hides spinner after api call finishes successfully', async () => {
            const actions = {
                postLogin: mockAsyncDelayed()
            }
            const { queryByText } = setupForSubmit({actions});
            fireEvent.click(button);

            await waitForDomChange();

            const spinner = queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();
        })

        it('hides spinner after api call finishes with error', async () => {
            const actions = {
                postLogin: jest.fn().mockImplementation(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            reject({
                                response: {
                                    data: {}
                                }
                            })
                        }, 300)
                    })
                })
            }
            const {queryByText} = setupForSubmit({actions});
            fireEvent.click(button)

            await waitForDomChange();

            const spinner = queryByText('Loading...');
            expect(spinner).not.toBeInTheDocument();
        })

        it('redirect to homePage after successful login', async () => {
            const actions = {
                postLogin: jest.fn().mockResolvedValue({})
            }
            const history = {
                push: jest.fn()
            }
            setupForSubmit({actions, history})
            fireEvent.click(button)

            await waitForDomChange();

            expect(history.push).toHaveBeenCalledWith('/')
        })
    })
 })

 console.error = () => {};