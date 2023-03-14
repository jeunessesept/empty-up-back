import { pool } from "../models/dbPool.mjs"


// // all likes
// export const allLikes = async ( req, res ) =>{
//     try {
//         const likes = await pool.query("SELECT * FROM like_per_building" )
//         console.log(likes.rows)

//     if ( likes.rows.length === 0) {
//         return res.status(400)
//         .json({ message: "No data to be desplayed"})
//     }
//     return res.status(200)
//     .json(likes.rows)
//     } catch (err) {
//         console.error( err.message )
//     }
// }

// // one like
// export const getOneLike = async ( req, res ) =>{
//     const { id } = req.params.id
//     if ( !id ) {
//         res.status(400)
//         .send("no ID provided")
//     }
//     try {
//         const query = await pool.query(
//             "SELECT * FROM like_per_building WHERE id = $1",
//             [id]
//         )
//         console.log(query)
//     if (query.rows.length === 0) {
//         return res.status(404)
//         .send("no like found")
//     }
//     return res.status(200)
//     .json(query.rows)
//     } catch ( err ) {
//         console.error(err.message)
//     }
// }
// // create like
// export const createLike = async ( req, res ) =>{
//     try {
//         const { building_id, user_id } = req.body
//         const newLike = await pool.query(
//             "INSERT INTO like_per_building ( building_id, user_id )  VALUES ( $1, $2 ) RETURNING *",
//             [ building_id, user_id]
//         )
//         res.json(newLike.rows[0])
//     } catch (err) {
//         console.error( err.message )
//     }
// }
// // delete like
// export const deleteLike = async ( req, res ) =>{
//     try {
//         const eraseLike = await pool.query(
//             "DELETE * FROM like_per_building WHERE id = $1"
//         )
//         res.json("U did remove your like")
//     } catch (err) {
//         console.error( err.message )
//     }
// }

export const toLike = async (req, res) => {
    const user_id = req.userId
    const building_id = req.params.buildingId

    try{
        const query = await pool.query('UPDATE like_per_building SET like = true WHERE user_id = $1 AND building_id = $2',
        [user_id, building_id]);
        res.status(200).json({ message: 'Like updated successfully' });
    }catch(error){
        console.error(error)
        return res.status(500).send({error: "internal server error"})
    }
}

export const getLike = async (req, res) => {
    const user_id = req.userId
    try{
        const query = await pool.query("SELECT * from like_per_building where user_id = $1 ",
        [user_id])
        return res.status(200).json({data: query})
    }catch(error){
        console.error(error)
    }
}