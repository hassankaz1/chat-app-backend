const db = require("../db");
const bcrypt = require("bcryptjs");

const { BCRYPT_WORK_FACTOR } = require("../config");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

/**
 * Related functions for user.
 */
class User {

    /** Authenticate user with username, password.
     * 
     * Returns { username, first_name, last_name}
     * 
    *  Throws UnauthorizedError is user not found or wrong password.
   * */

    static async authenticate(email, password) {
        const result = await db.query(
            `SELECT *
            FROM users
            WHERE email = $1`,
            [email],
        );

        const user = result.rows[0];

        // compare hashed password to a new hash from password
        if (user && (await bcrypt.compare(password, user.password))) {
            delete user.password;
            return user;
        } else {
            throw new UnauthorizedError("Invalid email/password");
        }
    }


    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, profile_img}
     *
     * Throws BadRequestError on duplicates.
     **/
    static async register({ email, password, firstName, lastName, avatar }) {

        //checks for duplicated username
        const duplicateCheck = await db.query(
            `SELECT email
             FROM users
             WHERE email = $1`,
            [email],
        );
        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Associated account already with: ${email}`);
        }

        //hash user's input password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        //save user data in databse
        const result = await db.query(
            `INSERT INTO users
             (email,
              password,
              first_name,
              last_name,
              avatar)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, first_name, last_name, avatar`,
            [
                email,
                hashedPassword,
                firstName,
                lastName,
                avatar
            ],
        );

        console.log(hashedPassword)

        const user = result.rows[0];

        return user;
    }

    /** Given a username, return data about user.
     *
     * Returns : { id, username, first_name, last_name, email, avatar }
     *
     * Throws NotFoundError if user not found.
     **/

    static async get(id) {

        const userRes = await db.query(
            `SELECT *
            FROM users
            WHERE id=$1`, [id],
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${id}`);


        return user;
    };

    /** Given a id, return all friends from user.
     *
     * Returns : { id, username, first_name, last_name, email, avatar }
     *
     * Throws NotFoundError if user not found.
     **/

    static async getAllUsers(id) {

        // select all users
        const usersRes = await db.query(
            `SELECT *
            FROM users
            WHERE id != $1`,
            [id],
        );

        const users = usersRes.rows;

        return users;
    };

    static async getPotentialFriends(id) {

        // select all users
        const usersRes = await db.query(
            `SELECT *
            FROM users
            WHERE users.id <> $1
            AND users.id NOT IN (
              SELECT sender
              FROM friendrequest
              WHERE recipient = $1
              UNION
              SELECT recipient
              FROM friendrequest
              WHERE sender = $1
            )
            AND users.id NOT IN (
              SELECT friend_one
              FROM friendship
              WHERE friend_two = $1
              UNION
              SELECT friend_two
              FROM friendship
              WHERE friend_one = $1
            );`, [id],
        );

        const users = usersRes.rows;

        return users;
    };

    static async getFriends(id) {

        // select all friends
        const friendRes = await db.query(
            `SELECT u.* 
            FROM users u 
            JOIN friendship f ON (u.id = f.friend_two OR u.id = f.friend_one) 
            WHERE u.id <> $1
              AND (f.friend_one = $1 OR f.friend_two = $1)`, [id],
        );

        const friendships = friendRes.rows;

        return friendships;
    };





    /** Update user data with `data`.
     *
     * "partial update" - only changes provided fields.
     *
     * Data can include:
     *   { firstName, lastName, password, email, profile_img}
     *
     * Returns { username, firstName, lastName, email, profile_img}
     *
     * Throws NotFoundError if not found.
     *
     */

    static async update(id, data) {

        // check for correct password
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                first_name: "first_name",
                last_name: "last_name",
                password: "password",
                email: "email",
                avatar: "avatar",
                socket_id: "socket_id",
                on_line: "on_line"
            });

        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id,
                                    first_name,
                                    last_name,
                                    email,
                                    avatar,
                                    socket_id,
                                    on_line`;

        const result = await db.query(querySql, [...values, id]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${id}`);

        delete user.password;
        return user;
    }


    /** Delete given user from database; returns undefined. */

    static async remove(id) {
        let result = await db.query(
            `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
            [username],
        );
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);
    }


}


module.exports = User;