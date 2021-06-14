const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

// google auth
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = "1082707602741-aubspr02ko22cpfplo47lah08ugfpebd.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 8000;

// middleware

app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.render("login")
});

app.post("/login", (req, res) => {
    let token = req.body.token;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

    }
    verify()
        .then(() => {
            res.cookie('session-token', token);
            res.send("success");
        }).catch(console.error);
});

app.get("/dashbord", checkAuthentication, (req, res) => {
    let user = req.user;
    res.render("dashbord", { user })
});

app.get("/protectedroute", (req, res) => {
    res.render("protectedroute");
});

app.get("/logout", (req, res) => {
    res.clearCookie('session-token');
    res.redirect("/logout");
});

function checkAuthentication(req, res, next) {
    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            res.redirect("/login");
        });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})