"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");
const { generateUploadURL } = require("../s3");



/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 * 
 * Authorization required: none
 *
 */
router.post("/token", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const { email, password } = req.body;
        const user = await User.authenticate(email, password);
        const token = createToken(user);
        return res.json({ token, user });
    } catch (err) {
        return next(err);
    }
});


/** POST /auth/register:   { user } => { token }
 *
 * Required data : { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 * 
 */

router.post("/register", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const newUser = await User.register({ ...req.body });
        const token = createToken(newUser);
        console.log(token)
        return res.json({ token, newUser });
    } catch (err) {
        return next(err);
    }
});

router.get('/s3Url', async function (req, res, next) {
    try {
        const url = await generateUploadURL()
        res.send({ url })
    } catch (err) {
        return next(err);
    }

})







module.exports = router;