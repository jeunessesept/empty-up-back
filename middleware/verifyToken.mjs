import JWT from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { promisify } from "util";

promisify(JWT.verify);

// middleware pour l'authentification du token
const jwtAuthentification = async (req, res, next) => {
  const token = await req.cookies.access_token;
  if (!token) {
    return res.status(401).send({ error: "authorized first" });
  }
  try{
  const data = JWT.verify(token, process.env.SECRET_JWT)
  req.userId = data.id
  return next();
  }catch{
    return res.status(403)
  }
  
};

export default jwtAuthentification;
