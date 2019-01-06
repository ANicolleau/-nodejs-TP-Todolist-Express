
const database = require('sqlite')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080
const date = Date()
const pug = require('pug')
const methodOverride = require('method-override')
const bcrypt = require('bcrypt')
const saltRounds = 10;

app.set('views', './views')
app.set('view engine','pug')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(methodOverride('_method'))


// MISE EN PLACE DE LA DB
database.open('todolist.db').then(() =>
{
    console.log('Database is ready')
    return database.run(`CREATE TABLE IF NOT EXISTS todos(id integer PRIMARY KEY AUTOINCREMENT, userid integer NOT NULL, message text NOT NULL, completion text, createAt , updatedAt)`)
})
.then(() => 
{
    console.log('Table todos ready')
    return database.run(`CREATE TABLE IF NOT EXISTS users(id integer PRIMARY KEY AUTOINCREMENT, firstname text NOT NULL, lastname text NOT NULL, username text NOT NULL, password, email, createAt , updatedAt)`)
})
.then(()=>{
    console.log('Table users ready')
})
.catch(() => console.log('Erreur'))

// Fonction pour hash mdp
/*async function hashPassword (user) {

    const password = user.password
    const saltRounds = 10;
  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
  
    return hashedPassword
}*/

app.all('*',(req, res, next)=>{
    next()
})

// Afficher les todos de 1 utilisateur
app.get('/users/:id/todos',async (req, res, next)=>{
    try{
        getResult = await database.all(`SELECT * FROM todos LEFT JOIN users ON todos.userid = users.id WHERE users.id = ${req.params.id} `)
        res.format({
            html: function(){
                res.render(
                    'todos/index',
                    {
                        name:'USERS/:ID/todos',
                        todos: getResult,
                        params:'userid'
                    }
                )
            },
            
            json: function(){
                res.json({ getResult});
            },
        })
    }catch(err){
        console.log(err)
    }
})


// Redirection vers /TODOS
app.get('/', async (req, res, next) =>{
    try{
        res.redirect('/todos')
    }
    catch(err){
        console.log(err)
    }
})



// Ajoute une TODO
app.post('/todos', async (req, res, next)=>{
    try{
        pushResult = await database.run('INSERT INTO todos(userid, message, completion, createAt, updatedAt) VALUES (?,?,?,?,?);', req.body.userid, req.body.message, req.body.completion, date, date)
        res.format({
            html:function(){
                res.redirect('/todos')
            },
            json:function(){
                res.json({nom : 'Success'})
            }
        })
        
    }
    catch(err){
        console.log(err)

    }
})

// Ajoute un user
app.post('/users', async (req, res, next)=>{
    try{
        pushResult = await database.run('INSERT INTO users(firstname, lastname, username, password, email, createAt, updatedAt) VALUES (?,?,?,?,?,?,?);', req.body.firstname, req.body.lastname, req.body.username, req.body.password, req.body.email, date, date)
        res.format({
            html:function(){
                res.redirect('/users')
            },
            json:function(){
                res.json({nom : 'Success'})
            }
        })
        
    }
    catch(err){
        console.log(err)

    }
})

// Accés à la page HTML pour ajouter une TODO
app.get('/todos/add',async(req,res,next) =>{
    try{
        getResult = await database.all('SELECT * FROM users')
        res.format({
            html: function(){
                res.render(
                    'todos/edit',
                    {
                        title: 'TP Express',
                        name: 'Ajouter une Todo',
                        params: 'todopost',
                        users: getResult
                    }
                )
              }
        })
    }
    catch(err){
        console.log(err)
    }
})

// Accés à la page HTML pour ajouter un user
app.get('/users/add',async(req,res,next) =>{
    try{
        res.format({
            html: function(){
                res.render(
                    'todos/edit',
                    {
                        title: 'TP Express',
                        name: 'Ajouter un User',
                        params: 'userpost'
                    }
                )
              }
        })
    }
    catch(err){
        console.log(err)
    }
})

// accés à la âge html pour modifier une todo
app.get('/todos/:id/edit',async(req,res,next) =>{
    try{
        const getResult = await database.get(`SELECT * FROM todos WHERE id = ?`, req.params.id)
        res.format({
            html: function(){
                res.render(
                    'todos/edit',
                    {
                        title: 'TP Express',
                        name: '/EDIT',
                        todos: getResult,
                        params: 'todoput'
                    }
                )
              }
        })
    }
    catch(err){
        console.log(err)
    }
})

// accés à la âge html pour modifier un user
app.get('/users/:id/edit',async(req,res,next) =>{
    try{
        const getResult = await database.get(`SELECT * FROM users WHERE id = ?`, req.params.id)
        res.format({
            html: function(){
                res.render(
                    'todos/edit',
                    {
                        title: 'TP Express',
                        name: '/EDIT',
                        users: getResult,
                        params: 'userput'
                    }
                )
              }
        })
    }
    catch(err){
        console.log(err)
    }
})

