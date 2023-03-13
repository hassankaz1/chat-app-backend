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

    static async authenticate(username, password) {
        const result = await db.query(
            `SELECT *
            FROM users
            WHERE username = $1`,
            [username],
        );

        const user = result.rows[0];

        // compare hashed password to a new hash from password
        if (user && (await bcrypt.compare(password, user.password))) {
            delete user.password;
            return user;
        } else {
            throw new UnauthorizedError("Invalid username/password");
        }
    }


    /** Register user with data.
     *
     * Returns { username, firstName, lastName, email, profile_img}
     *
     * Throws BadRequestError on duplicates.
     **/
    static async register({ username, password, firstName, lastName, email, avatar }) {

        //checks for duplicated username
        const duplicateCheck = await db.query(
            `SELECT username
             FROM users
             WHERE username = $1`,
            [username],
        );
        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`);
        }

        //hash user's input password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        //save user data in databse
        const result = await db.query(
            `INSERT INTO users
             (username,
              password,
              first_name,
              last_name,
              email,
              avatar
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING username, first_name, last_name, email,avatar`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                email,
                avatar
            ],
        );

        const user = result.rows[0];

        return user;
    }

    /** Given a username, return data about user.
     *
     * Returns : { id, username, first_name, last_name, email, avatar }
     *
     * Throws NotFoundError if user not found.
     **/

    static async get(username) {

        const userRes = await db.query(
            `SELECT id,
            username,
            first_name, 
            last_name,
            email, 
            avatar
            FROM users
            WHERE username=$1`, [username],
        );

        const user = userRes.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

        const userId = user["id"];

        return user;
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

    static async update(username, data) {

        // check for correct password
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                username: "username",
                firstName: "first_name",
                lastName: "last_name",
                password: "password",
                email: "email",
                avatar: "avatar",
            });
        const usernameVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE users 
                          SET ${setCols} 
                          WHERE username = ${usernameVarIdx} 
                          RETURNING username,
                                    first_name,
                                    last_name,
                                    email,
                                    avatar`;

        const result = await db.query(querySql, [...values, username]);
        const user = result.rows[0];

        if (!user) throw new NotFoundError(`No user: ${username}`);

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