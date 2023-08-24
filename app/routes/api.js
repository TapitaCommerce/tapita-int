import express from "express";
import APIcontroller from '../routes/APIcontroller'
let router = express.Router();

const initAPIRouter = (app) =>{
   router.get('/Users', APIcontroller.getAllUsers);
    return app.use("/api", router); 
}
export default initAPIRouter;