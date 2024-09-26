import React from 'react';

function Item(props) {

  return (
    <div className="categoty-entries-div">
      <h3>{props.item.userName}</h3>
      <a href={`#tables?userId=${props.item.userId}`}>
        <i className="fas fa-utensils wait-i"></i>
      </a>
    </div>
  );
}

function ListWaitList(props) {
  if (!props.waitListFetch[0]) {
    return (
      <>
        <div className="column-full justify-center-only">
        <h3>No guest added to waitlist</h3>
      </div>
      </>
    );
  } else {
    return (
    <>
      {
        props.waitListFetch.map((item, index) => {
          return <Item key={index} item={item} />;
        })
      }
    </>
    );
  }
}

export default ListWaitList;
