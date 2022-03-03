const express = require('express');
const users = require('./data/agentes.js').results;
const app = express();

const jwt = require("jsonwebtoken");

const secretKey = process.env["SECRET_KEY"]

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get('/SignIn', (req, res) => {
    const { email, password } = req.query;
    const user = users.find((u) => u.email == email && u.password == password);
    if (user) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: user,
            },
            secretKey
        );
        res.send(`
        <a href="/Dashboard?token=${token}"> <p> Ir al Dashboard </p> </a>
        Bienvenido, ${email}.
        <script>
        localStorage.setItem('token', JSON.stringify("${token}"))
        </script>
        `);
    } else {
        res.send("Usuario o contraseña incorrecta");
    }
});

const verificar = (req, res, next) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            res.status(401).send({
                error: "401 No Autorizado",
                message: err.message,
            })
        } else {
            req.user = decoded
            next()
        };
    })};

    app.get("/RutaRestringida", verificar, (req, res) => {
    res.send(`Bienvenido ${req.user.data.email}`);
});

app.listen(3000, () => console.log('Servidor encendido en el puerto 3000'))