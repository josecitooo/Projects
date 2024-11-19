const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos
const dbConfig = {
  user: 'grupo2',
  password: 'aquino',
  server: 'localhost',
  database: 'TaskManager',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Conexión a la base de datos
sql.connect(dbConfig)
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch(err => console.error('Error al conectar a la base de datos:', err));

// Obtener todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Tasks');
    res.send(result.recordset);
  } catch (err) {
    console.error('Error al obtener las tareas:', err);
    res.status(500).send({ error: 'Error al obtener las tareas' });
  }
});

// Eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params; // Obtiene el ID desde los parámetros

  try {
    const pool = await sql.connect(dbConfig); // Conexión a la base de datos
    const result = await pool.request()
      .input('id', sql.Int, id) // Pasa el ID como parámetro
      .query('DELETE FROM Tasks WHERE id = @id'); // Consulta para eliminar la tarea

    if (result.rowsAffected[0] === 0) {
      // Si no se encuentra la tarea, envía un error 404
      return res.status(404).send({ error: 'Tarea no encontrada' });
    }

    res.send({ message: 'Tarea eliminada correctamente' }); // Respuesta exitosa
  } catch (err) {
    console.error('Error al eliminar la tarea:', err); // Imprime el error en consola
    res.status(500).send({ error: 'Error al eliminar la tarea' }); // Error genérico
  }
});

// Guardar una tarea
app.post('/tasks', async (req, res) => {
  const { title, description, due_date, priority, status } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('due_date', sql.Date, due_date || null)
      .input('priority', sql.NVarChar(50), priority)
      .input('status', sql.NVarChar(50), status || 'En proceso') // Por defecto: "En proceso"
      .query(`
        INSERT INTO Tasks (title, description, due_date, priority, status)
        VALUES (@title, @description, @due_date, @priority, @status)
      `);

    res.status(201).send({ message: 'Tarea guardada correctamente' });
  } catch (err) {
    console.error('Error al guardar la tarea:', err);
    res.status(500).send({ error: 'Error al guardar la tarea' });
  }
});

app.patch('/tasks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar(50), status)
      .query('UPDATE Tasks SET status = @status WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ error: 'Tarea no encontrada' });
    }

    res.send({ message: 'Estado actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar el estado:', err);
    res.status(500).send({ error: 'Error al actualizar el estado' });
  }
});

// Actualizar tarea existente
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, status } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar(255), title)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('due_date', sql.Date, due_date || null)
      .input('priority', sql.NVarChar(50), priority)
      .input('status', sql.NVarChar(50), status)
      .query(`
        UPDATE Tasks
        SET title = @title, description = @description, due_date = @due_date,
            priority = @priority, status = @status
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ error: 'Tarea no encontrada' });
    }

    res.send({ message: 'Tarea actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar la tarea:', err);
    res.status(500).send({ error: 'Error al actualizar la tarea' });
  }
});



// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
