const bcrypt = require("bcryptjs");
const HttpError = require("../http-errors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Product = require("../models/product");
const { default: mongoose } = require("mongoose");
const { decryptPassword } = require("../middleware/passwordCrypto");

let transporter = nodemailer.createTransport({
  port: 465,
  host: "mail.vadaszhirdeto.hu",
  service: "vadaszhirdeto",
  secure: true,
  auth: {
    user: "info@vadaszhirdeto.hu",
    pass: "Makoslaska22",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateRandomString = (myLength) => {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};

const createUser = async (req, res, next) => {
  const { name, email, password, telephone } = req.body;
  let isEmailExists;

  try {
    isEmailExists = await User.findOne({ email: email });
  } catch (err) {
    return res
      .status(409)
      .json({ msg: "Valami hiba történt. Próbáld újra később." });
  }

  if (isEmailExists) {
    return res.status(409).json({ msg: "Ez az email cím már foglalt!" });
  }

  const decryptedPassword = decryptPassword(password, process.env.PASSWORD_SECRET_KEY);
  const encryptedPassword = await bcrypt.hash(decryptedPassword, 10);

  const newUser = new User({
    name: name,
    email: email.toLowerCase(),
    password: encryptedPassword,
    telephone: telephone,
  });

  try {
    const response = await newUser.save();

    const mailOptions = {
      from: process.env.EMAIL_TEST,
      to: response.email,
      subject: "Regisztráció megerősítése",
      text: `Ezt az emailt azért küldjük, mert regisztráltál a Vadászbörze oldalunkra. 

A regisztráció megerősítéséhez, kattints az alábbi linkre: ${process.env.BASE_URL}activation/${response._id.toString()}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(200).json({
      msg: "Sikeres regisztráció! Az aktiváló linket elküldtük az email címedre!",
    });
  } catch (err) {
    return res
      .status(400)
      .json({ msg: "Valami hiba történt! Próbáld meg később!" });
  }
};

const resendEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(404).json({ msg: "A felhasznaló nem található" });

    const mailOptions = {
      from: process.env.EMAIL_TEST,
      to: user.email,
      subject: "Regisztráció megerősítése",
      text: `Ezt az emailt azért küldjük, mert regisztráltál a Vadászbörze oldalunkra. A regisztráció megerősítéséhez, kattints az alábbi linkre: ${process.env.BASE_URL}activation/${user._id.toString()}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ msg: "Valami hiba történt! Próbáld meg később!" });
  }
};

const activation = async (req, res, next) => {
  try {
    let objectId = mongoose.Types.ObjectId(req.params.uuid);
    const user = await User.findById(objectId);

    if (!user)
      return res.status(404).json({ msg: "A felhasznaló nem található" });

    user.activated = true;
    await user.save();
    return res.status(200).json({ msg: "Sikeres megerősítés!" });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ msg: "Valami hiba történt! Próbáld meg később!" });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const decryptedPassword = decryptPassword(password, process.env.PASSWORD_SECRET_KEY);
   
    const user = await User.findOne({ email: email });

    if (!user)
      return res.status(404).json({ msg: "Helytelen bejelentkezési adatok!" });

    if (user.activated === false)
      return res.status(404).json({
        msg: "Az email cím nincs aktiválva! Vedd fel velünk a kapcsolatot!",
      });

    if (user && (bcrypt.compare(decryptedPassword, user.password))) {
      const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
        expiresIn: "2h",
      });

      user.token = token;
      await user.save();
      req.session.jwt = token;

      res.status(200).json({
        user: { uuid: user.uuid, name: user.name, email: user.email },
      });
    } else {
      return res.status(404).json({ msg: "Helytelen bejelentkezési adatok" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Sikertelen bejelentkezés. Próbáld később." });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user)
      return res.status(404).json({ msg: "A felhasználó nem talalható" });

      const password = generateRandomString(7);
      const encryptedPassword = await bcrypt.hash(password, 10);

      user.password = encryptedPassword;
      await user.save();

      const mailOptions = {
        from: process.env.EMAIL_TEST,
        to: user.email,
        subject: "Új jelszó kérése",
        text: `Ezt az email azért küldjök, mert a vadáazbörze oldalunkon új jelszót igényeltél.
      
      Az új jelszavad: ${password} 
      
Ha szeretnéd, a bejelentkezés után megváltoztathatod az új jelszavad a profil adataidnál.`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

      return res
        .status(200)
        .json({ msg: "Az új jelszó elküldve a megadott email címedre!" });
    
  } catch (error) {
    return res
    .status(400)
    .json({ error });
  }
};

const checkToken = async (req, res, next) => {
  if (!req.session.jwt) {
    return res.status(401).json({ SessionMsg: "Kérlek jelentkezz be!" });
  }
  let decodedId;
  try {
    decodedId = jwt.verify(req.session.jwt, process.env.TOKEN_KEY);
  } catch (err) {
    return res
      .status(402)
      .send({ SessionmMsg: "Nincs jogosultságod! Kérlek, jelentkezz be!" });
  }

  const user = await User.findOne({ _id: decodedId.user_id }, ["-password"]);

  if (!user)
    return res.status(404).json({ SessionMsg: "A felhasználó nem található" });
  res.status(200).json({ user });
};

const logout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Oops..Valami hiba történt." });
    res.status(200).json({ msg: "Kijelentkezve!" });
  });
};

const getAllUsers = async (req, res) => {
  try {
    let users = await User.find({}, ["-password"]);
    res.send(users);
  } catch (err) {
    console.log(err);
  }
};

const getOneUserById = async (res, req) => {
  try {
    let id = req.params.id;
    let user = await User.findOne({ id: id });
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.uuid);

    if (!user)
      return res.status(404).json({ msg: "A felhasznaló nem található" });

    if (user._id.equals(req.userId)) {
      user.name = req.body.name ?? user.name;
      user.telephone = req.body.telephone ?? user.telephone;

      if (req.body.newpassword) {
        if (await bcrypt.compare(req.body.oldpassword, user.password)) {
          const encryptedPassword = await bcrypt.hash(req.body.newpassword, 10);
          user.password = encryptedPassword;
        } else {
          return res
            .status(404)
            .json({ msg: "A régi jelszó nem jól lett megadva!" });
        }
      }

      await user.save();
      return res.status(200).json({ msg: "Sikeresen módosítva!" });
    }

    return res.status(400).json({ msg: "Nincs jogosultsagod" }); 
  } catch (err) {
    return res.status(400).json({ msg: "Oops..Valami hiba történt." });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.uuid);

    await Product.remove({
      user: user._id,
    });

    await user.remove();
    res.status(200).send({ msg: "A profil törölve!" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createUser,
  loginUser,
  resendEmail,
  activation,
  checkToken,
  logout,
  getAllUsers,
  getOneUserById,
  updateUser,
  deleteUser,
  resetPassword,
};
