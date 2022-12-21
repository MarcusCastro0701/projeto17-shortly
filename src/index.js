import express from "express";
import cors from "cors";

//Routes
import userRoute from "./routes/userRoute.js"
import sessionsRoute from "./routes/sessionsRoute.js"
//

//Configs App
const app = express();

app.use(cors());
app.use(express.json());

app.use(userRoute);
app.use(sessionsRoute);
//



const port = 5000;
app.listen(port, () => console.log(`Server running in port: ${port}`));