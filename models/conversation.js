const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const User = require("./user");


/**
 * Related functions for friend requests.
 */
class Conversation {


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

    static async createOrFindConversation(one, two) {

        //checks for duplicated request

        const duplicateCheck = await db.query(
            `SELECT conversation.id
            FROM conversation
            INNER JOIN convoparticipants 
            ON
            conversation.id = convoparticipants.cid
            WHERE (convoparticipants.member_one = $1 AND convoparticipants.member_two = $2)
                OR (convoparticipants.member_one = $2 AND convoparticipants.member_two = $1) `,
            [one, two],
        );


        if (duplicateCheck.rows[0]) {
            const person = await User.get(one)

            duplicateCheck.rows[0].user = person


            duplicateCheck.rows[0].messages = []
            return duplicateCheck.rows[0]
        }

        //save request data in databse
        const conversation = await db.query(
            `INSERT INTO conversation
            values (default)
            RETURNING id`
        );

        //save request data in databse
        const members = await db.query(
            `INSERT INTO convoparticipants
                 (cid,
                    member_one,
                    member_two)
                 VALUES ($1, $2, $3)
                 RETURNING id, cid, member_one, member_two`,
            [
                conversation.rows[0].id,
                one,
                two
            ],
        );

        const person = await User.get(one)

        members.rows[0].user = person


        members.rows[0].messages = []



        return members.rows[0]
    }

    // static async findAllRequests(recipient) {
    //     console.log("trying")
    //     const requestRes = await db.query(
    //         `SELECT friendrequest.id,
    //         users.first_name, 
    //         users.last_name,
    //         users.avatar,
    //         users.on_line
    //         FROM friendrequest 
    //         INNER JOIN users ON
    //         users.id = friendrequest.recipient
    //         WHERE
    //         friendrequest.recipient = $1`, [recipient],
    //     );


    //     const requests = requestRes.rows;

    //     return requests
    // }


}


module.exports = Conversation;