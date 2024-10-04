// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/
// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  try {
    if (!localStorage.getItem("tasks")) {
      localStorage.setItem("tasks", JSON.stringify(initialData));
      localStorage.setItem("showSideBar", "true");
    } else {
      console.log("Data already exists in localStorage");
    }
  } catch (error) {
    console.error("Failed to initialize data:", error);
  }
}

initializeData();

function renderTasks() {
  const tasks = getTasks();
  const todoContainer = document.querySelector('[data-status="todo"] .tasks-container');
  const doingContainer = document.querySelector('[data-status="doing"] .tasks-container');
  const doneContainer = document.querySelector('[data-status="done"] .tasks-container');

  todoContainer.innerHTML = '';
  doingContainer.innerHTML = '';
  doneContainer.innerHTML = '';

  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-div');
    taskDiv.innerHTML = `
      <h5>${task.title}</h5>
      <p>${task.description}</p>
    `;
    taskDiv.setAttribute('data-task-id', task.id);

    // Event listener to open the task in edit modal
    taskDiv.addEventListener('click', () => openEditTaskModal(task));

    // Append tasks to their corresponding columns based on status
    switch (task.status) {
      case 'done':
        doneContainer.appendChild(taskDiv);
        break;
      case 'doing':
        doingContainer.appendChild(taskDiv);
        break;
      case 'todo':
      default:
        todoContainer.appendChild(taskDiv);
        break;
    }
  });
}

renderTasks();

// TASK: Get elements from the DOM
const elements = {
  sideBarDiv: document.getElementById('side-bar-div'),
  sideLogoDiv: document.getElementById('side-logo-div'),
  logoImg: document.getElementById('logo'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  headlineSidepanel: document.getElementById('headline-sidepanel'),
  switchThemeCheckbox: document.getElementById('switch'),
  labelCheckboxTheme: document.getElementById('label-checkbox-theme'),
  iconDarkTheme: document.getElementById('icon-dark'),
  iconLightTheme: document.getElementById('icon-light'),
  hideSideBarDiv: document.querySelector('.hide-side-bar-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  layoutDiv: document.getElementById('layout'),
  headerDiv: document.getElementById('header'),
  headerBoardName: document.getElementById('header-board-name'),
  dropdownBtn: document.getElementById('dropdownBtn'),
  dropDownIcon: document.getElementById('dropDownIcon'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  editBoardDiv: document.getElementById('editBoardDiv'),
  deleteBoardBtn: document.getElementById('deleteBoardBtn'),
  containerDiv: document.querySelector('.container'),
  cardColumnMain: document.querySelector('.card-column-main'),
  todoHeadDiv: document.getElementById('todo-head-div'),
  todoDot: document.getElementById('todo-dot'),
  toDoText: document.getElementById('toDoText'),
  doingHeadDiv: document.getElementById('doing-head-div'),
  doingDot: document.getElementById('doing-dot'),
  doingText: document.getElementById('doingText'),
  doneHeadDiv: document.getElementById('done-head-div'),
  doneDot: document.getElementById('done-dot'),
  doneText: document.getElementById('doneText'),
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  modalTitleInput: document.getElementById('modal-title-input'),
  titleInput: document.getElementById('title-input'),
  modalDescInput: document.getElementById('modal-desc-input'),
  descInput: document.getElementById('desc-input'),
  modalSelectStatus: document.getElementById('modal-select-status'),
  selectStatus: document.getElementById('select-status'),
  createTaskBtn: document.getElementById('create-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskHeader: document.getElementById('edit-task-header'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editBtn: document.getElementById('edit-btn'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  filterDiv: document.getElementById('filterDiv')
};

let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    document.querySelector('.header-board-name').textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  elements.boardsNavLinksDiv.innerHTML = '';
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    elements.boardsNavLinksDiv.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.cardColumnMain.querySelectorAll('.column-div').forEach(column => {
    const status = column.getAttribute("data-status");
    const tasksContainer = column.querySelector(".tasks-container");
    tasksContainer.innerHTML = '';
    
    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      taskElement.addEventListener('click', () => openEditTaskModal(task));

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach(btn => {
    btn.classList.toggle('active', btn.textContent === boardName);
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement("div");
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  // Listen for click to open the task modal
  taskElement.addEventListener('click', () => {
    openEditTaskModal(task);
  });

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  elements.createTaskBtn.addEventListener('click', handleAddTask);
  elements.saveTaskChangesBtn.addEventListener('click', handleSaveTask);
  elements.deleteTaskBtn.addEventListener('click', handleDeleteTask);
  elements.cancelAddTaskBtn.addEventListener('click', () => toggleModal(false, elements.newTaskModalWindow));
  elements.cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModalWindow));

  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  
  elements.labelCheckboxTheme.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme', elements.labelCheckboxTheme.checked);
  });
}

// Show sidebar event listener
const hideSideBarBtn = document.getElementById('hide-side-bar-btn');
if (hideSideBarBtn) {
  hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
} else {
  console.error('Element with ID "hide-side-bar-btn" not found.');
}

const showSideBarBtn = document.getElementById('show-side-bar-btn');
if (showSideBarBtn) {
  showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
} else {
  console.error('Element with ID "show-side-bar-btn" not found.');
}

// Theme switch event listener
const themeSwitch = document.getElementById('label-checkbox-theme');
if (themeSwitch) {
  themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme', themeSwitch.checked);
  });
} else {
  console.error('Element with ID "theme-switch" not found.');
}

// Create new task event listener
const createNewTaskBtn = document.getElementById('create-task-btn');
if (createNewTaskBtn) {
  createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    resetAddTaskForm(); // reset form values
  });
} else {
  console.error('Element with ID "create-task-btn" not found.');
}

