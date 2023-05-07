const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
} = require("../expressError");

const User = require("./user");
const Message = require("./message");


const Chat_History = [
    {
        type: "msg",
        message: "Hi 👋🏻, How are ya ?",
        incoming: true,
        outgoing: false,
    },
    {
        type: "divider",
        text: "Today",
    },
    {
        type: "msg",
        message: "Hi 👋 Panda, not bad, u ?",
        incoming: false,
        outgoing: true,
    },
    {
        type: "msg",
        message: "Can you send me an abstarct image?",
        incoming: false,
        outgoing: true,
    },
    {
        type: "msg",
        message: "Ya sure, sending you a pic",
        incoming: true,
        outgoing: false,
    },

    {
        type: "msg",
        subtype: "img",
        message: "Here You Go",
        img: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw1NJYKsfdPxt4Em4vaPCg-_&ust=1683485504499000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCMC55K2u4f4CFQAAAAAdAAAAABAE",
        incoming: true,
        outgoing: false,
    },
    {
        type: "msg",
        message: "Can you please send this in file format?",
        incoming: false,
        outgoing: true,
    },

    {
        type: "msg",
        subtype: "doc",
        message: "Yes sure, here you go.",
        incoming: true,
        outgoing: false,
    },
    {
        type: "msg",
        subtype: "link",
        preview: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fnature%2F&psig=AOvVaw1NJYKsfdPxt4Em4vaPCg-_&ust=1683485504499000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCMC55K2u4f4CFQAAAAAdAAAAABAE",
        message: "Yep, I can also do that",
        incoming: true,
        outgoing: false,
    },
    {
        type: "msg",
        subtype: "reply",
        reply: "This is a reply",
        message: "Yep, I can also do that",
        incoming: false,
        outgoing: true,
    },
];


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

    static async findConversation(one, two) {

        //checks for duplicated request

        const check = await db.query(
            `SELECT conversation.id
            FROM conversation
            INNER JOIN convoparticipants 
            ON
            conversation.id = convoparticipants.cid
            WHERE (convoparticipants.member_one = $1 AND convoparticipants.member_two = $2)
                OR (convoparticipants.member_one = $2 AND convoparticipants.member_two = $1) `,
            [one, two],
        );


        if (check.rows[0]) {
            const person = await User.get(one)

            check.rows[0].user = person


            check.rows[0].messages = await Message.findAllMessages(check.rows[0].cid)


            console.log(check.rows[0])
            return check.rows[0]
        }

        return null
    }

    static async createConversation(one, two) {

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


    static async findAllConversations(id) {

        //checks for duplicated request

        const conversations = await db.query(
            `SELECT * FROM
            convoparticipants 
            WHERE convoparticipants.member_one = $1 OR convoparticipants.member_two = $1 `,
            [id],
        );




        return conversations.rows
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