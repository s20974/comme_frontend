import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { LoginPage } from "./LoginPage";

describe('LoginPage', () => { 
    describe('Layout', () => { 
        it('has header of Login', () => {
            const {container} = render(<LoginPage/>);
            const header = container.querySelector('h1');

            expect(header).toHaveTextContent('Login');
        })
     })

     const changeEvent = (content) => {
        return {
            target: {
                value: content
            }
        };
    };

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
     })
 })