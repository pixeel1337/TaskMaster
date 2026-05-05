const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database("./zadania.db", (err) => {
    if (err) console.error(err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL, 
    priority TEXT NOT NULL
)`);

const wagiSQL = `CASE priority
    WHEN 'Wysoki' THEN 3
    WHEN 'Średni' THEN 2
    WHEN 'Niski' THEN 1
    END`;

app.get("/", (req, res) => {
   db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) console.error(err.message);
        res.render("index", {tasks: rows});
   }); 
});

app.post("/add", (req, res) => {
    const {taskText, taskPriority} = req.body;

    const sql = "INSERT INTO tasks (text, priority) VALUES (?, ?)";
    db.run(sql, [taskText, taskPriority], (err) => {
        if (err) console.error(err.message);
        res.redirect("/"); 
    });
});

app.post("/delete", (req, res) => {
    const taskID = req.body.index;
    
    const sql = "DELETE FROM tasks WHERE id = ?";
    db.run(sql, taskID, (err) => {
        if (err) console.error(err.message);
        res.redirect("/");
    });
});    

app.post("/clear", (req, res) => {
    const sql ="DELETE FROM tasks";
    db.run(sql, (err) => {
        if (err) console.error(err.message);
        res.redirect("/");
    });
});

app.post("/sorted/:order", (req, res) => {
    const order = req.params.order === "desc" ? "DESC" : "ASC";
    const sql = `SELECT * FROM tasks ORDER BY ${wagiSQL} ${order}`;

    db.all(sql, [], (err, rows) => {
        if (err) console.error(err.message);
        res.render("index", {tasks: rows});
    });
});

app.listen(3000, () => console.log("Serwer działa!"));

