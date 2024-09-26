import React from 'react';

function Item(props) {
  function handleClick() {
    return props.itemClicked(props.item);
  }
  return (
    <div className="column-half">
      <div className="food-item-div" onClick={handleClick}>
        <img src={'https://finalprojectmeet.s3.us-west-1.amazonaws.com/' + props.item.itemImg} className="item-img-class" alt="" />
        <div className="row width-full">
          <div className="column-full name-price-div">
            <h2>{props.item.itemName}</h2>
            <h3><span className="price-span">${props.item.itemPrice}</span></h3>
          </div>
          <div className="column-full">
            <h4>{props.item.itemDescription}</h4>
          </div>

        </div>
      </div>
    </div>
  );
}

function Cate(props) {
  return (
    <div className="column-full margin-half-rem">
      <h1>{props.item.categoryName}</h1>
      <div className="row">
        {
          props.item.items.map((item, index) => {
            return <Item key={index} item={item} itemClicked={props.itemClicked}/>;
          })
        }
      </div>
    </div>
  );
}

function RenderCustMenu(props) {
  if (!props.menuList[0]) {
    return (
      <>
        <div className="column-full justify-center-only">
          <h3>No food item added to menu yet</h3>
        </div>
      </>
    );
  } else {
    return (
    <div className="row">

      {
        props.menuList.map(item => {
          return <Cate key={item.categoryId} item={item} itemClicked={props.itemClicked}/>;
        })
      }
    </div>
    );
  }
}
export default RenderCustMenu;
