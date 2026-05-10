const express = require("express");
const app = express();

const knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: "./baza.db"
    },
    useNullAsDeafult: true
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));

async function initDatabase(params) {
    const hasTable = await knex.schema.hasTable("tasks");
    if (!hasTable) {
        await knex.schema.createTable("tasks", table => {
            table.increments("id").primary();
            table.string("text").notNullable();
            table.string("priority");
        });
        console.log("Tabela tasks została utworzona");
    }
}
initDatabase();

const wagiSQL = `CASE priority
    WHEN 'Wysoki' THEN 3
    WHEN 'Średni' THEN 2
    WHEN 'Niski' THEN 1
    END`;

app.get("/tasks", async (req, res) => {
    try {
        const allTasks = await knex("tasks").select("*");
        res.json(allTasks);
    } catch(err) {
        res.status(500).json({error: "Nie udało się pobrać zadań: " + err.message});
    }
});

app.post("/tasks", async(req, res) => {
    try {
        const {text, priority} = req.body;
        const [newID] = await knex("tasks").insert({
            text: text,
            priority: priority
        });
        res.status(201).json({
            id: newID,
            text: text,
            priority: priority,
            message: "Dodano zadanie!"
        });
    } catch(err) {
        res.status(500).json({error: "Nie udało się dodać zadania: " + err.message});
    }
});

app.delete("/tasks/:id", async(req, res) => {
    try {
        const taskID = req.params.id;
        const rowsAffected = await knex("tasks").where("id", taskID).del();
        if(rowsAffected > 0) {
            res.json({
                message: "Zadanie usunięte pomyślnie!",
                id: taskID
            });
        } else {
            res.status(404).json({error: "Nie znaleziono zadania o podanym ID"});
        }
    } catch(err) {
        res.status(500).json({error: "Nie udało się usunąć zadania " + err.message});
    }
});

app.put("/tasks/:id", async(req, res) => {
    try {
        const taskID = req.params.id;
        const {text, priority} = req.body;
        const rowsAffected = await knex("tasks").where("id", taskID).update({
            text: text,
            priority: priority
        });

        if (rowsAffected > 0) {
            res.json({
                message: "Zadanie zaktualizowane!",
                id: taskID,
                updatedData: {text, priority}
            });
        } else {
            res.status(404).json({error: "Nie znaleziono zadania o podanym ID"});
        }
    } catch(err) {
        res.status(500).json({error: "Nie udało się usunąć zadania" + err.message});
    }
});


app.listen(3000, () => console.log("Serwer działa!"));

