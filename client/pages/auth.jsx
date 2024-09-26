import React from 'react';
import Redirect from '../components/redirect';
import AppContext from '../lib/app-context';

export default class AuthPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobile: '',
      password: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);

  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.handleLogin();
  }

  handleLogin() {
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    };

    fetch('/api/auth/sign-in', req)
      .then(res => res.json())
      .then(result => {

        if (result.user && result.token) {
          this.context.handleSignIn(result);
        }
      });
  }

  render() {
    const { user } = this.context;
    const { handleChange, handleSubmit, handleLogin } = this;
    if (user) return <Redirect to="" />;

    return (
      <div className="row">
        <div className="login-div justify-center">
          <form className="form-class " onSubmit={handleSubmit}>
            <div className="column-full">
              <input
                required
                autoFocus
                id="mobile"
                type="text"
                name="mobile"
                placeholder="Enter Your Mobile No"
                onChange={handleChange}
                className="form-control bg-light" />
            </div>
            <div className="column-full">
              <input
                required
                id="password"
                type="password"
                name="password"
                placeholder="Enter Your Password"
                onChange={handleChange}
                className="form-control bg-light" />
            </div>
            <div className="column-full justify-center-only">
              <button type="submit" className="submit-btn">
                Login
              </button>
            </div>
            <div className="column-full justify-center-only">
              <button className="admin-demo-btn" onMouseEnter={() => this.setState({ mobile: '111', password: '123' })} onClick={handleLogin}>
                Admin Demo Login
              </button>
            </div>
            <div className="column-full justify-center-only">
              <button className="cust-demo-btn" onMouseEnter={() => this.setState({ mobile: '222', password: '123' })} onClick={handleLogin}>
                Customer Demo Login
              </button>
            </div>
            {/*
             */}
        </form>
      </div>
      </div>
    );
  }
}
AuthPage.contextType = AppContext;
