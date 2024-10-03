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
    taskDiv.innerHTML = `
      <h5>${task.title}</h5>
      <p>${task.description}</p>
    `;
    taskDiv.setAttribute('data-task-id', task.id);

    // Handle click to open modal
    taskDiv.addEventListener('click', () => openEditTaskModal(task));

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
  columnDivs: document.querySelectorAll(".column-div"),
  boardsContainer: document.getElementById("boards-nav-links-div"),
  headerBoardName: document.querySelector(".header-board-name"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("theme-switch"),
  createNewTaskBtn: document.getElementById("create-new-task-btn"),
  addTaskForm: document.getElementById("add-task-form"),
  editTaskTitle: document.getElementById("edit-task-title"),
  editTaskDesc: document.getElementById("edit-task-desc"),
  editTaskStatus: document.getElementById("edit-task-status"),
  saveTaskBtn: document.getElementById("save-task-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
  taskModal: document.getElementById("task-modal"),
  editTaskModal: document.getElementById("edit-task-modal"),
  sidebarDiv: document.querySelector(".sidebar-div"),
  showSidebarDiv: document.querySelector(".show-sidebar-div"),
  body: document.body
}

let activeBoard = ""

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0];
    document.querySelector('.header-board-name').textContent = activeBoard;
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;//assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
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
      taskElement.addEventListener ('click', () => {
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

    if(btn.textContent === boardName) {
      btn.classList.add('active')
    }
    else {
      btn.classList.remove('active');
    }
  });
}

// let originalTask = null;

function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]');
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
    console.error('Element with ID "filter-div" not found.');
  }

  // Show sidebar event listener
  const hideSideBarBtn = document.getElementById('hide-side-bar-btn');
  if (hideSideBarBtn) {
    hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  } else {
    console.error('Element with ID "hide-sidebar-btn" not found.');
  }

  const showSideBarBtn = document.getElementById('show-side-bar-btn');
  if (showSideBarBtn) {
    showSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  } else {
    console.error('Element with ID "show-side-bar-btn" not found.');
  }

  // Theme switch event listener
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('change', toggleTheme);
  } else {
    console.error('Element with ID "theme-switch" not found.');
  }

  // Show Add New Task Modal event listener
  const createNewTaskBtn = document.getElementById('create-new-task-btn');
  if (createNewTaskBtn) {
    createNewTaskBtn.addEventListener('click', () => {
      toggleModal(true);
      elements.filterDiv.style.display = 'block'; // Also show the filter overlay
    });
  } else {
    console.error('Element with ID "create-new-task-btn" not found.');
  }

  // Add new task form submission event listener
  const addTaskForm = document.getElementById('add-task-form');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', (event) => addTask(event));
  } else {
    console.error('Element with ID "add-task-form" not found.');
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

async function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: document.getElementById("task-title").value,
    description: document.getElementById("task-desc").value,
    status: document.getElementById("task-status").value,
    board: activeBoard,
    id: Date.now()
  };

  try {
    const newTask = await createNewTask(task); // Await the promise
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      saveTasks();
      refreshTasksUI();
    }
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

// Toggle sidebar visibility
function toggleSidebar(show) {
  if (show) {
    elements.sidebarDiv.style.display = 'block'; // Show the sidebar
    elements.showSidebarDiv.style.display = 'none'; // Hide the show sidebar button
    elements.hideSideBarBtn.style.display = 'block'; // Show the hide sidebar button
  } else {
    elements.sidebarDiv.style.display = 'none'; // Hide the sidebar
    elements.showSidebarDiv.style.display = 'block'; // Show the show sidebar button
    elements.hideSideBarBtn.style.display = 'none'; // Hide the hide sidebar button
  }
}

// Toggle between light and dark theme
function toggleTheme() {
  const currentTheme = elements.body.classList.contains('dark-theme');
  if (currentTheme) {
    elements.body.classList.remove('dark-theme'); // Remove dark theme
    elements.body.classList.add('light-theme'); // Add light theme
  } else {
    elements.body.classList.remove('light-theme'); // Remove light theme
    elements.body.classList.add('dark-theme'); // Add dark theme
  }
}

async function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitle.value = task.title;
  elements.editTaskDesc.value = task.description;
  elements.editTaskStatus.value = task.status;

  // Get button elements from the task modal
  elements.saveTaskBtn.onclick = async () => {
    saveTaskChanges(task.id);
  };

  // Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.onclick = async () => {
    await handleDeleteTask(task.id);
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

async function saveTaskChanges(taskId) {
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitle.value,
    description: elements.editTaskDesc.value,
    status: elements.editTaskStatus.value,
    board: activeBoard
  };

  // Update task using a helper function. Close the modal and refresh the UI to reflect the changes
  try {
    await patchTask(taskId, updatedTask); // Patch task using the helper function
    saveTasks(); // Save updated tasks to storage
    toggleModal(false, elements.editTaskModal); // Close modal after saving
    refreshTasksUI(); // Refresh UI
  } catch (error) {
    console.error("Failed to save task changes:", error);
}};

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', init());

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

init()

