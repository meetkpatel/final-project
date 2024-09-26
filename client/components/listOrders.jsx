import React from 'react';

function GetItem(props) {

  return (
    <div className="column-full order-qty-name-div ">
      <h3>x{props.item.quantity}</h3>
      <h3>{props.item.itemName}</h3>
    </div>
  );
}

function Item(props) {
  function orderClick() {
    return props.orderClicked(props.item);
  }
  return (
    <div className="column-one-third justify-center-only">
      <div className={(props.item.orderStatus === 'Received') ? 'order-div order-div-orange' : 'order-div order-div-green'}onClick={orderClick}>
        <div className="column-full order-table-order-div">
          <h2>Table No: {props.item.tableNumber}</h2>
          <h2>#{props.item.orderId}</h2>
        </div>
        {
            props.item.items.map((item, index) => {
              return <GetItem key={index} item={item} />;
            })
        }
        <div className="column-full order-table-order-div">
          <h3>Note: {props.item.orderNote}</h3>
        </div>
      </div>
    </div>
  );
}

function ListOrders(props) {
  if (!props.ordersFetch[0]) {
    return (
      <>
        <div className="column-full justify-center-only">
          <h3>No orders has been submitted yet</h3>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="column-full justify-center-only">
          <div className="cust-orders-div ">
            <div className="row">
              {
                props.ordersFetch.map((item, index) => {
                  return <Item key={index} item={item} orderClicked={props.orderClicked} />;
                })
              }
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ListOrders;
