import React from 'react';
import AppContext from '../lib/app-context';
import Navbar from '../components/navbar';
import ListCategoryDropDown from '../components/listCategoryDropDown';
import Redirect from '../components/redirect';
import NotFound from './not-found';

export default class AddItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryselect: '',
      itemName: '',
      itemPrice: '',
      itemDesc: '',
      itemImg: 'https://finalprojectmeet.s3.us-west-1.amazonaws.com/blank.jpeg',
      categoryFetch: [],
      isLoading: true,
      spinner: false
    };
    this.fileInputRef = React.createRef();
    this.handleImgChange = this.handleImgChange.bind(this);
    this.handleCateChange = this.handleCateChange.bind(this);
    this.handleItemNameChange = this.handleItemNameChange.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.handleDescChange = this.handleDescChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch('/api/get/category')
      .then(res => res.json())
      .then(result => {
        this.setState({ categoryFetch: result, isLoading: false });
      });
  }

  handleImgChange(event) {

    this.setState({
      itemImg: URL.createObjectURL(event.target.files[0])
    });
  }

  handleCateChange(event) {
    const catid = event.target.value;
    this.setState({ categoryselect: catid });
  }

  handleItemNameChange(event) {
    this.setState({ itemName: event.target.value });
  }

  handlePriceChange(event) {
    this.setState({ itemPrice: event.target.value });
  }

  handleDescChange(event) {
    this.setState({ itemDesc: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ spinner: true });
    const formData = new FormData();
    formData.append('image', this.fileInputRef.current.files[0]);
    formData.append('categoryselect', this.state.categoryselect);
    formData.append('itemName', this.state.itemName);
    formData.append('itemPrice', this.state.itemPrice);
    formData.append('itemDesc', this.state.itemDesc);

    fetch('/api/add/fooditem', {
      method: 'POST',
      body: formData
    })
      .then(result => result.json())
      .then(itemData => {
        this.fileInputRef.current.value = null;
        const urlchange = { to: 'admin-menu' };
        Redirect(urlchange);
      });
  }

  render() {
    if (!this.context.user) {
      return <Redirect to="sign-in" />;
    }
    if (this.context.user.userRole === 'Customer') {
      return <NotFound />;
    }
    const { handleImgChange, handleCateChange, handleItemNameChange, handlePriceChange, handleDescChange, handleSubmit } = this;
    if (this.state.isLoading) {
      return (
        <p>loading</p>
      );
    } else {
      return (
        <>
          <Navbar title={'Add Items'} />
          <div className="row">

          <div className="column-full justify-center-only">
            <form className="form-elements" onSubmit={handleSubmit}>
              <div className="row">
                <div className="column-half">
                  <img src={this.state.itemImg} id="imageDisplay" alt="Journal Image"></img>
                  <input
                    required
                    type="file"
                    name="image"
                    ref={this.fileInputRef}
                    onChange={handleImgChange}
                    accept=".png, .jpg, .jpeg, .gif" />
                </div>
                <div className="column-half">
                  <div>
                      <select className="custom-input" name="category-selected" id="category-selected" onChange={handleCateChange}>
                      {<ListCategoryDropDown categoryFetch={this.state.categoryFetch} />}
                      </select>
                  </div>
                  <div >
                      <input type="text" placeholder="Add Item Name" className="custom-input" id="itemname" name="itemname" onChange={handleItemNameChange} required></input>
                  </div>
                  <div >
                      <input type="text" placeholder="Add Item Price" className="custom-input" id="itemprice" name="itemprice" onChange={handlePriceChange} required></input>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="column-full">
                    <textarea placeholder="Add item description" rows="4" className="desc" onChange={handleDescChange}></textarea>
                </div>
              </div>
              <div className="row">
                <div className="column-full justify-end">
                  <button type="submit" className="btn-add-item">Add Item</button>
                </div>
              </div>
            </form>
            </div>
          </div>
          <div className={(this.state.spinner) ? 'row' : 'row hidden'}>
            <div className="column-full spinner-div">
              <div className="spinner-svg-div justify-center">
            <img src="https://finalprojectmeet.s3.us-west-1.amazonaws.com/spinner.svg" alt="" />
            </div>
          </div>
          </div>
        </>
      );
    }
  }
}

AddItem.contextType = AppContext;
