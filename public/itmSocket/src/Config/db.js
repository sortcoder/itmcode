import mysql from "mysql2/promise";

let connection='';
try {
  
   connection = await mysql.createConnection({host:'localhost', user: 'root', database: 'itm_money_newdb',password:"Redhat123?tombigbee", "keepAliveInitialDelay": 10000, "enableKeepAlive": true,});
  // query database
    console.log('Connection has been established successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  export default connection;
 