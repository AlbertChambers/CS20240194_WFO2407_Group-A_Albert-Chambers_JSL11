import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

// Function to initialize localStorage with initialData if no tasks exist
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

// Function to render tasks to their respective columns based on status
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

// Get elements from the DOM
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
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  selectStatus: document.getElementById('select-status'),
  createTaskBtn: document.getElementById('create-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn')
};

let activeBoard = "";

// Extracts unique board names from tasks and displays them
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks(); /* fetching all of the task from loacal Storage */
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


// Function to display boards in the sidebar
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = '';
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click",() =>  {
      elements.headerBoardName.textContent = board;
      activeBoard = board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
      filterAndDisplayTasksByBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters and displays tasks based on board and status
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); /* === to compare the task at hand */

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); /* === to compare the task at hand */

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

   // Filter tasks based on the current column status
   const tasksContainer = column.querySelector('.tasks-container');
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

// Refreshes the UI after updating tasks
function refreshTasksUI() {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === activeBoard);

// Loop and clear existing tasks
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    const tasksContainer = column.querySelector('.tasks-container') || column.appendChild(document.createElement('div'));
    tasksContainer.className = 'tasks-container';
  })
   tasksContainer.innerHTML = '';

   // Add tasks for this column
   const tasksForColumn = filteredTasks.filter(task => task.status === status);
   tasksForColumn.forEach(task => {
     const taskElement = createTaskElement(task);
     tasksContainer.appendChild(taskElement);
   });
  };

// Styles the active board button
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach(btn => {
    if(btn.textContent === boardName) {
      btn.classList.add('active')
    }
    else {
      btn.classList.remove('active');
    }
  });
}

// Adds a task to the UI in the appropriate column
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  const tasksContainer = column.querySelector('.tasks-container');
  const taskElement = document.createElement("div");
  taskElement.classList.add("task-div");
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  // Open task in edit modal when clicked
  taskElement.addEventListener('click', () => openEditTaskModal(task));

  tasksContainer.appendChild(taskElement);
}

// Set up event listeners for various UI actions
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

  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModalWindow);
    resetAddTaskForm();
  });
}

// Reset the form for adding a task
function resetAddTaskForm() {
  elements.titleInput.value = '';
  elements.descInput.value = '';
  elements.selectStatus.value = 'todo';
}

// Handle the addition of a new task
function handleAddTask() {
  const title = elements.titleInput.value.trim();
  const description = elements.descInput.value.trim();
  const status = elements.selectStatus.value;

  if (title === '' || description === '') {
    alert("Please fill in all fields.");
    return;
  }

  const newTask = createNewTask({
    title,
    description,
    status,
    board: activeBoard,
  });

  // Save the task to local storage
  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  addTaskToUI(newTask);
  toggleModal(false, elements.newTaskModalWindow);
}

// Open task in the edit task modal
function openEditTaskModal(task) {
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  elements.saveTaskChangesBtn.setAttribute('data-task-id', task.id);  // <-- Set task ID for editing
  elements.deleteTaskBtn.setAttribute('data-task-id', task.id);  // <-- Set task ID for deletion

  toggleModal(true, elements.editTaskModalWindow);
}

// Handle saving changes to an edited task
function handleSaveTask() {
  const taskId = elements.saveTaskChangesBtn.getAttribute('data-task-id');
  const title = elements.editTaskTitleInput.value.trim();
  const description = elements.editTaskDescInput.value.trim();
  const status = elements.editSelectStatus.value;

  if (title === '' || description === '') {
    alert("Please fill in all fields.");
    return;
  }

  // Find the task in local storage and update its properties
  let tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    console.error("Task not found");
    return;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title,
    description,
    status,
    board: activeBoard
  };

  putTask(taskId, tasks[taskIndex]); // Update task in local storage
  saveTasks(tasks); // Save the updated task list to local storage

  refreshTasksUI();
  toggleModal(false, elements.editTaskModalWindow);
}

function handleDeleteTask() {
  const taskId = elements.deleteTaskBtn.getAttribute('data-task-id');
  if (!taskId) {
    console.error("No task ID found for deletion");
    return;
  }

  // Call deleteTask and check if it was successful
  const success = deleteTask(taskId);
  if (success) {
    console.log(`Task with ID ${taskId} deleted successfully.`);
    refreshTasksUI(); // Refresh the UI to show the updated task list
    toggleModal(false, elements.editTaskModalWindow);
  } else {
    console.error("Failed to delete the task. Task may not exist.");
  }
}

// Function to toggle the visibility of modals
function toggleModal(show, modalElement) {
  modalElement.style.display = show ? 'block' : 'none';
}

// Toggle sidebar visibility
function toggleSidebar(show) {
  elements.sideBarDiv.style.display = show ? 'block' : 'none';
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}


// Initialize the app
function init() {
  setupEventListeners();
  fetchAndDisplayBoardsAndTasks();
}

init();
