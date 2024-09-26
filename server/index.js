require('dotenv/config');
const pg = require('pg');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const express = require('express');
const ClientError = require('./client-error');
const errorMiddleware = require('./error-middleware');
const staticMiddleware = require('./static-middleware');
const uploadsMiddleware = require('./uploads-middleware');
const authorizationMiddleware = require('./authorization-middleware');
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require('twilio')(accountSid, authToken);

const { createServer } = require('http');
const { Server } = require('socket.io');

function sendSMS(code, custName, custNumber, tableNumber) {
  client.messages
    .create({
      to: `+1${custNumber}`,
      from: '+12674353506',
      body: `Hello ${custName}, your table number is ${tableNumber} use your mobile number and code ${code} to login`
    });
}

function randomPassword() {
  return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
}

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const jsonMiddleware = express.json();
app.use(jsonMiddleware);

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.post('/api/auth/sign-in', (req, res, next) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    throw new ClientError(401, 'invalid login');
  }
  const sql = `
    select *
      from "users"
     where "userNumber" = $1
  `;
  const params = [mobile];
  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        throw new ClientError(401, 'invalid login');
      }
      const { userId, userNumber, userPassword, userRole } = user;
      return argon2
        .verify(userPassword, password)
        .then(isMatching => {
          if (!isMatching) {
            throw new ClientError(401, 'invalid login');
          }
          const payload = { userId, userNumber, userRole };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        });
    })
    .catch(err => next(err));
});

app.get('/api/get/category', (req, res, next) => {
  const sql = 'select * from "category"';
  db.query(sql)
    .then(result => {
      const cateResult = result.rows;
      res.json(cateResult);
    })
    .catch(err => next(err));
});

app.get('/api/get/waitlist', (req, res, next) => {
  const sql = 'select * from "waitlist"';
  db.query(sql)
    .then(result => {
      const waitListResult = result.rows;
      res.json(waitListResult);
    })
    .catch(err => next(err));
});

app.get('/api/get/tables', (req, res, next) => {
  const sql = `select * from "tables"
              order by "tableNumber" asc`;
  db.query(sql)
    .then(result => {
      const tableListResult = result.rows;
      res.json(tableListResult);
    });
});

app.put('/api/table/:id', (req, res, next) => {
  const tableNumber = parseInt(req.params.id, 10);
  const sql = `update "tables"
      set     "userId" = $1
      where   "tableNumber" = $2
      returning *`;
  const params = [null, tableNumber];
  db.query(sql, params)
    .then(result => {
      const updatedRow = result.rows[0];
      res.json(updatedRow);
    })
    .catch(err => next(err));
});

app.put('/api/table-assign/:id', (req, res, next) => {
  const tableNumberfetch = parseInt(req.params.id, 10);
  const { custId } = req.body;
  const sql = `with "delCustomer" as (
      delete from "waitlist"
      where "userId" = $1
      returning "userId"
      )
      update "tables" set "userId" = (select "userId" from "delCustomer")
      where "tableNumber" = $2
      returning *`;
  const params = [custId, tableNumberfetch];
  db.query(sql, params)
    .then(result => {
      const updatedRow = result.rows[0];
      const password = String(randomPassword());
      argon2
        .hash(password)
        .then(hashedPassword => {
          const sql = `update "users" set "userPassword"=$1
                      where "userId"=$2
                      returning *`;
          const params = [hashedPassword, custId];
          db.query(sql, params)
            .then(result => {
              const customerAdded = result.rows[0];
              sendSMS(password, customerAdded.userName, customerAdded.userNumber, updatedRow.tableNumber);
              // res.json(customerAdded);
            })
            .catch(err => next(err));
        });
      res.json(updatedRow);
    })
    .catch(err => next(err));
});

app.delete('/api/delete/category/:id', (req, res, next) => {
  const deleteId = parseInt(req.params.id, 10);
  const sql = `delete from "category"
              where "categoryId" = $1
              returning * `;
  const params = [deleteId];
  db.query(sql, params)
    .then(result => {

      const menuRow = result.rows;
      res.json(menuRow);
    })
    .catch(err => next(err));
});

