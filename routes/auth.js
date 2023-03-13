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
        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        const token = createToken(user);
        return res.json({ token });
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
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});



/** Get/auth/favorites/ 
 *
 * Return all of the user's favorites stations information
 * 
 * Authorization required: same-user-as-:username
 * */

router.get("/favorites/:user_id", async function (req, res, next) {
    try {
        const result = await User.getAllFav(req.params.user_id);
        return res.json({ result });
    } catch (err) {
        return next(err);
    }
});





module.exports = router;