const express = require('express');
const cors = require('cors');
const port = process.env.PORT;
const app = express();
const { initDB } = require('./utils/init');
const userRouter = require('./routers/usersRouter');
const courseRouter = require('./routers/courseRouter');

app.use(cors());
app.use(express.json());
initDB().then(() => {
  console.log('DB initialized');
});
app.use(courseRouter);
app.use(userRouter);
app.use('/', (req: any, res: any) => {
  res.send('ok');
});

app.listen(port, () => console.log('server on port:', port));

export {};
