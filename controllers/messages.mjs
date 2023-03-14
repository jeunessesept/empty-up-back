import { pool } from "../models/dbPool.mjs";

// export const getMessages = async (req, res) => {
//     const discussion_id = req.params.discussionId
//     try {
//         const allMessages = await pool.query(
//             "SELECT * FROM messages where discussion_id = $1 order by date ASC",
//             [discussion_id]
//         );
//         res.json(allMessages.rows)
//     } catch (error) {
//         console.error(error.message)
//     }
// }

export const getMessagesInfos = async (req, res) => {
    const discussion_id = req.params.discussionId
    try {
        const allMessagesInfos = await pool.query('SELECT u.username AS user_username, ' +
            'u.profilpicture_url AS user_profilpicture_url, ' +
            'm.content, m.date ' +
            'FROM messages m ' +
            'JOIN users u ON m.user_id = u.id ' +
            'WHERE m.discussion_id = $1 ' +
            'ORDER BY m.date DESC',
            [discussion_id])
        return res.send(allMessagesInfos.rows)
    } catch(error){
        console.error(error)
        return res.status(500).send({error:" internal server error"})
    }
}

export const getLastMessage = async (req, res) => {
    const user_id = req.userId
    try {
        const lastMessage = await pool.query(
            "SELECT content FROM messages ORDER BY id DESC LIMIT 1 where user_id = $1",
            [user_id]
        )
        return res.json(lastMessage.rows)
    } catch (error) {
        console.error(error)
    }
}


export const postMessage = async (req, res) => {
    const user_id = req.userId
    const { content } = req.body
    const date = new Date()
    const discussion_id = req.params.discussionId;
    try {

        await pool.query("INSERT INTO messages (user_id, content, date, discussion_id) VALUES ($1, $2, $3, $4)",
            [user_id, content, date, discussion_id]);
        return res.status(201).json({
            status: 'success',
            message: 'message posted',
        });
    } catch (error) {
        cconsole.error(error)
        return res.status(500).send({error:" internal server error"})
    }
}


