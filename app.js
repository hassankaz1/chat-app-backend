// require("dotenv").config();
const express = require('express');
const cors = require("cors");
const { NotFoundError } = require('./expressError');
const { authenticateJWT } = require("./middleware/auth");


const app = express();

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const friendrequestRoutes = require("./routes/friendrequest")

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticateJWT);
app.options('*', cors())

app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/friendrequest", friendrequestRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;