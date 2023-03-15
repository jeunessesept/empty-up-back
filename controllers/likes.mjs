import { pool } from "../models/dbPool.mjs";

export const toLike = async (req, res) => {
  const user_id = req.userId;
  const building_id = req.params.buildingId;
  try {
    const queryCheck = await pool.query(
      "SELECT * FROM like_per_building WHERE building_id = $1 AND user_id = $2",
      [building_id, user_id]
    );
    if (queryCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO like_per_building (building_id, user_id, "like") VALUES ($1, $2, true)',
        [building_id, user_id]
      );
      return res.status(200).json({ message: "like inserted successfully" });
    } else if (queryCheck.rows[0].like === true) {
      await pool.query(
        'UPDATE like_per_building SET "like" = false WHERE building_id = $1 AND user_id = $2',
        [building_id, user_id]
      );
      return res.status(200).json({ message: "like updated to false" });
    } else if (queryCheck.rows[0].like === false) {
      await pool.query(
        'UPDATE like_per_building SET "like" = true WHERE building_id = $1 AND user_id = $2',
        [building_id, user_id]
      );
      return res.status(200).json({ message: "like updated to true" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "internal server error" });
  }
}


export const getLike = async (req, res) => {
  const user_id = req.userId;
  try {
    const query = await pool.query(
      "SELECT * from like_per_building where user_id = $1 ",
      [user_id]
    );
    return res.status(200).json({ data: query.rows });
  } catch (error) {
    console.error(error);
  }
}

export const getLikeWithBuildingsInfos = async (req, res) => {
    const user_id = req.userId;
    try{
       const query = await pool.query(
        'SELECT b.adress AS building_adress, ' +
        'b.zipcode AS building_zipcode, ' +
        'b.city AS building_city, ' +
        'b.type AS building_type, ' +
        'b.initial_image AS building_image, ' +
        'l.like ' +
        'FROM like_per_building l ' +
        'JOIN buildings b ON l.building_id = b.id ' + 
        'WHERE l.user_id = $1',
        [user_id]
       );
    return res.status(200).json({info: query.rows})
    }catch(error){
        console.error(error)
    }
}