// récupérer todo selon id
app.get('/todos/:id', async (req, res, next) =>{
    try{
        const getResult = await database.get(`SELECT * FROM todos WHERE id = ?`, req.params.id)
        res.format({
            html: function(){
                res.render(
                    'todos/show',
                    {
                        name:'TODOS/:ID',
                        todos: getResult,
                        params:'todos'
                    }
                )
              },
            
            json: function(){
                res.json({ getResult});
            },
        })
    }catch(err){
        console.log(err)
    }
})

// récupérer user selon id
app.get('/users/:id', async (req, res, next) =>{
    try{
        const getResult = await database.get(`SELECT * FROM users WHERE id = ?`, req.params.id)
        res.format({
            html: function(){
                res.render(
                    'todos/show',
                    {
                        name:'USERS/:ID',
                        users: getResult,
                        params:'users'
                    }
                )
              },
            
            json: function(){
                res.json({ getResult});
            },
        })
    }catch(err){
        console.log(err)
    }
})

// récupérer toute les todos de todos
app.get('/todos', async (req, res, next) =>{

    try{
        let string = ''
        let limit = req.query.limit
        let offset = req.query.offset
        let completion = req.query.completion

        if(limit != null && offset != null){
            string = ' LIMIT ' + limit +  ' OFFSET ' + offset
        }
        else if(limit == null && offset != null){
            let limit = 2
            string = ' LIMIT '+ limit + ' OFFSET ' + offset
        }
        else if(limit != null && offset == null){
            string = ' LIMIT '+ limit
        }
        else if(completion != null){
            string = 'WHERE completion = ' + completion
        }
        let getResult = await database.all(`SELECT * FROM todos `+string)
        
        res.format({
            html: function(){
                res.render(
                    'todos/index',
                    {
                        title: 'TP Express',
                        name:'TP Express -- Todos',
                        todos: getResult,
                        params: 'todos'
                    }
                )
              },
            
              json: function(){
                res.json({ getResult});
              },
        })        
    }
    catch(err){
        console.log(err)
    }
})

// récupérer les todos de users
app.get('/users', async (req, res, next) =>{

    try{
        let string = ''
        let limit = req.query.limit
        let offset = req.query.offset
        let completion = req.query.completion

        if(limit != null && offset != null){
            string = ' LIMIT ' + limit +  ' OFFSET ' + offset
        }
        else if(limit == null && offset != null){
            let limit = 2
            string = ' LIMIT '+ limit + ' OFFSET ' + offset
        }
        else if(limit != null && offset == null){
            string = ' LIMIT '+ limit
        }
        else if(completion != null){
            string = 'WHERE completion = ' + completion
        }
        let getResult = await database.all(`SELECT * FROM users `+string)
        
        res.format({
            html: function(){
                res.render(
                    'todos/index',
                    {
                        title: 'TP Express',
                        name:'TP Express -- Users',
                        users: getResult,
                        params: 'users'
                    }
                )
              },
            
              json: function(){
                res.json({ getResult});
              },
        })        
    }
    catch(err){
        console.log(err)
    }
})

// Supprimer une todo par son id
app.delete('/todos/:id', async(req, res, next) =>{
    try{
        const getResult = await database.get('DELETE FROM todos WHERE id = ?', req.params.id)
        res.format({
            html:function(){
                res.redirect('/todos')
            },
            json:function(){
                res.json({nom : 'Success'})
            }
        })
    }
    catch(err){
        console.log(err)

    }
})

// supprimer user
app.delete('/users/:id', async(req, res, next) =>{
    try{
        const getResult = await database.get('DELETE FROM users WHERE id = ?', req.params.id)
        res.format({
            html:function(){
                res.redirect('/users')
            },
            json:function(){
                res.json({nom : 'Success'})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// Modifier une todo 
app.put('/todos/:id', async(req, res, next) =>{
    try{
        let string = ''

        if(req.body.message != null){
            string = `message= '${req.body.message}', `
        }
        if(req.body.completion != null){
            string +=`completion= '${req.body.completion}',`
        }
        const getResult = await database.get(`UPDATE todos SET ${string} updatedAt="${date}"  WHERE id=${req.params.id}`)
        res.format({
            html:function(){
                res.redirect('/todos')
            },
            json:function(){
                res.json({nom : 'Success'})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

// modifier un user
app.put('/users/:id', async(req, res, next) =>{
    try{
        let string = ''

        if(req.body.firstname != null){
            string = `firstname= '${req.body.firstname}', `
        }
        if(req.body.lastname != null){
            string +=`lastname= '${req.body.lastname}',`
        }
        if(req.body.username != null){
            string +=`username= '${req.body.username}',`
        }
        if(req.body.password != null){
            string +=`password= '${req.body.password}',`
        }
        if(req.body.email != null){
            string +=`email= '${req.body.email}',`
        }
        const getResult = await database.get(`UPDATE users SET ${string} updatedAt="${date}"  WHERE id=${req.params.id}`)
        res.format({
            html:function(){
                res.redirect('/users')
            },
            json:function(){
                res.json({nom : 'Success'})
            }
        })
    }
    catch(err){
        console.log(err)
    }
})

app.use((err, req, res, next)=>{
    console.log('Here is the error : ', err)
})

app.use(function(req, res, next) {
    res.status(404).send('404 not found');
});


app.listen(PORT,()=>{
    console.log('Serveur sur port :', PORT)
})
