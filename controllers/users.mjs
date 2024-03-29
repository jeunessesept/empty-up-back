import e from "express";
import { pool } from "../models/dbPool.mjs";
import bcrypt, { hash } from "bcrypt";
import JWT from "jsonwebtoken";
import { promisify } from "util";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

const sign = promisify(JWT.sign);

dotenv.config();

export const register = async (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  if (!email || !password || !username)
    return res.status(400).send({ error: "invalid request" });
  
  const check = await pool.query("SELECT * FROM users where username = $1 OR email = $2", 
  [username, email])
  const arr = check.rows
  if(arr.length != 0){
    return res.status(400).send({error: 'username or email already registered'})
  }
  
  if(password.length < 8){
    return res.status(400).send({error: 'password needs to be at least 8 characters long'})
  }

  if (password !== confirm_password) {
    return res.status(400).send({ error: "passwords do not match" });
  }

  if (!password || !confirm_password) {
    return res
      .status(400)
      .send({ error: "password or confirm password is not provided" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `insert into users (username, email, password) values ($1, $2, $3)`,
      [username, email, hashedPassword]
    );
    return res.send({ info: "user succesfully added" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ error: "invalid request" });

  const query = await pool.query(
    "select username, id, email, password from users where email =$1",
    [email]
  );

  if (query.rowCount === 0) {
    return res.status(404).send({ error: "user do not exists" });
  }

  const result = query.rows[0];

  const match = await bcrypt.compare(password, result.password);
  if (match) {
    try {
      const token = await sign(
        { id: result.id, email: email },
        process.env.SECRET_JWT,
        {
          algorithm: "HS512",
          expiresIn: "1h",
        }
      );
      console.log(token)
      // return res.send({ token });  => it works when asking to response send the token, but "cannot generate" when sending to the cookie
      res.cookie("access_token", token, {
        httpOnly: true,
      });
     return res.send({ id: `${result.id}` });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Cannot generate token" });
    }
  } else {
    return res.status(403).send({ error: "wrong password" });
  }
};

export const uploadProfilPicture = async (req, res) => {
  const file = await req.files.image;
  console.log(file)
  console.log(req)
  if (!file) {
    res.status(500).json({ error: "file missing" });
  }

  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    const picture_url = result.secure_url;
    console.log(result.secure_url);
    const user_id = req.userId;
    await pool.query("UPDATE users SET profilpicture_url = $1 WHERE id = $2", [
      picture_url,
      user_id,
    ]);
    return res
      .status(201)
      .send({ info: "profil picture successfully uploaded" });
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

export const getInfoUsers = async (req, res) => {
  const user_id = req.userId  
  try {
    const userInfo = await pool.query(
      "SELECT id, username, profilpicture_url FROM users where id =$1",
      [user_id]
    );
    if (!userInfo.rows[0]) {
      return res.status(404).json({ error: "user not found" });
    }
    
    return res
    .json({ data: userInfo.rows[0]});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server error" });
  }
};


export const unsubscribeUser = async (req, res) => {
  const id = req.userId;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ error: "user not found" });
    }
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return res.status(200).send({ message: "successfully unsubscribed" });
  } catch (error) {
    res.status(500).send({ error: "Internal server error" });
  }
};



export const logout = (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out" });
};