app.put('/api/update-order-status/:id', (req, res, next) => {
  const cartId = parseInt(req.params.id, 10);
  const { action } = req.body;
  const sql = `update "orders" set "orderStatus" =$1
               where "cartId" = $2
              returning * `;
  const params = [action, cartId];
  db.query(sql, params)
    .then(result => {
      const statusUpdateRow = result.rows[0];
      io.emit('order_status', statusUpdateRow);
      res.json(statusUpdateRow);
    })
    .catch(err => next(err));
});

app.get('/api/fetch-cart-items/:id', (req, res, next) => {
  const userId = parseInt(req.params.id, 10);
  const sql = `with "selectCardId" as (
               select "cartId" from "cart"
               where "userId" = $1
               )
                select "cartItems"."itemId" as "itemId",
                "cartItems"."quantity" as "itemQty",
                "items"."itemName" as "itemName"
                from "cartItems" join "items" using ("itemId")
                where "cartItems"."cartId" = (select "cartId" from "selectCardId")
              `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      const cartItemFetch = result.rows;
      res.json(cartItemFetch);
    })
    .catch(err => next(err));
});

app.get('/api/fetch-orders', (req, res, next) => {
  const sql = `with "itemsWithCategory" as (
              SELECT "orders"."cartId",
                      "orders"."orderId",
                      "orders"."userId",
                      "orders"."orderNote",
                      "orders"."orderStatus",
                      "cartItems"."quantity",
                      "tables"."tableNumber",
                      "items"."itemName" FROM "orders"
              JOIN "cartItems" USING ("cartId")
              JOIN "items" USING ("itemId")
              JOIN "tables" USING ("userId")
              where "orders"."orderStatus" != $1)
              SELECT "cartId","orderId","userId","tableNumber","orderNote","orderStatus",JSON_AGG("itemsWithCategory".*) as "items"
              FROM "itemsWithCategory"
              group by "cartId","orderId","userId","tableNumber","orderNote","orderStatus"
              `;
  const params = ['finished'];
  db.query(sql, params)
    .then(result => {
      const cartItemFetch = result.rows;
      res.json(cartItemFetch);
    })
    .catch(err => next(err));
});

app.get('/api/fetch-orders-socket/:id', (req, res, next) => {
  const orderId = parseInt(req.params.id, 10);
  const sql = `with "itemsWithCategory" as (
              SELECT "orders"."cartId",
                      "orders"."orderId",
                      "orders"."userId",
                      "orders"."orderNote",
                      "orders"."orderStatus",
                      "cartItems"."quantity",
                      "tables"."tableNumber",
                      "items"."itemName" FROM "orders"
              JOIN "cartItems" USING ("cartId")
              JOIN "items" USING ("itemId")
              JOIN "tables" USING ("userId")
              Where "orders"."orderId" = $1)
              SELECT "cartId","orderId","userId","tableNumber","orderNote","orderStatus",JSON_AGG("itemsWithCategory".*) as "items"
              FROM "itemsWithCategory"
              group by "cartId","orderId","userId","tableNumber","orderNote","orderStatus"
              `;
  const params = [orderId];
  db.query(sql, params)
    .then(result => {
      const cartItemFetch = result.rows[0];
      res.json(cartItemFetch);
    })
    .catch(err => next(err));
});

app.post('/api/add/category', (req, res, next) => {
  const { addcategory } = req.body;
  const sql = `
        insert into "category" ("categoryName")
        values ($1)
        returning *
      `;
  const params = [addcategory];
  db.query(sql, params)
    .then(result => {
      const [categoryAdded] = result.rows;
      res.json(categoryAdded);
    })
    .catch(err => next(err));
});

