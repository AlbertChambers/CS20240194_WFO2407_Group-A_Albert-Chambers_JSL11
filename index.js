import { getTasks,createNewTask,patchTask,putTask,deleteTask } from "./utils/taskFunctions.js";
import {initialData} from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/


// loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists');
  }
}

initializeData()

// TASK: Get elements from the DOM
const elements = {
  sideBarDiv: document.getElementById('side-bar-div'),
  logoDiv: document.getElementById('side-logo-div'),
  logoImage: document.getElementById('logo'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  headlineSidepanel: document.getElementById('headline-sidepanel'),
  switchToggle: document.getElementById('switch'),
  hideSidebarBtn: document.getElementById('hide-side-bar-btn'),
  showSidebarBtn: document.getElementById('show-side-bar-btn'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  statusSelect: document.getElementById('select-status'),
  createTaskBtn: document.getElementById('create-task-btn'),
  filterDiv: document.getElementById('filterDiv'),
  columnDivs: document.querySelectorAll(".column-div"),
  darkThemeIcon: document.getElementById('icon-dark'),
  lightThemeIcon: document.getElementById('icon-light'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editStatusSelect: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  todoTasksContainer: document.querySelector('[data-status="todo"] .tasks-container'),
  doingTasksContainer: document.querySelector('[data-status="doing"] .tasks-container'),
  doneTasksContainer: document.querySelector('[data-status="done"] .tasks-container'),
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
}

let activeBoard = "" /* activeBoard acts a global varaible */

// Extracts board names
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard || boards[0];
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    filterAndDisplayTasksByBoard(activeBoard);
  }
}

// Creates different boards
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = '';

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    boardElement.addEventListener("click",() =>  {
      elements.headerBoardName.textContent = board;
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
      filterAndDisplayTasksByBoard(activeBoard);
    });

    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

   // Filter tasks based status
   const taskForColumn = filteredTasks.filter(task => task.status === status);

   taskForColumn .forEach(task => {  /* fixed comparison operator for status */
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.innerHTML = `
        <h4>${task.title}</h4>
      `;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", (event) => {
        event.stopPropagation();
        openEditTaskModal(task);
      });

      column.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === activeBoard);

  // Clear tasks
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");

    // Tasks container
    let tasksContainer = column.querySelector('.tasks-container');
    if (!tasksContainer) {
      tasksContainer = document.createElement('div');
      tasksContainer.className = 'tasks-container';
      column.appendChild(tasksContainer);
    }
    tasksContainer.innerHTML = '';

    // Add tasks for this column
    const tasksForColumn = filteredTasks.filter(task => task.status === status);
    tasksForColumn.forEach(task => {
      const taskElement = createTaskElement(task);
      tasksContainer.appendChild(taskElement);
    });
  });
}

// Styles active board
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {

    if(btn.textContent === boardName) {
      btn.classList.add('active')
    }
    else {
      btn.classList.remove('active');
    }
  });
}

fetchAndDisplayBoardsAndTasks();

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status=${task.status}]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {

    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.innerHTML =  `
  <h4>${task.title}</h4>
  `;

  taskElement.setAttribute('data-task-id', task.id);
  taskElement.addEventListener("click", (event) => {
    event.stopPropagation();
    openEditTaskModal(task);
  });

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel edit task
  elements.cancelEditBtn.addEventListener("click", closeEditModal)
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.newTaskModalWindow);
    resetNewTaskForm();
  });

  // Show sidebar
  elements.hideSidebarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSidebarBtn.addEventListener("click", () => toggleSidebar(true));
  elements.switchToggle.addEventListener('change', toggleTheme);

  // Click outside to close modal
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'block';
  })

  // New Task Modal
  elements.editTaskModalWindow = document.querySelector('.edit-task-modal-window');
  elements.editTaskTitleInput = document.getElementById('edit-task-title-input');
  elements.editTaskDescInput = document.getElementById('edit-task-desc-input');
  elements.editStatusSelect = document.getElementById('edit-select-status');
  elements.saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  elements.cancelEditBtn = document.getElementById('cancel-edit-btn');
  elements.deleteTaskBtn = document.getElementById('delete-task-btn');

  // New task form
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

setupEventListeners()

function toggleModal(show, modal = elements.modalWindow) {
  if (modal){
    modal.style.display = show ? 'block':'none';
  elements.filterDiv.style.display = show ? 'block' : 'none';
  }
}

