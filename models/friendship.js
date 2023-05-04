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
class Friendship {


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

    static async createFriendship(one, two) {
        //checks for duplicated request
        // const duplicateCheck = await db.query(
        //     `SELECT id
        //              FROM friendrequest
        //              WHERE sender = $1 AND recipient = $2`,
        //     [recipient, sender],
        // );
        // if (duplicateCheck.rows[0]) {
        //     throw new BadRequestError(`Friend Request pending already within users`);
        // }




        //save request data in databse
        const result = await db.query(
            `INSERT INTO friendship
                 (friend_one,
                  friend_two)
                 VALUES ($1, $2)
                 RETURNING id, friend_one, friend_two`,
            [
                one,
                two
            ],
        );

        const friendship = result.rows[0];

        return friendship
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


module.exports = Friendship;