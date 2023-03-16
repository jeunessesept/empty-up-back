import { pool } from "../models/dbPool.mjs";

export const toLike = async (req, res) => {
  const user_id = req.userId;
  const building_id = req.params.buildingId;

  if (!user_id || !building_id) {
    return res.status(400).json({ error: "bad request" });
  }
  try {
    const query = await pool.query(
      "INSERT INTO like_per_building " +
        '(building_id, user_id, "like") ' +
        "VALUES ($1, $2, true) " +
        "ON CONFLICT (building_id, user_id) DO UPDATE SET " +
        '"like" = NOT EXCLUDED.like',
      [building_id, user_id]
    );
    let message;
    if (query.rowCount === 1) {
      message = "Building liked successfully";
    } else {
      message = `Building like status updated to ${query.rows[0].like}`;
    }
    return res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "internal server error" });
  }
};

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
};

export const getLikeWithBuildingsInfos = async (req, res) => {
  const user_id = req.userId;
  try {
    const query = await pool.query(
      "SELECT b.adress AS building_adress, " +
        "b.zipcode AS building_zipcode, " +
        "b.city AS building_city, " +
        "b.type AS building_type, " +
        "b.initial_image AS building_image, " +
        "l.like " +
        "FROM like_per_building l " +
        "JOIN buildings b ON l.building_id = b.id " +
        "WHERE l.user_id = $1",
      [user_id]
    );
    return res.status(200).json({ info: query.rows });
  } catch (error) {
    console.error(error);
  }
};
