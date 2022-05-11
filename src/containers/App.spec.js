import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

const setup = (path) => {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <App/>
        </MemoryRouter>
    )
}

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
 })