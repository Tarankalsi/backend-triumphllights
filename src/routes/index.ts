import express from "express"
import userRouter from "./user";
import productRouter from "./product";
import adminRouter from "./admin";
import { getObjectURL } from "../utils/s3";
import { json } from "stream/consumers";
import { upload } from "../middleware/multer.middleware";
import { deleteCartSchedular } from "../utils/schedular";
import orderRouter from "./order";
import webhookRouter from "./webhook";
import { sendEmailBrevo } from "../utils/sendEmail";

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/product", productRouter);
mainRouter.use("/admin", adminRouter);
mainRouter.use("/order", orderRouter);
mainRouter.use("/webhook", webhookRouter);

mainRouter.post('/', async (req, res) => {
    const body = req.body;
    sendEmailBrevo(body.toEmail)
    return res.status(200).json({
        message:"Email sent"
    })
})

deleteCartSchedular()

export default mainRouter