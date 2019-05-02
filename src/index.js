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

app.get('/booking/list', (request, response) => {
  let data = db.get('bookings').value();
  if (data) {
    response.json(data);
  } else {
    response.status(500).end();
  }
});

app.get('/booking/:id', (request, response) => {
  let booking = db.get('bookings').find({"bookingReference": request.params.id}).value();
  console.log(booking);
  if (booking) {
    response.json(booking);
  } else {
    response.status(400).end();
  }
});

app.post('/booking/:id/checkin', (request, response) => {
  let booking = db.get('bookings').find({"bookingReference": request.params.id});
  if (booking) {
    booking.assign({"state": "checked_in"}).write();
    response.json(booking);
  } else {
    response.status(400).end();
  }
});

app.post('/booking/:id/checkout', (request, response) => {
  let booking = db.get('bookings').find({"bookingReference": request.params.id});
  if (booking) {
    booking.assign({"state": "checked_out"}).write();
    response.json(booking);
  } else {
    response.status(400).end();
  }
});

app.listen(PORT, () => log(`Example app listening on port ${PORT}!`));
