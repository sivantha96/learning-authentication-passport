const   express                   = require("express"),
        mongoose                  = require('mongoose'),
        passport                  = require('passport'),
        bodyParser                = require('body-parser'),
        LocalStrategy             = require('passport-local'),
        passportLocalMongoose     = require('passport-local-mongoose'),
        User                      = require("./models/user"),
        expressSession            = require("express-session")

mongoose.connect("mongodb://localhost/authentication",{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
}) 

const app = express()
app.use(expressSession({
    secret: "Campground secret",
    resave: false,
    saveUninitialized: false
}))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", function(req, res){
    res.render("home")
})

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret")
})

// AUTH ROUTES
app.get("/signup", function(req, res){
    res.render("signup")
})

app.post("/signup", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            return res.render("signup")
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secret")
            })
        }
    })
})

// LOGIN ROUTES
app.get("/login", function(req, res){
    res.render("login")
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}),function(req, res){

})

// LOGOUT ROUTES
app.get("/logout", function(req, res){
    req.logout()
    res.redirect("/")
})

function isLoggedIn(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect("/login")
    }
}

app.listen(3000, function(err){
    if (err) {
        console.log(err);
    } else {
        console.log("server is listening on port 3000");
    }
})