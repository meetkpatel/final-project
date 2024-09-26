import React from 'react';
import Navbar from '../components/navbar';
import ListCartItems from '../components/listCartItems';
import AppContext from '../lib/app-context';
import Redirect from '../components/redirect';

export default class AddCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cartItemsFetch: [],
      isLoading: true,
      custNote: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const id = this.context.user.userId;
    const req = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: null
    };
    fetch(`/api/fetch-cart-items/${id}`, req)
      .then(res => res.json())
      .then(result => {
        this.setState({ cartItemsFetch: result, isLoading: false });

      });
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const token = window.localStorage.getItem('react-context-jwt');
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      body: JSON.stringify({
        custNote: this.state.custNote
      })
    };
    fetch('/api/place-order', req)
      .then(res => res.json())
      .then(result => {
        Redirect({ to: '#' });
      });
  }

  render() {
    if (!this.context.user) {
      return <Redirect to="sign-in" />;
    }
    if (this.state.isLoading) {
      return (
        <p>loading</p>
      );
    } else {
      return (
        <>
          <Navbar title={'Cart'} />
          <div className={(this.state.cartItemsFetch[0]) ? 'row hidden' : 'row'}>
            <div className="column-full justify-center-only">
              <h3>Your cart is empty</h3>
            </div>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className={(this.state.cartItemsFetch[0]) ? 'row' : 'row hidden'}>
            <div className="column-full justify-center-only">
              <div className="cart-list-div">
                {<ListCartItems cartItemsFetch={this.state.cartItemsFetch} />}
              </div>
            </div>
            <div className="column-full justify-center-only">
              <div className="cart-list-div justify-center-only">
                <textarea placeholder="Add Note" className="cust-note" name="custNote" onChange={this.handleChange}></textarea>
              </div>
            </div>
            <div className="column-full justify-center-only">
              <div className="cart-btn-div">
                <button type="submit" className="cart-btn">Place Order</button>
              </div>
            </div>
          </div>
          </form>
        </>
      );
    }

  }
}
AddCategory.contextType = AppContext;
