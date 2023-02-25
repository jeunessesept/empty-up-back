import { pool } from "../models/dbPool.mjs";


export const getDiscussion = async (req, res) => {
    const user1 = 1;
    if (!user1) {
        return res.status(401).send({ error: "not authorized" })
    }
    const getUser2 = await pool.query('SELECT id, user_1, user_2 FROM discussion where user_1 = $1',
        [user1])
    const users = getUser2.rows
    const user2 = users.map(obj => obj.user_2);
    console.log(user2)

    const results = [];
    try {
        for (const user of user2) {

            const result1 = await pool.query('SELECT u1.username as user1_name, u1.profilpicture_url as user1_profile, ' +
                'u2.username as user2_name, u2.profilpicture_url as user2_profile, ' +
                'd.id as d_id ' +
                'FROM discussion d ' +
                'JOIN users u1 ON u1.id = d.user_1 ' +
                'JOIN users u2 ON u2.id = d.user_2 ' +
                'WHERE d.user_1 = $1 AND d.user_2 = $2',
                [user1, user])
            results.push(result1.rows)


        }
        return res.status(200).json({ data: results });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }



}

export const createDiscussion = async (req, res) => {
    console.log(req.body)
    console.log(req.body.username)
    const user1 = req.userId
    console.log(user1)
    const user2 = req.body.username
    const hours = (new Date().getHours() + " : " + new Date().getMinutes())
    const date = new Date() + hours
    if (!user1) {
        return res.status(401).send({ error: "not authorized" })
    }

    try {
        const user = await pool.query("SELECT id FROM users WHERE username = $1", [user2])
        console.log(user.rows[0].id)
        await pool.query("INSERT INTO discussion (user_1, user_2) values ($1, $2)",
            [user1, user.rows[0].id])

        return res.status(201).send({ info: "discussion succesfully created" })

    } catch (error) {
        console.error(error)
        return res.status(500).send({ error: "internal server error" })
    }
}


export const getLastMessage = async (req, res) => {
    const user1 = req.userId;
    if (!user1) {
        return res.status(401).send({ error: "not authorized" })
    }
    const getUser2 = await pool.query('SELECT user_2 FROM discussion where user_1 = $1',
        [user1])
    const user2 = getUser2.rows[0].user_2
    try {
        const message = await pool.query('SELECT m.* ' +
            'FROM messages m ' +
            'WHERE m.discussion_id = ( ' +
            '  SELECT d.id ' +
            '  FROM discussion d ' +
            '  WHERE (d.user_1 = $1 AND d.user_2 = $2) ' +
            '     OR (d.user_1 = $2 AND d.user_2 = $1) ' +
            '  ORDER BY d.id DESC ' +
            '  LIMIT 1 ' +
            ') ' +
            'ORDER BY m.date DESC ' +
            'LIMIT 1',
            [user1, user2])
        const lastMessage = message.rows[0].content
        return res.status(200).json({ lastmessage: lastMessage })
    } catch (error) {
        res.send(error)
    }

}


export const deleteDiscussion = async (req, res) => {
    const discussion_id = req.params.id    // => dans le endpoint donner le id de la discussion qu'on veut supprimer 
    const user = req.userId
    const user_id = await pool.query("select id, user_1 from discussion where id = $1",
        [discussion_id])
    console.log(user, user_id.rows[0].user_1)
    if (!user) {
        return res.status(401).send({ error: "not authorized" })
    }
    if (user === user_id.rows[0].user_1) {
        try {
            await pool.query("delete from discussion where id = $1",
                [discussion_id])
            return res.status(201).send({ message: 'Discussion deleted succesfully' })

        } catch (error) {
            console.error(error)
            return res.status(500).send({ error: 'Internal server error' })
        }
    } else {
        return res.status(404).send({ error: 'user not authorized' })
    }
}