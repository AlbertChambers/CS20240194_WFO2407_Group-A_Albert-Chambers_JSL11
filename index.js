import { getTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

// Function to initialize localStorage with initialData if no tasks exist
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
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

   taskForColumn .forEach(task => {
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
  // Create new task element
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.innerHTML =  `
  <h4>${task.title}</h4>
`;
  taskElement.setAttribute('data-task-id', task.id);

  // Edit the task
  taskElement.addEventListener("click", (event) => {
    event.stopPropagation();
    openEditTaskModal(task);
  });
  tasksContainer.appendChild(taskElement);
}

// Set up event listeners for various UI actions
function setupEventListeners() {
  // Cancel edit
  elements.cancelEditBtn.addEventListener("click", closeEditModal)
  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.newTaskModalWindow);
    resetNewTaskForm();
  });

  // sidebar
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));
  elements.switchToggle.addEventListener('change', toggleTheme);
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true, elements.newTaskModalWindow);
    elements.filterDiv.style.display = 'block';
  })
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';

    // Theme switch
    document.getElementById('switch').addEventListener('change', toggleTheme);
  });

  //Task Modal
  elements.editTaskModalWindow = document.querySelector('.edit-task-modal-window');
  elements.editTaskTitleInput = document.getElementById('edit-task-title-input');
  elements.editTaskDescInput = document.getElementById('edit-task-desc-input');
  elements.editStatusSelect = document.getElementById('edit-select-status');
  elements.saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  elements.cancelEditBtn = document.getElementById('cancel-edit-btn');
  elements.deleteTaskBtn = document.getElementById('delete-task-btn');

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });

  // openEditTaskModal Clear Listeners
  elements.saveTaskChangesBtn.removeEventListener('click', saveTaskChanges);
  elements.cancelEditBtn.removeEventListener('click', closeEditModal);
  elements.deleteTaskBtn.removeEventListener('click', deleteTaskHandler);

  // openEditTaskModal New event listeners
  elements.saveTaskChangesBtn.onclick = () => saveTaskChanges(task.id);
  elements.cancelEditBtn.onclick = closeEditModal;
  elements.deleteTaskBtn.onclick = () => deleteTaskHandler(task.id);
  elements.filterDiv.style.display = 'block';
}

// Reset the form for adding a task
function resetNewTaskForm() {
  elements.titleInput.value = '';
  elements.descInput.value = '';
  elements.statusSelect.value = '';
}

// Handle the addition of a new task
function AddTask(event) {
  {
    title: elements.titleInput.value.trim();
    description: elements.descInput.value.trim();
    status: elements.statusSelect.value;
    board: activeBoard;
    id: Date.now()
  };

  if (title === '' || description === '') {
    alert("Please fill in all fields.");
    return;
  }

  if (newTask) {
    addTaskToUI(newTask); /* displaying new task in the UI */
    toggleModal(false,elements.newTaskModalWindow); /* closing the modal window */
    resetNewTaskForm();
    refreshTasksUI();  // This line ensures the UI is updated
  } else{
    alert("Failed to create new task!!!");
  }

  const newTask = createNewTask(task);
}

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

 // Initial theme
function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const themeSwitch = document.getElementById('switch');

  if (savedTheme === 'dark') {
    themeSwitch.checked = true;
  } else {
    themeSwitch.checked = false;
  }

  toggleTheme();
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

// Open task in the edit task modal
function openEditTaskModal(task) {
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Button elements
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  elements.cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false, elements.newTaskModalWindow); // Hide the modal
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    document.getElementById('title-input').value = ""; // Clear form inputs
    document.getElementById('desc-input').value = "";
  });

  toggleModal(true, elements.editTaskModalWindow);
};

function closeEditModal() {
  toggleModal(false, elements.editTaskModalWindow);
  elements.filterDiv.style.display = 'none';
  refreshTasksUI();
}

// Save changes to an edited task
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

function deleteTaskHandler(taskId) {
  if(confirm("Are you sure you want to delete this task?")) {
    deleteTask(taskId);
  const taskElement = document.querySelector(`[data-task-id='${taskId}']`);
  if (taskElement) {
    taskElement.remove();
  }

  closeEditModal();
  }
}

function saveTaskChanges(taskId) {
  const updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editStatusSelect.value,
    board: activeBoard
  };

  putTask(taskId, updatedTask);

  const taskElement = document.querySelector(`[data-task-id='${taskId}']`); 
  if (taskElement) {
    taskElement.querySelector('h4').textContent = updatedTask.title;

    // Status change
    const newColumn = document.querySelector(`.column-div[data-status="${updatedTask.status}"]`);
    if (newColumn) {
      const tasksContainer = newColumn.querySelector('.tasks-container');
      tasksContainer.appendChild(taskElement);
    }
  }

  closeEditModal();
  refreshTasksUI();
}

// Function to toggle the visibility of modals
function toggleModal(show, modal = elements.modalWindow) {
  if (modal){
    modal.style.display = show ? 'block':'none';
  elements.filterDiv.style.display = show ? 'block' : 'none';
  }
}

// Initialize the app
function init() {
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  setupEventListeners();
  fetchAndDisplayBoardsAndTasks();
  toggleSidebar(showSidebar);
}

// Initial theme
window.addEventListener('DOMContentLoaded', setInitialTheme);

// init is called after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  init();
});
