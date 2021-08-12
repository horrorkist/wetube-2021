import userModel from "../models/user";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { name, password, password2, email, location } = req.body;
  const exists = await userModel.exists({ email });
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
    await userModel.create({
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
  const user = await userModel.findOne({ email });
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
  console.log(user);
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
    const emailExists = await userModel.exists({
      email: verifiedPrimaryEmailObj.email,
    });
    if (!emailExists) {
      const user = await userModel.create({
        email: `${verifiedPrimaryEmailObj.email}`,
        name: userData.name ? `${userData.name}` : "Unknown",
        password: "tempPass",
      });
      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/users/github/logged_in");
    }
    const user = await userModel.findOne({
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

export const edit = (req, res) => res.send("User edit");
export const getLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};
