const admin = require("firebase-admin");

const serviceAccount = require("./zolemate-tutorial.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports.admin = admin;