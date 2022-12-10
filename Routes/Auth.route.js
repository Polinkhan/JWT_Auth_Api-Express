const express = require("express");
const createError = require("http-errors");
const router = express.Router();
const User = require("../Moduls/User.model");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");

router.post("/register", async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(`${result.email} already being registerd`);
    const user = new User(result);
    const saveUser = await user.save();
    const accessToken = await signAccessToken(saveUser.id);
    const refreshToken = await signRefreshToken(saveUser.id);

    res.send({ accessToken, refreshToken });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });

    if (!user) throw createError.NotFound("Email Not Found");

    const isMatch = await user.isValidPassword(result.password);

    if (!isMatch) throw createError.Unauthorized("Password not valid");

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    res.send({ accessToken, refreshToken });
  } catch (err) {
    if (err.isJoi) return next(err);
    // return next(createError.BadRequest("Invalid Username/Password"));
    next(err);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    console.log(req.body);
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const newAccessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    res.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

router.delete("/logout", async (req, res, next) => {
  res.send("logout Route");
});

module.exports = router;
