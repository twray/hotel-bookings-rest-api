import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const log = console.log;
const app = express();
const PORT = process.env.PORT;

const adapter = new FileSync('db/db.json');
const db = lowdb(adapter);

db.defaults({'bookings': []})
  .write();

app.use(cors());
app.use(bodyParser.urlencoded({'extended': true}));
app.use(bodyParser.json());

const simulateNetworkConditions = () => new Promise((resolve, reject) => { 
  const networkFail = !Boolean(Math.floor(Math.random() * 10));
  if (!networkFail) {
    setTimeout(resolve, Math.random() * 1000);
  } else {
    reject();
  }
});

app.get('/booking/list', (request, response) => {
  simulateNetworkConditions()
    .then(() => {
      let data = db.get('bookings').value();
      if (data) {
        response.json(data);
      } else {
        response.status(500).end();
      }
    })
    .catch(() => response.status(500).end());
});

app.get('/booking/search', (request, response) => {
  simulateNetworkConditions()
    .then(() => {
      let query = request.query && request.query['q'];
      let data = db.get('bookings').value();
      if (data && query) {
        data = data.filter(booking => {
          return booking.bookingReference === query ||
            booking.guest.name.toLowerCase().includes(query.toLowerCase()) ||
            booking.room.roomNumber === query
        });
        response.json(data);
      } else {
        response.status(500).end();
      }
    })
    .catch(() => response.status(500).end());
});

app.get('/booking/:id', (request, response) => {
  simulateNetworkConditions()
    .then(() => {
      let booking = db.get('bookings').find({"bookingReference": request.params.id}).value();
      if (booking) {
        response.json(booking);
      } else {
        response.status(400).end();
      }
    })
    .catch(() => response.status(500).end());
});

app.post('/booking/:id/checkin', (request, response) => {
  simulateNetworkConditions()
    .then(() => {
      let booking = db.get('bookings').find({"bookingReference": request.params.id});
      if (booking) {
        booking.assign({"state": "checked_in"}).write();
        response.json(booking);
      } else {
        response.status(400).end();
      }
    })
    .catch(() => response.status(500).end());
});

app.post('/booking/:id/checkout', (request, response) => {
  simulateNetworkConditions()
    .then(() => {
      let booking = db.get('bookings').find({"bookingReference": request.params.id});
      if (booking) {
        booking.assign({"state": "checked_out"}).write();
        response.json(booking);
      } else {
        response.status(400).end();
      }
    })
    .catch(() => response.status(500).end());
});

app.listen(PORT, () => log(`Our app is listening on port ${PORT}!`));
