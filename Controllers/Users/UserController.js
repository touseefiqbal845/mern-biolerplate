const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../../modals/User");
const { sanitizeUser } = require("../../services/common");
const {
  successResponse,
  errorResponse,
  responseHandler,
} = require("../../utils/responseHelper");
const { sendMail } = require("../../services/email/emailServices");

const createUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return responseHandler(res, {
        success: false,
        message: !email ? "Email is required" : "Password is required",
        statusCode: 400,
        error: !email ? "Missing email field" : "Missing password field",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler(res, {
        success: false,
        message: "User with this email already exists.",
        statusCode: 400,
      });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err) {
          return responseHandler(res, {
            success: false,
            message: "Error hashing password",
            statusCode: 500,
          });
        }

        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

       const verificationCodeExpires = Date.now() + 5 * 60 * 1000; 

        const user = new User({
          email,
          password: hashedPassword,
          salt,
          verificationCode,
          verificationCodeExpires,
          role: role,
          verified: false,
        });

        try {
          const doc = await user.save();

         const mailOptions = {
            to: doc.email,
            subject: "Your Verification Code - Astra Protocol",
            templateName: "verificationEmail",
            context: {
              code: verificationCode,
              year: new Date().getFullYear(),
              logoUrl:
                "https://d1k8z2xrei817b.cloudfront.net/images/logo/astra-protocol-2-fc7374c9.png",
            },
          };
          await sendMail(mailOptions);
          return responseHandler(res, {
            success: true,
            message:
              "User registered successfully. Please check your email for verification.",
            statusCode: 201,
            data: {
              isVerified: user.verified,
              email: user.email,
            },
          });
        } catch (error) {
          return next(
            responseHandler(res, {
              success: false,
              message: "Error saving user to the database.",
              statusCode: 500,
            })
          );
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return responseHandler(res, {
        success: false,
        message: !email ? "Email is required" : "Verification code is required",
        statusCode: 400,
        error: !email
          ? "Missing email field"
          : "Missing verification code field",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return responseHandler(res, {
        success: false,
        message: "User not found",
        statusCode: 400,
        error: "User with this email does not exist",
      });
    }

    if (user.verificationCode === verificationCode) {
      user.verified = true;
      user.verificationCode = "";
      await user.save();

      return responseHandler(res, {
        success: true,
        message: "Account verified successfully.",
        statusCode: 200,
      });
    }

    return responseHandler(res, {
      success: false,
      message: "Invalid verification code",
      statusCode: 400,
      error: "The verification code you entered is incorrect",
    });
  } catch (error) {
    next(error);
  }
};
const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return responseHandler(res, {
        success: false,
        message: "Email is required",
        statusCode: 400,
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return responseHandler(res, {
        success: false,
        message: "User not found",
        statusCode: 400,
      });
    }

    if (user.verified) {
      return responseHandler(res, {
        success: false,
        message: "Account is already verified. Please login.",
        statusCode: 400,
      });
    }

    const newVerificationCode = Math.floor(
      10000 + Math.random() * 90000
    ).toString();

    user.verificationCode = newVerificationCode;
    user.verificationCodeExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailOptions = {
      to: user.email,
      subject: "Your New Verification Code ",
      templateName: "verificationEmail",
      context: {
        code: newVerificationCode,
        year: new Date().getFullYear(),
        logoUrl:
          "https://d1k8z2xrei817b.cloudfront.net/images/logo/astra-protocol-2-fc7374c9.png",
      },
    };

    await sendMail(mailOptions);

    return responseHandler(res, {
      success: true,
      message: "A new verification code has been sent to your email.",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const user = req.user;
    const sanitizedUser = sanitizeUser(user);
    const message = user.message || "Login successful";

    const token = jwt.sign(sanitizedUser, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 3600000),
      httpsOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: "Strict",
    });

    await sendMail({
      to: user.dataValues.email,
      subject: "Login Alert",
      templateName: "loginAlert",
      context: {
        userName: user.dataValues.email || "User",
        time: new Date().toLocaleString(),
        ipAddress: "Unknown IP",
        location: "Unknown location",
        year: new Date().getFullYear(),
        logoUrl:
          "https://d1k8z2xrei817b.cloudfront.net/images/logo/astra-protocol-2-fc7374c9.png",
      },
    });

    return responseHandler(res, {
      success: true,
      message: message,
      data: sanitizedUser,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "PRODUCTION",
      sameSite: "Strict",
    });
    return responseHandler(res, {
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

const checkAuth = async (req, res, next) => {
  try {
    if (req.user) {
      responseHandler(res, {
        message: "User authenticated",
        data: sanitizeUser(req.user),
      });
    }
  } catch (error) {
    next(error);
  }
};

const resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return responseHandler(res, {
        success: false,
        message: "User not found.",
        statusCode: 400,
      });
    }

    const token = crypto.randomBytes(48).toString("hex");
    user.resetPasswordToken = token;
    await user.save();

    const resetPage = `http://localhost:3000/reset-password?token=${token}&email=${email}`;

    await sendMail({
      to: email,
      subject: "Password Reset Request - Astra Protocol",
      templateName: "resetPasswordRequest",
      context: {
        resetPage,
        year: new Date().getFullYear(),
        logoUrl:
          "https://d1k8z2xrei817b.cloudfront.net/images/logo/astra-protocol-2-fc7374c9.png",
      },
    });

    return responseHandler(res, {
      success: true,
      message: "Password reset link sent successfully.",
      statusCode: 200,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, password, token } = req.body;

    const user = await User.findOne({ email, resetPasswordToken: token });

    if (!user) {
      return responseHandler(res, {
        success: false,
        message: "Invalid token or email",
        statusCode: 400,
      });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err) {
          return responseHandler(res, {
            success: false,
            message: "Error hashing password",
            statusCode: 500,
          });
        }

        user.password = hashedPassword;
        user.salt = salt;
        user.resetPasswordToken = null;
        await user.save();

        await sendMail({
          to: email,
          subject: "Password Reset Successful - Astra Protocol",
          templateName: "resetPasswordSuccess",
          context: {
            year: new Date().getFullYear(),
            logoUrl:
              "https://d1k8z2xrei817b.cloudfront.net/images/logo/astra-protocol-2-fc7374c9.png",
          },
        });

        return responseHandler(res, {
          success: true,
          message: "Password reset successfully.",
          statusCode: 200,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  verifyEmail,
  loginUser,
  logout,
  checkAuth,
  resetPasswordRequest,
  resendVerificationCode,
  resetPassword,
};
