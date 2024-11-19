CREATE TABLE Tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,     -- ID �nico de cada tarea
    title NVARCHAR(100) NOT NULL,         -- T�tulo de la tarea
    description NVARCHAR(255) NULL,       -- Descripci�n de la tarea (opcional)
    due_date DATE NULL,                   -- Fecha de vencimiento (opcional)
    priority NVARCHAR(20) NOT NULL,       -- Prioridad (Baja, Media, Alta)
    status NVARCHAR(50) NOT NULL,         -- Estado (En proceso, Completado, Atrasada)
    created_at DATETIME DEFAULT GETDATE(),-- Fecha de creaci�n (valor por defecto)
    updated_at DATETIME DEFAULT GETDATE() -- Fecha de �ltima actualizaci�n (valor por defecto)
);

CREATE TRIGGER trg_UpdateTimestamp
ON Tasks
AFTER UPDATE
AS
BEGIN
    UPDATE Tasks
    SET updated_at = GETDATE()
    FROM inserted
    WHERE Tasks.id = inserted.id;
END;

select * from Tasks

CREATE PROCEDURE ResetTaskIDs
AS
BEGIN
    SET NOCOUNT ON;

    -- Crear una tabla temporal para almacenar las tareas ordenadas por ID
    SELECT * INTO #TempTasks FROM Tasks ORDER BY id;

    -- Vaciar la tabla original
    TRUNCATE TABLE Tasks;

    -- Insertar las tareas de la tabla temporal en la tabla original
    INSERT INTO Tasks (title, description, due_date, priority, status, created_at, updated_at)
    SELECT title, description, due_date, priority, status, created_at, updated_at
    FROM #TempTasks;

    -- Eliminar la tabla temporal
    DROP TABLE #TempTasks;

    -- Reiniciar el contador de identidad
    DBCC CHECKIDENT ('Tasks', RESEED, 0);
END;

CREATE TRIGGER trg_ResetIDsAfterDelete
ON Tasks
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Crear una tabla temporal para almacenar las tareas ordenadas por ID
    SELECT * INTO #TempTasks FROM Tasks ORDER BY id;

    -- Vaciar la tabla original
    TRUNCATE TABLE Tasks;

    -- Insertar las tareas de la tabla temporal en la tabla original
    INSERT INTO Tasks (title, description, due_date, priority, status, created_at, updated_at)
    SELECT title, description, due_date, priority, status, created_at, updated_at
    FROM #TempTasks;

    -- Eliminar la tabla temporal
    DROP TABLE #TempTasks;

    -- Reiniciar el contador de identidad
    DBCC CHECKIDENT ('Tasks', RESEED, 0);
END;


-- Cambiar la collation de las columnas a insensible a mayúsculas
ALTER TABLE Tasks
ALTER COLUMN title NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL;

ALTER TABLE Tasks
ALTER COLUMN description NVARCHAR(255) COLLATE SQL_Latin1_General_CP1_CI_AS;

