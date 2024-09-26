import React from 'react';
import AppContext from '../lib/app-context';

export default class Navbar extends React.Component {
  render() {
    const { handleSignOut } = this.context;
    const { title } = this.props;
    return (
      <div className="row">
        <div className="nav-bar">
          <a href="#"><i className="fas fa-home"></i></a>
          <h2 className="nav-title">{title}</h2>
          <i className="fas fa-sign-out-alt cursor-poiter" onClick={handleSignOut}></i>
        </div>
      </div>
    );
  }
}
Navbar.contextType = AppContext;
