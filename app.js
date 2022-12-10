//Dependendies
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
require("./helpers/init__mongoDB");

//Scafolding
const AuthRoute = require("./Routes/Auth.route");
const { verifyAccessToken } = require("./helpers/jwt_helper");
const User = require("./Moduls/User.model");

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", verifyAccessToken, async (req, res, next) => {
  // const user = await User.findById(req.payload.aud);
  // console.log(user);
  res.send({ credential: true });
});

app.use("/auth", AuthRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist"));
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening on Port ${PORT}`);
});
