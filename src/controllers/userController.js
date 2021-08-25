import userDB from "../models/user";
import videoDB from "../models/video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { name, password, password2, email, location } = req.body;
  const exists = await userDB.exists({ email });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "This email already exists.",
    });
  }
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "Password confirmation doesn't match.",
    });
  }
  try {
    await userDB.create({
      name,
      password,
      email,
      location,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .render("join", { pageTitle: "Join", errorMessage: "Creation failed." });
  }
  res.redirect("/login");
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Log in" });

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await userDB.findOne({ email });
  if (!user) {
    return res.render("login", {
      pageTitle: "Login",
      errorMessage: "The email or the password is incorrect.",
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "The account or the password is incorrect.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const userEmails = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const verifiedPrimaryEmailObj = userEmails.find(
      (email) => email.primary === true && email.verified === true
    );
    const emailExists = await userDB.exists({
      email: verifiedPrimaryEmailObj.email,
    });
    if (!emailExists) {
      const user = await userDB.create({
        email: `${verifiedPrimaryEmailObj.email}`,
        name: userData.name ? `${userData.name}` : "Unknown",
        password: "tempPass",
      });
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/users/github/logged_in");
    }
    const user = await userDB.findOne({
      email: verifiedPrimaryEmailObj.email,
    });
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/");
  }
};

export const successGithubLogin = (req, res) => {
  res.render("githubLogin", { pageTitle: "Logged In" });
};

export const getEditProfile = (req, res) => {
  res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEditProfile = async (req, res) => {
  const { newName, newLocation } = req.body;
  const { file } = req;
  if (req.session.user.name !== newName) {
    const isNewNameInDB = await userDB.exists({ name: newName });
    if (isNewNameInDB) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This name already exists.",
      });
    }
  }
  const updatedUser = await userDB.findOneAndUpdate(
    { _id: req.session.user._id },
    {
      avatarUrl: file ? file.location : req.session.user.avatarUrl,
      name: newName,
      location: newLocation,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit-profile");
};

export const getLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

export const getChangePassword = (req, res) => {
  return res.render("change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const { curPass, newPass, newPass2 } = req.body;
  const curUser = req.session.user;
  const isPassMatching = await bcrypt.compare(curPass, curUser.password);

  if (!isPassMatching) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "You have input a wrong password.",
    });
  }
  if (newPass !== newPass2) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "Password confirmation doesn't match.",
    });
  }
  req.session.user = await userDB.findOneAndUpdate(
    { _id: curUser._id },
    { password: await bcrypt.hash(newPass, 5) },
    { new: true }
  );
  // notification
  return res.redirect("/");
};

export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  const user = await userDB.findById(id);
  const videos = await videoDB.find({ owner: user._id }).populate("owner");
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }
  return res.render("profile", { pageTitle: user.name, user, videos });
};
