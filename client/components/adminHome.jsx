import React from 'react';
import Navbar from '../components/navbar';

export default class AdminHome extends React.Component {

  render() {
    return (
      <>
      <Navbar title={'Home'}/>
      <div className="row">
        <div className="column-full home-flex ">
          <a href="#admin-menu">
            <div className="menu-div">
              <i className="fas fa-utensils menu-i-tag"></i>
            <h3>Menu</h3>
            </div>
          </a>

          <a href="#waitlist">
            <div className="menu-div">
              <i className="fas fa-users  menu-i-tag" ></i>
              <h3>Waitlist</h3>
            </div>
          </a>

          <a href="#admin-orders">
            <div className="menu-div">
                <i className="fas fa-clipboard-list  menu-i-tag" ></i>
              <h3>Orders</h3>
            </div>
          </a>
        </div>
      </div>
      </>
    );
  }
}
