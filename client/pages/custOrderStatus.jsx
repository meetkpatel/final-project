import React from 'react';
import Navbar from '../components/navbar';

import AppContext from '../lib/app-context';
import Redirect from '../components/redirect';
const { io } = require('socket.io-client');

export default class AdminOrders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ordersFetch: { orderStatus: 'not-found' },
      isLoading: false
    };

  }

  componentDidMount() {
    this.socket = io();
    this.socket.on('order_status', arg => {
      this.setState({ ordersFetch: arg });
    });
    const token = window.localStorage.getItem('react-context-jwt');
    const req = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      body: null
    };
    fetch('/api/fetch-order-status', req)
      .then(res => res.json())
      .then(result => {
        this.setState({ ordersFetch: result, isLoading: false });
      });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    if (!this.context.user) {
      return <Redirect to="sign-in" />;
    }
    if (this.state.isLoading) {
      return (<p>loading</p>);
    } else {
      return (
        <>
          <Navbar title={'Orders'} />
          <div className={(this.state.ordersFetch.orderStatus === 'not-found') ? 'row' : 'row hidden'}>
            <div className="column-full justify-center-only">
              <h3>No order placed yet, please order first</h3>
            </div>
          </div>
          <div className={(this.state.ordersFetch.orderStatus === 'not-found' ? 'row justify-center-only hidden' : 'row justify-center-only')}>
            <div className="order-status-div">
              <div className="column-full justify-center-only">
              <h2>Order No {this.state.ordersFetch.orderId}</h2>
              </div>
              <div className="column-full">
                <div className="status-bar padding-left-right">
                  <div className="status-circle color-change"></div>
                  <div className={(this.state.ordersFetch.orderStatus === 'Received') ? 'vl' : 'vl color-change'}></div>
                  <div className={(this.state.ordersFetch.orderStatus === 'Received') ? 'status-circle ' : 'status-circle color-change'}></div>
                  <div className={(this.state.ordersFetch.orderStatus !== 'finished') ? 'vl' : 'vl color-change'}></div>
                  <div className={(this.state.ordersFetch.orderStatus !== 'finished') ? 'status-circle' : 'status-circle color-change'}></div>
                </div>
                <div className="status-bar">
                  <h3>Received</h3>
                  <h3>Preparing</h3>
                  <h3>Ready</h3>
                </div>
              </div>
              <div className="column-full justify-center-only">
                <img src={changeimg(this.state.ordersFetch.orderStatus)} className="order-status-img" alt="" />
              </div>
            </div>
          </div>
        </>
      );
    }

  }
}
function changeimg(status) {
  if (status === 'Received') {
    return 'https://finalprojectmeet.s3.us-west-1.amazonaws.com/1.png';
  } else if (status === 'preparing') {
    return 'https://finalprojectmeet.s3.us-west-1.amazonaws.com/2.png';
  } else {
    return 'https://finalprojectmeet.s3.us-west-1.amazonaws.com/3.png';
  }
}
AdminOrders.contextType = AppContext;
