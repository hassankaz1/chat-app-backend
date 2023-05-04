"use strict";

/** Routes for user. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const db = require("../db");
const FriendRequest = require("../models/friendrequest");


const router = express.Router();



/** GET /user/:[username] => { user }
 *
 * Returns { username, firstName, lastName, profile_img}
 * 
 * Authorization required: same user-as-:username
 **/

router.get("/requests/:id", async function (req, res, next) {
    try {
        console.log("recieved request to find requests")
        const user = req.params.id;
        const requests = await FriendRequest.findAllRequests(user)

        return res.json({ requests });
    } catch (err) {
        return next(err);
    }
});


router.post("/requests", async function (req, res, next) {
    try {
        const { recipient, sender } = req.body;
        const requests = await FriendRequest.createRequest(recipient, sender)

        return res.json({ requests });
    } catch (err) {
        return next(err);
    }
});



module.exports = router;