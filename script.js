const apiUrl = 'http://localhost:3000/tasks';
let editingTaskId = null;

// Cargar las tareas desde el backend
async function loadTasks() {
  try {
    const response = await fetch(apiUrl);
    const tasks = await response.json();

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Limpiar la lista antes de recargar

    tasks.forEach(task => {
      const formattedDate = task.due_date
        ? new Date(task.due_date).toLocaleDateString('es-ES')
        : 'Sin fecha';

      const taskElement = document.createElement('div');
      taskElement.className = 'task-item';
      taskElement.innerHTML = `
        <h3>${task.title} (${task.priority})</h3>
        <p>${task.description || 'Sin descripción'}</p>
        <p>Vence: ${formattedDate}</p>
        <p>Estado: ${task.status}</p>
        <button onclick="editTask(${task.id}, '${task.title}', '${task.description || ''}', '${task.due_date || ''}', '${task.priority}', '${task.status}')">Editar</button>
        <button onclick="deleteTask(${task.id})">Eliminar</button>
      `;
      taskList.appendChild(taskElement);
    });
  } catch (error) {
    console.error('Error al cargar las tareas:', error);
  }
}

async function updateTaskStatus(taskId, newStatus) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('No se pudo actualizar el estado de la tarea');
    }

    alert('Estado actualizado con éxito');
    loadTasks(); // Recarga la lista de tareas
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    alert('Hubo un problema al actualizar el estado de la tarea');
  }
}


// Función para editar una tarea
async function editTask(id, title, description, due_date, priority, status) {
  editingTaskId = id; // Indica que estamos editando una tarea existente
  document.getElementById('title').value = title;
  document.getElementById('description').value = description;
  document.getElementById('due_date').value = due_date ? due_date.split('T')[0] : '';
  document.getElementById('priority').value = priority;

  // Seleccionar el estado correspondiente
  const statusRadios = document.querySelectorAll('input[name="status"]');
  statusRadios.forEach(radio => {
    radio.checked = radio.value === status;
  });
}



// Función para guardar una tarea nueva o actualizada
// Función para guardar una tarea nueva o actualizada
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const task = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    due_date: document.getElementById('due_date').value,
    priority: document.getElementById('priority').value,
    status: document.querySelector('input[name="status"]:checked').value,
  };

  try {
    if (editingTaskId) {
      // Actualizar tarea existente
      const response = await fetch(`${apiUrl}/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('No se pudo actualizar la tarea');
      }

      alert('Tarea actualizada con éxito');
      editingTaskId = null; // Reiniciar la variable después de editar
    } else {
      // Crear una nueva tarea
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar la tarea');
      }

      alert('Tarea guardada con éxito');
    }

    document.getElementById('taskForm').reset(); // Limpiar el formulario
    loadTasks(); // Recargar la lista de tareas
  } catch (error) {
    console.error('Error al guardar la tarea:', error);
    alert('Hubo un problema al guardar la tarea');
  }
});

// Función para editar una tarea
function editTask(id, title, description, due_date, priority, status) {
  editingTaskId = id; // Indica que estamos editando una tarea existente
  document.getElementById('title').value = title;
  document.getElementById('description').value = description;
  document.getElementById('due_date').value = due_date ? due_date.split('T')[0] : '';
  document.getElementById('priority').value = priority;

  // Seleccionar el estado correspondiente
  const statusRadios = document.querySelectorAll('input[name="status"]');
  statusRadios.forEach(radio => {
    radio.checked = radio.value === status;
  });

  document.getElementById('submitBtn').innerText = "Actualizar Tarea"; // Cambiar texto del botón
}

// Reiniciar el formulario al cancelar
function resetForm() {
  editingTaskId = null; // Reiniciar la variable de edición
  document.getElementById('taskForm').reset(); // Limpiar el formulario
  document.getElementById('submitBtn').innerText = "Crear Tarea"; // Volver al texto original
}



// Funcion para eliminar tarea
async function deleteTask(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('No se pudo eliminar la tarea');
    }

    alert('Tarea eliminada con éxito');
    loadTasks(); // Recargar la lista de tareas
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    alert('Hubo un problema al intentar eliminar la tarea');
  }
}

function renderTask(task) {
  const taskList = document.getElementById('taskList');
  const taskElement = document.createElement('div');
  taskElement.className = 'task-item';
  taskElement.innerHTML = `
    <h3>${task.title} (${task.priority})</h3>
    <p>${task.description || 'Sin descripción'}</p>
    <p>Vence: ${task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Sin fecha'}</p>
    <div>
      <label>
        <input type="radio" name="status-${task.id}" value="En proceso" ${task.status === 'En proceso' ? 'checked' : ''}>
        En proceso
      </label>
      <label>
        <input type="radio" name="status-${task.id}" value="Completado" ${task.status === 'Completado' ? 'checked' : ''}>
        Completado
      </label>
      <label>
        <input type="radio" name="status-${task.id}" value="Atrasada" ${task.status === 'Atrasada' ? 'checked' : ''}>
        Atrasada
      </label>
    </div>
    <button onclick="updateTaskStatus(${task.id}, document.querySelector('input[name=status-${task.id}]:checked').value)">Guardar Estado</button>
    <button onclick="deleteTask(${task.id})">Eliminar</button>
  `;

  taskList.appendChild(taskElement);
}


async function saveTask(event) {
  event.preventDefault(); // Evita que la página se recargue

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const due_date = document.getElementById('due_date').value;
  const priority = document.getElementById('priority').value;

  const taskData = {
    title,
    description,
    due_date,
    priority,
    status: 'En proceso', // Por defecto, el estado será "En proceso"
  };

  try {
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error('No se pudo guardar la tarea');
    }

    alert('Tarea guardada con éxito');
    document.getElementById('taskForm').reset(); // Limpia el formulario
    loadTasks(); // Recarga la lista de tareas
  } catch (error) {
    console.error('Error al guardar la tarea:', error);
    alert('Hubo un problema al guardar la tarea');
  }
}


// Actualizar estado
async function updateTaskStatus(taskId, newStatus) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error('No se pudo actualizar el estado de la tarea');
    }

    alert('Estado actualizado con éxito');
    loadTasks(); // Recarga la lista de tareas
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    alert('Hubo un problema al actualizar el estado de la tarea');
  }
}



// Inicializar la carga de tareas
loadTasks();
