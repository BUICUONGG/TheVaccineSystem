import jwt from "jsonwebtoken";
import { config } from "dotenv";
// import { TokenPayload } from "../models/requests/Users.request";
config();

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: "HS256" },
}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) return reject(error);
      resolve(token);
    });
  });
};
// hàm kiểm tra token có phải của mình tạo r akhông ? nếu cos thì trả ra payload
export const verifyToken = ({ token, secredOrPublickey }) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secredOrPublickey, (error, decoded) => {
      if (error) return reject(error);
      resolve(decoded);
    });
  });
};
