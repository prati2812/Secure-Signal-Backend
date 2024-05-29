import  jwt from "jsonwebtoken";
import { secret_key } from "../config.js";



export const authentication = async(req,res,next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    jwt.verify(token, secret_key ,(err) => {
        if(err){
            return res.status(401).json({ message: 'Unauthorized' }); 
        }

        next();
    })

}

