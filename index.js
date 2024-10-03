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

  // Clear existing tasks
  todoContainer.innerHTML = '';
  doingContainer.innerHTML = '';
  doneContainer.innerHTML = '';

  // Render tasks based on their status
  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.innerHTML = `
      <h5>${task.title}</h5>
      <p>${task.description}</p>
    `;
    taskDiv.setAttribute('data-task-id', task.id);

    // Handle click to open modal
    taskDiv.addEventListener('click', () => openEditTaskModal(task));

    // Append task to the corresponding container
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
};

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
    hideSideBarDiv: document.querySelector('.hide-side-bar-div'), // Using querySelector for class
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

    containerDiv: document.querySelector('.container'), // Using querySelector for class
    cardColumnMain: document.querySelector('.card-column-main'), // Using querySelector for class

    // Task Column Elements
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

    editTaskModalWindow: document.querySelector('.edit-task-modal-window'), // Using querySelector for class
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
  elements.boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    elements.boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Reset column content while preserving the column title
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {
        openEditTaskModal(task);
      });

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
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
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
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) { // Ensure the element exists
    cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));
  } else {
    console.error('Element with ID "cancel-edit-btn" not found.');
  }

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  if (cancelAddTaskBtn) { // Ensure the element exists
    cancelAddTaskBtn.addEventListener('click', () => {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    });
  } else {
    console.error('Element with ID "cancel-add-task-btn" not found.');
  }

  // Clicking outside the modal to close it
  if (elements.filterDiv) {
    elements.filterDiv.addEventListener('click', () => {
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    });
  } else {
    console.error('Element with ID "filterDiv" not found.');
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
function toggleModal(isVisible, modalElement = null) {
  if (modalElement) {
    modalElement.style.display = isVisible ? 'block' : 'none';
  }
}

// Toggles the sidebar visibility
function toggleSidebar(isVisible) {
  if (isVisible) {
    elements.sidebarDiv.style.display = 'block';
    elements.showSidebarDiv.style.display = 'none'; // Hide the show sidebar button
  } else {
    elements.sidebarDiv.style.display = 'none';
    elements.showSidebarDiv.style.display = 'block'; // Show the show sidebar button
  }
}

// Open edit task modal
function openEditTaskModal(task) {
  if (elements.editTaskTitle && elements.editTaskDesc && elements.editTaskStatus) {
    elements.editTaskTitle.value = task.title || '';
    elements.editTaskDesc.value = task.description || '';
    elements.editTaskStatus.value = task.status || '';
    elements.editTaskModal.setAttribute('data-task-id', task.id); // Set task ID for later use
    toggleModal(true, elements.editTaskModal);
  } else {
    console.error('One or more elements required for editing a task are missing.');
  }
}

// Handle adding a task
function handleAddTask(event) {
  event.preventDefault();

  const newTask = {
    title: elements.addTaskForm.elements['task-title'].value,
    description: elements.addTaskForm.elements['task-description'].value,
    status: 'todo',
    id: Date.now(), // Unique ID generation
    board: activeBoard // Associate task with the active board
  };

  createNewTask(newTask); // Call to create task
  addTaskToUI(newTask); // UI update
  toggleModal(false); // Close modal
}

// Handle saving the task
function handleSaveTask() {
  const updatedTask = {
    title: elements.editTaskTitle.value,
    description: elements.editTaskDesc.value,
    status: elements.editTaskStatus.value,
    id: elements.editTaskModal.getAttribute('data-task-id')
  };

  patchTask(updatedTask); // Call to update task
  renderTasks(); // Refresh UI to show updated tasks
  toggleModal(false, elements.editTaskModal); // Close modal
}

// Handle deleting the task
function handleDeleteTask() {
  const taskId = elements.editTaskModal.getAttribute('data-task-id');

  deleteTask(taskId); // Call to delete task
  renderTasks(); // Refresh UI to show remaining tasks
  toggleModal(false, elements.editTaskModal); // Close modal
}

setupEventListeners();
fetchAndDisplayBoardsAndTasks();
