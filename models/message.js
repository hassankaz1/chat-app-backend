const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/**
 * Related functions for friend requests.
 */
class Message {


    // static async get(id) {

    //     const requestRes = await db.query(
    //         `SELECT *
    //         FROM friendrequest
    //         WHERE id=$1`, [id],
    //     );

    //     const request = requestRes.rows[0];

    //     if (!request) throw new NotFoundError(`No friend request with id: ${id}`);


    //     return request;
    // };



    /** Create a friend request
     * 
     * Returns { id, sender, recipient}
     * 
    *  Throws UnauthorizedError is user not found.
   * */

    static async createMessage(data) {
        const result = await db.query(
            `INSERT INTO message
                 (cid,
                  sender,
                  recipient,
                  msgtype,
                  msg)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING cid,
                 sender,
                 recipient,
                 msgtype,
                 msg`,
            [
                data.cid, data.sender, data.recipient, "msg", data.message
            ],
        );

        const new_message = result.rows[0];

        return new_message
    }

    static async findAllMessages(chat_id) {
        console.log("trying to get all messages")
        const requestRes = await db.query(
            `SELECT *
            FROM message 
            WHERE
            cid = $1 ORDER BY id`, [chat_id],
        );


        const messages = requestRes.rows;

        return messages
    }


}


module.exports = Message;