import express from 'express';
import bodyParser from "body-parser";
import router from './router/user/userRouter.js';
import policeRouter from './router/police/policeRouter.js';
import hospitalRouter from './router/hospital/hospitalRouter.js';


const app = express();
const { json, urlencoded } = bodyParser;

app.use(json());
app.use(urlencoded({ extended: true }));

app.use(router);
app.use(policeRouter);
app.use(hospitalRouter);

export default app;