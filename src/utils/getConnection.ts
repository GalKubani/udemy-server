import { Connection } from 'mysql';

const mysql = require('mysql');

const config = {
  user: 'root',
  password: process.env.SQL_PASSWORD,
  host: 'localhost',
  database: 'udemy_db',
};

export const getConnection = async (): Promise<Connection> => {
  let connection = await mysql.createConnection(config);
  return connection;
};
