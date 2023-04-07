import mongoose from 'mongoose';

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = encodeURIComponent(process.env.MONGO_PASSWORD); // encode password in case of spacial chracter
const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DATABASE = process.env.MONGO_DATABASE;
// create mongo uri

// const url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authMechanism=SCRAM-SHA-1`;
const url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}?authSource=${MONGO_DATABASE}`;
console.log(url);

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

mongoose.connection.on('connected', () => {
 
    console.log('Mongo has connected successfully');
});
mongoose.connection.on('reconnected', () => {
    console.log('Mongo has reconnected');
  
});
mongoose.connection.on('error', error => {
    console.log('Mongo connection has an error', error);
   
    mongoose.disconnect();
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongo connection is disconnected');
   
});

export { mongoose as db };