app.post('/api/add-item', (req, res, next) => {
  const { userId, itemId, itemQty } = req.body;
  const sql = `select "userId" from "cart"
               where "userId" = $1`;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      const [userFetched] = result.rows;
      if (!userFetched) {
        const sql = `with "insertCart" as (
                    insert into "cart" ("userId") values($1)
                    returning "cartId"
                    )
                    insert into "cartItems" ("cartId","itemId","quantity")
                    values ((select "cartId" from "insertCart"),$2,$3)
                    returning *`;
        const params = [userId, itemId, itemQty];
        db.query(sql, params)
          .then(result => {
            const [itemAdded] = result.rows;
            res.json(itemAdded);
          })
          .catch(err => next(err));
      } else {
        const sql = `with "selectUser" as (
                    select "cartId" from "cart"
                    where "userId" = $1
                    )
                    insert into "cartItems" ("cartId","itemId","quantity")
                    values ((select "cartId" from "selectUser"),$2,$3)
                    returning *`;
        const params = [userId, itemId, itemQty];
        db.query(sql, params)
          .then(result => {
            const [itemAdded] = result.rows;
            res.json(itemAdded);
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
});

app.post('/api/add/waitlist', (req, res, next) => {
  const { addcustname, addcustmobile } = req.body;
  const sql = `
      select * from "waitlist"
      where "userNumber" = $1
      `;
  const params = [addcustmobile];
  db.query(sql, params)
    .then(result => {
      const [fetchResult] = result.rows;
      if (fetchResult) {
        throw new ClientError(403, 'Already exists');
      }
      const password = String(randomPassword());
      argon2
        .hash(password)
        .then(hashedPassword => {
          const sql = `with "newUser" as (
      insert into "users" ("userName","userNumber","userPassword","userRole")
      values($1,$2,$3,$4)
      returning "userId"
      )
      insert into "waitlist" ("userName","userNumber","userId")
      values ($1,$2,(select "userId" from "newUser"))
      returning *
      `;
          const params = [addcustname, addcustmobile, hashedPassword, 'Customer'];
          db.query(sql, params)
            .then(result => {
              const [customerAdded] = result.rows;
              if (!customerAdded) {
                throw new ClientError(401, 'mobile number is already used');
              }
              res.json(customerAdded);
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
});

app.post('/api/add/fooditem', uploadsMiddleware, (req, res, next) => {
  const { categoryselect, itemName, itemPrice, itemDesc } = req.body;
  const catid = parseInt(categoryselect);
  const url = req.file.key;
  const sql = `
    insert into "items" ("itemName", "itemDescription","itemPrice","categoryId","itemImg")
    values ($1, $2, $3, $4, $5)
    returning *
  `;
  const params = [itemName, itemDesc, itemPrice, catid, url];
  db.query(sql, params)
    .then(result => {
      const [data] = result.rows;
      res.status(201).json(data);
    })
    .catch(err => next(err));
});

app.get('/api/get/menu', (req, res, next) => {
  const sql = `with "itemsWithCategory" as (
  SELECT * FROM "category"
  JOIN "items" USING ("categoryId") )
  SELECT "categoryName", "categoryId", JSON_AGG("itemsWithCategory".*) as "items"
  FROM "itemsWithCategory"
  group by "categoryName","categoryId"`;
  db.query(sql)
    .then(result => {
      const menuRow = result.rows;
      res.json(menuRow);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'An unexpected error occurred.'
      });
    });
});

app.use(staticMiddleware);

app.use(errorMiddleware);

httpServer.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`express server listening on port ${process.env.PORT}`);
});

app.use(authorizationMiddleware);

app.post('/api/place-order', (req, res, next) => {
  const { userId } = req.user;
  const { custNote } = req.body;
  const sql = `with "deleteCartId" as (
      delete from "cart"
      where "userId" = $1
      returning "cartId"
      )
      insert into "orders" ("cartId","userId","orderNote","orderStatus")
      values ((select "cartId" from "deleteCartId"),$1,$2,$3)
      returning *`;
  const params = [userId, custNote, 'Received'];
  db.query(sql, params)
    .then(result => {
      const orderInserted = result.rows[0];
      io.emit('order_placed', orderInserted);
      res.json(orderInserted);
    })
    .catch(err => next(err));
});

app.get('/api/fetch-order-status', (req, res, next) => {
  const { userId } = req.user;
  const sql = `select * from "orders"
               where "userId"=$1
               order by "orderId" desc
               limit 1`;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      if (result.rowCount === 0) {
        result.rows = { orderStatus: 'not-found' };
        res.json(result.rows);
      } else {
        const orderInserted = result.rows[0];
        res.json(orderInserted);
      }

    })
    .catch(err => next(err));
});
