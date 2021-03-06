// Carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require("mongoose")
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
//Config
    //Sessao
        app.use(session({
          secret: "cursodenode",
          resave: true,
          saveUninitialized: true
        }))
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
          res.locals.success_msg = req.flash("success_msg")
          res.locals.error_msg =  req.flash("error_msg")
          next()
        })
    //Body Parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    //Handlebars
        app.engine('handlebars', handlebars.engine())
        app.set('view engine', 'handlebars')
        app.set("views", "./views")
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
          console.log("Conectado ao mongo")
        }).catch((err) => {
          console.log("Erro ao se conectar ao mongo: "+err)
        })
    //Public
        app.use(express.static(path.join(__dirname,"public")))
//Routes
    app.get('/', (req,res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req,res) => {
        const slug = req.params.slug
        Postagem.findOne({slug}).then((postagem) => {
            if(postagem){
                const post = {
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo
                }
                res.render("postagem/index", post)
            }else{
                req.flash("error_msg", "Esta postagem n??o existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get('/404',(req,res) => {
        res.send("Erro 404!")
    })
    app.get('/posts', (req,res) => {
        res.send("Lista de posts")
    })
    app.use('/admin', admin)
const PORT = 8081 
app.listen(PORT,() => {
    console.log("Servidor rodando")
})