// Add task form submission
const addTaskForm = document.getElementById('edit-task-form');
if (addTaskForm) {
  addTaskForm.addEventListener('submit', handleAddTask);
} else {
  console.error('Element with ID "edit-task-form" not found.');
}

// Save task changes
const saveTaskBtn = document.getElementById('save-task-changes-btn');
if (saveTaskBtn) {
  saveTaskBtn.addEventListener('click', handleSaveTask);
} else {
  console.error('Element with ID "save-task-changes-btn" not found.');
}

// Delete task
const deleteTaskBtn = document.getElementById('delete-task-btn');
if (deleteTaskBtn) {
  deleteTaskBtn.addEventListener('click', handleDeleteTask);
} else {
  console.error('Element with ID "delete-task-btn" not found.');
}

// Function to reset the add task form
function resetAddTaskForm() {
  const form = elements.addTaskForm;
  if (form) {
    form.reset(); // Reset all fields in the form
  } else {
    console.error('Element with ID "add-task-form" not found for resetting.');
  }
}

// Toggle modal visibility
function toggleModal(isVisible, modal) {
  modal.style.display = isVisible ? 'block' : 'none';
}

// Toggles the sidebar visibility
function toggleSidebar(isVisible) {
  elements.sideBarDiv.style.display = isVisible ? 'block' : 'none';
  elements.showSideBarBtn.style.display = isVisible ? 'none' : 'block';
  localStorage.setItem('showSideBar', JSON.stringify(isVisible));
}

// Open edit task modal
function openEditTaskModal(task) {
  elements.editTaskModalWindow.setAttribute('data-task-id', task.id);
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  toggleModal(true, elements.editTaskModalWindow);
}

// Handle adding a task
function handleAddTask(event) {
  event.preventDefault();
  const newTask = {
    title: elements.titleInput.value,
    description: elements.descInput.value,
    status: elements.selectStatus.value || 'todo',
    id: Date.now(),
    board: activeBoard
  };

  createNewTask(newTask);
  addTaskToUI(newTask);
  toggleModal(false, elements.newTaskModalWindow);
}

// Handle saving the task
function handleSaveTask() {
  const taskId = elements.editTaskModalWindow.getAttribute('data-task-id');
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value,
    board: activeBoard
  };

  patchTask(updatedTask);
  refreshTasksUI();
  toggleModal(false, elements.editTaskModalWindow);
}

// Handle deleting the task
function handleDeleteTask() {
  const taskId = elements.editTaskModalWindow.getAttribute('data-task-id');
  deleteTask(taskId);
  refreshTasksUI();
  toggleModal(false, elements.editTaskModalWindow);
}

fetchAndDisplayBoardsAndTasks();
setupEventListeners();