function resetNewTaskForm() {
  elements.titleInput.value = '';
  elements.descInput.value = '';
  elements.statusSelect.value = '';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
  const task = {
    id:Date.now(),
    title: elements.titleInput.value.trim(),
    description: elements.descInput.value.trim(),
    status: elements.statusSelect.value,
    board:activeBoard
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false, elements.newTaskModalWindow);
    resetNewTaskForm();
    refreshTasksUI();
  } else {
    alert("Failed to create task");
  }
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  const showSidebarBtn = document.getElementById('show-side-bar-btn');

  if (show) {
    sidebar.style.display = 'block';
    showSidebarBtn.style.display = 'none';
    localStorage.setItem('showSideBar', 'true');
  } else {
    sidebar.style.display = 'none';
    showSidebarBtn.style.display = 'block';
    localStorage.setItem('showSideBar', 'false');
  }
}

toggleSidebar()

function toggleTheme() {
  const themeSwitch = document.getElementById('switch');
  const isDarkTheme = themeSwitch.checked;
  const logo = document.getElementById('logo');

  if (isDarkTheme) {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
    logo.src = './assets/logo-dark.svg';
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    logo.src = './assets/logo-light.svg';
  }
}

function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeSwitch = document.getElementById('switch');

  // Check if savedTheme is dark; otherwise, default to dark on first load
  if (savedTheme === 'dark') {
    themeSwitch.checked = false;
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');  // Set switch to checked for dark theme
    document.getElementById('logo').src = './assets/logo-light.svg';
  } else {
    themeSwitch.checked = true;
    document.body.classList.add('dark-theme'); // Default to dark on first load
    document.body.classList.remove('light-theme');
    document.getElementById('logo').src = './assets/logo-dark.svg';
  }
}

document.getElementById('switch').addEventListener('change', toggleTheme);
window.addEventListener('DOMContentLoaded', setInitialTheme);

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editStatusSelect.value = task.status;

  // Clear previous listeners
  elements.saveTaskChangesBtn.removeEventListener('click', saveTaskChanges);
  elements.cancelEditBtn.removeEventListener('click', closeEditModal);
  elements.deleteTaskBtn.removeEventListener('click', deleteTaskHandler);

  // Set up new listeners
  elements.saveTaskChangesBtn.onclick = () => saveTaskChanges(task.id);
  elements.cancelEditBtn.onclick = closeEditModal;
  elements.deleteTaskBtn.onclick = () => deleteTaskHandler(task.id);
    toggleModal(true, elements.editTaskModalWindow);
    elements.filterDiv.style.display = 'block';
}
  // Cancel add task
  elements.cancelAddTaskBtn.addEventListener('click', () => {
  toggleModal(false, elements.newTaskModalWindow);
  elements.filterDiv.style.display = 'none';
  document.getElementById('title-input').value = "";
  document.getElementById('desc-input').value = "";
});

// Call saveTaskChanges upon click of Save Changes button
  /* Set up new event listeners */
  saveTaskChangesBtn.onclick = () => {
  const updatedTask = {
    title: editTaskTitleInput.value,
    description: editTaskDescInput.value,
    status: editSelectStatus.value,
  };
  patchTask(task.id, updatedTask);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
};

  // Delete task using a helper function and close the task modal
  function deleteTaskHandler(taskId) {
    if(confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
     // Remove the task element from the UI /*  */
    const taskElement = document.querySelector(`[data-task-id='${taskId}']`);
    if (taskElement) {
      taskElement.remove();  // Remove the task element from the DOM /*  */
    }
    closeEditModal();  // Close the edit modal if open
    }
  }

function saveTaskChanges(taskId) {
  const updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editStatusSelect.value,
    board: activeBoard
  };

  // Update storage task
  putTask(taskId, updatedTask);

  // Update UI task
  const taskElement = document.querySelector(`[data-task-id='${taskId}']`); 
  if (taskElement) {
    taskElement.querySelector('h4').textContent = updatedTask.title;

    const currentColumn = taskElement.closest('.column-div');
    const newColumn = document.querySelector(`.column-div[data-status="${updatedTask.status}"]`);

    // Move task only if status changed
    if (currentColumn !== newColumn) {
      const tasksContainer = newColumn.querySelector('.tasks-container');
      tasksContainer.appendChild(taskElement);
    }
  }

  closeEditModal();
  refreshTasksUI();
}

function closeEditModal() {
  toggleModal(false, elements.editTaskModalWindow);
  elements.filterDiv.style.display = 'none';
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

// init is called after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  init();
});

function init() {
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  setupEventListeners();
  toggleSidebar(showSidebar);
  fetchAndDisplayBoardsAndTasks();
}