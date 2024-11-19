const sql = require('mssql');

const dbConfig = {
  user: 'grupo2', // Usuario configurado en SQL Server
  password: 'aquino', // Contraseña del usuario
  server: 'localhost', // O el nombre exacto de tu servidor
  database: 'TaskManager',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(dbConfig).connect()
  .then(pool => {
    console.log('Conexión a la base de datos exitosa');
    return pool.request().query('SELECT * FROM Tasks');
  })
  .then(result => {
    console.log('Tareas existentes:', result.recordset);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error en la conexión:', err.message);
    process.exit(1);
  });
