import { getConnection } from '../utils/getConnection';
import type { Request, Response } from 'express';
import { Connection } from 'mysql';
const express = require('express');
const router = new express.Router();
const sqlAuth = require('../middleware/sqlauth');
const jwt = require('jsonwebtoken');

const userLogin = async (connection: Connection, user: any, res: Response) => {
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '6h',
  });
  user.tokens = token;
  let queryString = `call userLogin (${user.id}, '${token}')`;
  connection.query(queryString, e => {
    if (e) {
      res.status(400).send(e);
      return;
    }
    res.status(200).send({ user, token });
  });
};
router.post('/users/add', async (req: Request, res: Response) => {
  try {
    const connection = await getConnection();
    const query = `call addAUser ('${req.body.email}', '${req.body.password}', '${req.body.name}')`;
    connection.query(query, async (err, results) => {
      if (err) {
        res.status(400).send(err);
        return;
      }
      await userLogin(connection, results[0][0], res);
    });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.post('/users/login', async (req: Request, res: Response) => {
  try {
    let email = req.body.email;
    const connection = await getConnection();
    let queryString = `select * from Users where Users.email='${email}'`;
    connection.query(queryString, async (e, results) => {
      try {
        let user = results[0];
        if (e || !user) {
          throw new Error('EMAIL_NOT_FOUND');
        } else {
          if (req.body.password !== user.password) {
            throw new Error('INVALID_PASSWORD');
          }
          await userLogin(connection, user, res);
        }
      } catch (error: any) {
        if (error.message === 'EMAIL_NOT_FOUND') {
          console.log(error);
          res.status(404).send(error.message);
        } else res.status(400).send('INVALID_PASSWORD');
      }
    });
  } catch (err: any) {
    if (err.message === 'EMAIL_NOT_FOUND') res.status(404).send(err.message);
    else res.status(400).send('INVALID_PASSWORD');
  }
});
router.post('/users/logout', sqlAuth, async (req: Request, res: Response) => {
  try {
    let tokens = req.body.user.tokens;
    tokens = tokens.filter((token: string) => {
      return token !== req.body.token;
    });
    const connection = await getConnection();
    let tokensString = tokens.toString();
    let queryString = `update Users set tokens = '${tokensString}' where id=${req.body.user.id}`;
    connection.query(queryString, err => {
      if (err) {
        res.status(400).send(err);
      }
      res.send();
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});
router.patch('/users/me', sqlAuth, async (req: Request, res: Response) => {
  const updates: Record<string, any> = Object.keys(req.body.updates);
  const allowedUpdates = ['password', 'name', 'courses'];
  const isValidOperation = updates.every((update: any) =>
    allowedUpdates.includes(update),
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }
  try {
    const user = req.body.user;
    let queryString = `${user.email}', `;
    allowedUpdates.forEach(option => {
      if (!updates.includes(option)) {
        queryString += `'${user[option]}', `;
      } else {
        queryString += `'${req.body.updates[option]}', `;
      }
    });
    queryString = queryString.slice(0, queryString.length - 3);
    const connection = await getConnection();
    connection.query(`call editUser('${queryString}')`, (err, result) => {
      if (err) {
        res.status(400).send(err);
        return;
      }
      let updatedUser = result[0][0];
      updatedUser.tokens = updatedUser.tokens.split(',');
      res.send(updatedUser);
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
