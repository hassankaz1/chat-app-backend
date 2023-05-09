const { Client } = require("pg");

// let DB_URI;

// if (process.env.NODE_ENV === "test") {
//     DB_URI = "postgresql:///chatapp_test";
// } else {
//     DB_URI = process.env.DATABASE_URL || "postgresql:///chatapp";
// }

// let db = new Client({
//     connectionString: DB_URI
// });

// db.connect();


const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


db.connect();

module.exports = db;