"use strict";

/** Routes for user. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

const userRegisterSchema = require("../schemas/userRegister.json");
const userAuthSchema = require("../schemas/userAuth.json");

const router = express.Router();



/** GET /user/:[username] => { user }
 *
 * Returns { username, firstName, lastName, profile_img}
 * 
 * Authorization required: same user-as-:username
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        const username = req.params.username;
        const user = await User.get(username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

router.get("/get-all-users/:uid", async function (req, res, next) {
    try {
        console.log(req.params.uid)
        const uid = req.params.uid;
        const users = await User.getAllUsers(uid);

        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});


router.get("/friends/:uid", async function (req, res, next) {
    try {
        console.log(req.params.uid)
        const uid = req.params.uid;
        const friends = await User.getFriends(uid);

        return res.json({ friends });
    } catch (err) {
        return next(err);
    }
});



/** PATCH /user/:id { user } => { user }
 *
 * User data:
 *   { username, firstName, lastName, password, email, avatar}
 *
 * Returns user data
 *
 * Authorization required:  same-user-as-:username
 **/

// router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
//     try {
//         const validator = jsonschema.validate(req.body, userUpdateSchema);
//         if (!validator.valid) {
//             const errs = validator.errors.map(e => e.stack);
//             throw new BadRequestError(errs);
//         }
//         const username = req.params.username;
//         const user = await User.update(username, req.body)
//         return res.json({ user });
//     } catch (err) {
//         return next(err);
//     }
// });


/** DELETE /[user id]  =>  { deleted: username }
 *
 * Authorization required: same-user-as-:username
 **/

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });
    } catch (err) {
        return next(err);
    }
});



module.exports = router;