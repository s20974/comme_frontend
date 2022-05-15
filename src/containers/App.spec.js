import React from "react";
import { render, fireEvent, waitForDomChange, waitForElement } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import axios from "axios";
import configureStore from "../redux/configureStore";

beforeEach(() => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization']
})

const setup = (path) => {
    const store = configureStore(false);
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <App/>
            </MemoryRouter>
        </Provider>
    )
}
const changeEvent = (content) => {
    return {
        target: {
            value: content
        }
    };
};

describe('App', () => { 
    it('display home page when url is /', () => {
        const { queryByTestId } = setup('/');
        expect(queryByTestId('homepage')).toBeInTheDocument();
    })

    it('display login when url is /login', () => {
        const { container } = setup('/login');
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Login');
    })

    it('display only login when url is /login', () => {
        const { queryByTestId } = setup('/login');
        expect(queryByTestId('homepage')).not.toBeInTheDocument();
    })

    it('display signup when url is /signup', () => {
        const { container } = setup('/signup');
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Sign Up');
    })

    it('display userpage when url is other than /, /login, /signup', () => {
        const { queryByTestId } = setup('/user1');
        expect(queryByTestId('userpage')).toBeInTheDocument();
    })

    it('display topBar when url is /', () => {
        const { container } = setup('/');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    })

    it('display topBar when url is /login', () => {
        const { container } = setup('/login');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    })

    it('display topBar when url is /signup', () => {
        const { container } = setup('/signup');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    })

    it('display topBar when url is /user1', () => {
        const { container } = setup('/user1');
        const navigation = container.querySelector('nav');
        expect(navigation).toBeInTheDocument();
    })

    it('shows the UserSignupPage when clicking signup', () => {
        const { queryByText, container } = setup('/');
        const signupLink = queryByText('Sign Up');
        fireEvent.click(signupLink);
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Sign Up');
    })

    it('shows the LoginPage when clicking login', () => {
        const { queryByText, container } = setup('/');
        const loginLink = queryByText('Login');
        fireEvent.click(loginLink);
        const header = container.querySelector('h1');
        expect(header).toHaveTextContent('Login');
    })

    it('shows the HomePage when clicking logo', () => {
        const { queryByTestId, container } = setup('/login');
        const logo = container.querySelector('img');
        fireEvent.click(logo);
        const homepage = queryByTestId('homepage');
        expect(homepage).toBeInTheDocument();
    })

    it('display My Profile after login success', async () => {
        const {queryByText, container, queryByPlaceholderText} = setup('/login');
        const usernameInput = queryByPlaceholderText('Your Name');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your Password');
        fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
        const button = container.querySelector('button');

        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                surname: 'user1',
                image: 'progile1.png'
            }
        })
        fireEvent.click(button);
        
        const myProfileLink = await waitForElement(() => queryByText('My Profile'));
        expect(myProfileLink).toBeInTheDocument()
    })

    it('display My Profile after signup success', async () => {
        const {queryByText, container, queryByPlaceholderText} = setup('/signup');

        const nameInput = queryByPlaceholderText('Your Name');
        const surnameInput = queryByPlaceholderText('Your Surname');
        const passwordInput = queryByPlaceholderText('Your Password');
        const passwordRepeatInput = queryByPlaceholderText('Repeat Password');
        const button = container.querySelector('button');

        fireEvent.change(nameInput, changeEvent('my-name232'));
        fireEvent.change(surnameInput, changeEvent('my-surname232'));
        fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
        fireEvent.change(passwordRepeatInput, changeEvent('P@ssw0rd'));

        axios.post = jest.fn().mockResolvedValueOnce({
            data: {
                message: 'User Saved'
            }
        }).mockResolvedValueOnce({
            data: {
                id: 1,
                username: 'my-name232',
                surname: 'my-surname232',
                image: 'profile1.png'
            }
        })

        fireEvent.click(button);
        
        const myProfileLink = await waitForElement(() => queryByText('My Profile'));
        expect(myProfileLink).toBeInTheDocument()
    })

    it('saves user to localstorage after login success', async () => {
        const {queryByText, container, queryByPlaceholderText} = setup('/login');
        const usernameInput = queryByPlaceholderText('Your Name');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your Password');
        fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
        const button = container.querySelector('button');

        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                surname: 'user1',
                image: 'profile1.png'
            }
        })
        fireEvent.click(button);
        
        await waitForElement(() => queryByText('My Profile'));
        const dataInStorage = JSON.parse(localStorage.getItem('com-auth'));
        expect(dataInStorage).toEqual({
            id: 1,
            username: 'user1',
            surname: 'user1',
            image: 'profile1.png',
            password: 'P@ssw0rd',
            isLoggedIn: true
        });
    })

    it('displays logged in topBar when storage has user data', () =>{
        localStorage.setItem('com-auth', JSON.stringify({
            id: 1,
            username: 'user1',
            surname: 'user1',
            image: 'profile1.png',
            password: 'P@ssw0rd',
            isLoggedIn: true
        }));
        const {queryByText} = setup('/');
        const myProfileLink = queryByText('My Profile');
        expect(myProfileLink).toBeInTheDocument();
    })

    it('sets axious authorization with base64 encodec user credentials after login success', async () => {
        const {queryByText, container, queryByPlaceholderText} = setup('/login');
        const usernameInput = queryByPlaceholderText('Your Name');
        fireEvent.change(usernameInput, changeEvent('user1'));
        const passwordInput = queryByPlaceholderText('Your Password');
        fireEvent.change(passwordInput, changeEvent('P@ssw0rd'));
        const button = container.querySelector('button');

        axios.post = jest.fn().mockResolvedValue({
            data: {
                id: 1,
                username: 'user1',
                surname: 'user1',
                image: 'profile1.png'
            }
        })
        fireEvent.click(button);
        
        await waitForElement(() => queryByText('My Profile'));
        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        const encoded = btoa('user1:P@ssw0rd')
        const expectedAuthorization = `Basic ${encoded}`;
        expect(axiosAuthorization).toBe(expectedAuthorization)
    })

    it('sets axious authorization with base64 encodec user credentials when storage has user data', () =>{
        localStorage.setItem('com-auth', JSON.stringify({
            id: 1,
            username: 'user1',
            surname: 'user1',
            image: 'profile1.png',
            password: 'P@ssw0rd',
            isLoggedIn: true
        }));
        setup('/');

        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        const encoded = btoa('user1:P@ssw0rd')
        const expectedAuthorization = `Basic ${encoded}`;
        expect(axiosAuthorization).toBe(expectedAuthorization)
    })
    
    it('remove axious authorization header when user logout', () =>{
        localStorage.setItem('com-auth', JSON.stringify({
            id: 1,
            username: 'user1',
            surname: 'user1',
            image: 'profile1.png',
            password: 'P@ssw0rd',
            isLoggedIn: true
        }));
        const {queryByText} = setup('/');
        fireEvent.click(queryByText('Logout'))

        const axiosAuthorization = axios.defaults.headers.common['Authorization'];
        expect(axiosAuthorization).toBeFalsy();
    })
 })