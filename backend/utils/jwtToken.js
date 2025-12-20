export const sendToken = (user, statusCode, res, message) => {
  const token = user.getJWTToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.SECURE_COOKIE === "true", // REQUIRED: Ensures cookie is sent over HTTPS
    sameSite: process.env.SECURE_COOKIE === "true" ? "None" : "Lax", // REQUIRED: Allows Cross-Site (Vercel -> Render) cookies
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    message,
    token,
  });
};