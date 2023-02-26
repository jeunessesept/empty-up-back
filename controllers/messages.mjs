import { pool } from "../models/dbPool.mjs";

export const getMessages = async (req, res) => {
    const discussion_id = req.params.discussionId
    try {
        const allMessages = await pool.query(
            "SELECT * FROM messages where discussion_id = $1 order by date ASC",
            [discussion_id]
        );
        res.json(allMessages.rows)
    } catch (error) {
        console.error(error.message)
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
        console.error(error.message)
    }
}


export const postMessage = async (req, res) => {
    const user_id = "17"
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
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error posting message',
        });
    }
}


export const deleteMessage = (req, res) => {


}