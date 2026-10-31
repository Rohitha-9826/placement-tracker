const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'change-this-secret',
    resave: false,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req,res) => {
    const { name, email, password } = req.body;
    try{
        const hash = bcrypt.hashSync(password,10);
        db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)')
            .run(name,email,hash);
        res.redirect('/login');
    } catch(err){
        res.render('register', { error: 'Email already registered' });
    }
});

app.get('/login', (req,res) => {
    res.render('login', {error: null});
});

app.post('/login', (req,res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if(user && bcrypt.compareSync(password, user.password_hash)){
        req.session.userId = user.id;
        res.redirect('/dashboard');
    }else{
        res.render('login',{error: 'Invalid email or password'});
    }
});


const STATUSES = ['Applies', 'Assessment', 'Interview', 'Offer', 'Rejected'];

function requireLogin(req,res,next){
    if(!req.session.userId){
        return res.redirect('/login');
    }
    next();
}

app.get('/dashboard', requireLogin, (req, res) => {
  const userId = req.session.userId;
  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId);

  const filter = STATUSES.includes(req.query.status) ? req.query.status : null;

  let applications;
  if (filter) {
    applications = db
      .prepare('SELECT * FROM applications WHERE user_id = ? AND status = ? ORDER BY id DESC')
      .all(userId, filter);
  } else {
    applications = db
      .prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY id DESC')
      .all(userId);
  }

  const rows = db
    .prepare('SELECT status, COUNT(*) AS count FROM applications WHERE user_id = ? GROUP BY status')
    .all(userId);

  const counts = {};
  STATUSES.forEach(s => { counts[s] = 0; });
  rows.forEach(r => { counts[r.status] = r.count; });

  res.render('dashboard', { user, applications, statuses: STATUSES, counts, filter });
});

app.post('/applications', requireLogin, (req,res) => {
    const { company, role, date_applied, status, notes } = req.body;
    const safeStatus = STATUSES.includes(status) ? status : 'Applied';

    db.prepare(
        'INSERT INTO applications (user_id,company,role,date_applied,status,notes) VALUES (?,?,?,?,?,?)'
    ).run(req.session.userId, company,role, date_applied, safeStatus, notes);

    res.redirect('/dashboard');
});

app.get('/logout', (req,res) => {
    req.session.destroy(()=>res.redirect('/login'));
});


app.get('/applications/:id/edit', requireLogin, (req,res) =>{
    const application = db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?')
    .get(Number(req.params.id), req.session.userId);
    if(!application){
        return res.redirect('/dashboard');
    }
    res.render('edit', { application, statuses: STATUSES });
});

app.post('/applications/:id/edit', requireLogin, (req,res) => {
    const { company, role, date_applied, status, notes } = req.body;
    const safeStatus = STATUSES.includes(status) ? status : 'Applied';

    db.prepare(
        'UPDATE applications SET company = ?, role = ?, date_applied = ?, status = ?, notes = ? WHERE id = ? AND user_id = ?'
    ).run(company, role, date_applied, safeStatus, notes, Number(req.params.id), req.session.userId);

    res.redirect('/dashboard');
});

app.post('/applications/:id/delete', requireLogin, (req,res) => {
    db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), req.session.userId);
    res.redirect('/dashboard');
});

app.listen(3000, () => 
    console.log('Server on http://localhost:3000'));