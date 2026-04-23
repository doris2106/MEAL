console.log('✅ app.js LOADED v3 - top of file');

/**
 * Main Application Module
 * Handles UI interactions, data management, and page flow
 */

let currentPage = 1;
let totalRecords = 0;
let isAuthenticated = false;
let currentUser = null;

/* ===== INITIALIZATION ===== */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Application initializing... app.js v3');
  console.log('All .view elements on page:', document.querySelectorAll('.view').length);
  
  const views = document.querySelectorAll('.view');
  views.forEach((v, i) => console.log(`  View ${i}: ${v.id}`));

  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('recordDate').value = today;
  document.getElementById('searchStartDate').value = today;
  document.getElementById('searchEndDate').value = today;

  // Check browser support
  window.faceDetection.checkBrowserSupport();

  // Check authentication
  await checkAuthStatus();

  // Load dashboard data
  await loadDashboardStats();

  // Load initial records
  await loadRecords();

  // Setup event listeners
  setupEventListeners();

  console.log('Application ready!');
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Form submission
  document.getElementById('mainForm').addEventListener('submit', handleFormSubmit);

  // Class group selection toggles (only if they exist)
  const classGroup1to5 = document.getElementById('classGroup1to5');
  const classGroup6to8 = document.getElementById('classGroup6to8');

  if (classGroup1to5) {
    classGroup1to5.addEventListener('change', () => toggleClassGroups('1to5'));
  }
  if (classGroup6to8) {
    classGroup6to8.addEventListener('change', () => toggleClassGroups('6to8'));
  }

  // Auth modals
  document.getElementById('authBtn').addEventListener('click', openAuthModal);
  document.querySelector('.close').addEventListener('click', closeAuthModal);

  // Auth forms
  const loginForm = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Modal clicks
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('authModal')) {
      closeAuthModal();
    }
  });

  document.getElementById('cameraModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('cameraModal')) {
      closeCameraModal();
    }
  });

  // Add event listeners to beneficiary inputs for manual calculation
  const beneficiaryInputs = [
    'class1Beneficiaries', 'class2Beneficiaries', 'class3Beneficiaries', 
    'class4Beneficiaries', 'class5Beneficiaries', 'class6Beneficiaries', 
    'class7Beneficiaries', 'class8Beneficiaries'
  ];
  beneficiaryInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', calculateTotalBeneficiaries);
    }
  });

  updateClassGroupVisibility();
}

function calculateTotalBeneficiaries() {
  const beneficiaryInputs = [
    'class1Beneficiaries', 'class2Beneficiaries', 'class3Beneficiaries', 
    'class4Beneficiaries', 'class5Beneficiaries', 'class6Beneficiaries', 
    'class7Beneficiaries', 'class8Beneficiaries'
  ];
  let total = 0;
  beneficiaryInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      total += parseInt(input.value) || 0;
    }
  });
  const totalEl = document.getElementById('totalBeneficiariesCount');
  if (totalEl) {
    totalEl.textContent = total;
  }
}

function toggleClassGroups(selectedGroup) {
  const classGroup1to5 = document.getElementById('classGroup1to5');
  const classGroup6to8 = document.getElementById('classGroup6to8');

  if (!classGroup1to5 || !classGroup6to8) return;

  if (selectedGroup === '1to5') {
    classGroup6to8.checked = false;
  } else if (selectedGroup === '6to8') {
    classGroup1to5.checked = false;
  }

  updateClassGroupVisibility();
}

function updateClassGroupVisibility() {
  const classGroup1to5 = document.getElementById('classGroup1to5');
  const classGroup6to8 = document.getElementById('classGroup6to8');
  let show1to5 = classGroup1to5 ? classGroup1to5.checked : false;
  let show6to8 = classGroup6to8 ? classGroup6to8.checked : false;

  const modeStudentWise = document.getElementById('modeStudentWise');
  if (modeStudentWise && modeStudentWise.checked && typeof studentAttendanceData !== 'undefined') {
    for (const data of studentAttendanceData) {
       const classNum = parseInt(data.class);
       if (classNum >= 1 && classNum <= 5) show1to5 = true;
       if (classNum >= 6 && classNum <= 8) show6to8 = true;
    }
  }

  const group1to5Students = document.getElementById('group1to5Students');
  const group1to5Beneficiaries = document.getElementById('group1to5Beneficiaries');
  const group6to8Students = document.getElementById('group6to8Students');
  const group6to8Beneficiaries = document.getElementById('group6to8Beneficiaries');

  if (group1to5Students) group1to5Students.style.display = show1to5 ? 'grid' : 'none';
  if (group1to5Beneficiaries) group1to5Beneficiaries.style.display = show1to5 ? 'grid' : 'none';
  
  if (group6to8Students) group6to8Students.style.display = show6to8 ? 'grid' : 'none';
  if (group6to8Beneficiaries) group6to8Beneficiaries.style.display = show6to8 ? 'grid' : 'none';
}

/* ===== AUTHENTICATION ===== */

/**
 * Check if user is authenticated
 */
async function checkAuthStatus() {
  const token = localStorage.getItem('token');

  if (!token) {
    isAuthenticated = false;
    updateAuthUI();
    return;
  }

  try {
    // Verify token validity
    const response = await fetch('/api/health');
    if (response.ok) {
      isAuthenticated = true;
      updateAuthUI();
    } else {
      localStorage.removeItem('token');
      isAuthenticated = false;
      updateAuthUI();
    }
  } catch {
    isAuthenticated = false;
    updateAuthUI();
  }
}

/**
 * Update UI based on auth status
 */
function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  const mainContent = document.getElementById('mainContent');

  if (isAuthenticated) {
    authBtn.textContent = '👤 Logout';
    authBtn.onclick = handleLogout;
    mainContent.style.opacity = '1';
    mainContent.style.pointerEvents = 'auto';
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = openAuthModal;
    mainContent.style.opacity = '0.5';
    mainContent.style.pointerEvents = 'none';
  }
}

/**
 * Open authentication modal
 */
function openAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.add('active');
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('active');
}

/**
 * Close authentication modal
 */
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('active');
}

/**
 * Toggle between login and register forms
 */
function toggleAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  loginForm.classList.toggle('active');
  registerForm.classList.toggle('active');
}

/**
 * Handle login
 */
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      isAuthenticated = true;
      updateAuthUI();
      closeAuthModal();
      showAlert('Login successful!', 'success');
      await loadDashboardStats();
    } else {
      showAlert(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Handle registration
 */
async function handleRegister(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('regName').value,
    email: document.getElementById('regEmail').value,
    phone: document.getElementById('regPhone').value,
    school: document.getElementById('regSchool').value,
    password: document.getElementById('regPassword').value,
    passwordConfirm: document.getElementById('regPasswordConfirm').value,
  };

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      isAuthenticated = true;
      updateAuthUI();
      closeAuthModal();
      showAlert('Registration successful!', 'success');
      await loadDashboardStats();
    } else {
      showAlert(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Guest login
 */
async function guestLogin() {
  try {
    const response = await fetch('/api/auth/guest-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      isAuthenticated = true;
      updateAuthUI();
      closeAuthModal();
      showAlert('Guest login successful!', 'success');
      await loadDashboardStats();
    } else {
      showAlert(data.message || 'Guest login failed', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  localStorage.removeItem('token');
  isAuthenticated = false;
  updateAuthUI();
  resetForm();
  showAlert('Logged out successfully', 'success');
}

/* ===== FORM HANDLING ===== */

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  // Collect form data
  const formData = {
    date: document.getElementById('recordDate').value,
    classGroup1to5: document.getElementById('classGroup1to5').checked,
    classGroup6to8: document.getElementById('classGroup6to8').checked,
    detectedStudents: parseInt(document.getElementById('detectedStudents').value) || 0,
    students: {
      class1: parseInt(document.getElementById('class1Students').value) || 0,
      class2: parseInt(document.getElementById('class2Students').value) || 0,
      class3: parseInt(document.getElementById('class3Students').value) || 0,
      class4: parseInt(document.getElementById('class4Students').value) || 0,
      class5: parseInt(document.getElementById('class5Students').value) || 0,
      class6: parseInt(document.getElementById('class6Students').value) || 0,
      class7: parseInt(document.getElementById('class7Students').value) || 0,
      class8: parseInt(document.getElementById('class8Students').value) || 0,
    },
    beneficiaries: {
      class1: parseInt(document.getElementById('class1Beneficiaries').value) || 0,
      class2: parseInt(document.getElementById('class2Beneficiaries').value) || 0,
      class3: parseInt(document.getElementById('class3Beneficiaries').value) || 0,
      class4: parseInt(document.getElementById('class4Beneficiaries').value) || 0,
      class5: parseInt(document.getElementById('class5Beneficiaries').value) || 0,
      class6: parseInt(document.getElementById('class6Beneficiaries').value) || 0,
      class7: parseInt(document.getElementById('class7Beneficiaries').value) || 0,
      class8: parseInt(document.getElementById('class8Beneficiaries').value) || 0,
    },
    mealType: document.getElementById('mealType').value,
    notes: document.getElementById('notes').value,
  };

  // Check if in student-wise attendance mode
  if (currentAttendanceMode === 'student-wise') {
    if (studentAttendanceData.length === 0) {
      showAlert('Please add at least one student for attendance', 'warning');
      return;
    }
    // Automatically determine class groups based on students marked
    const has1to5 = studentAttendanceData.some(s => parseInt(s.class) >= 1 && parseInt(s.class) <= 5);
    const has6to8 = studentAttendanceData.some(s => parseInt(s.class) >= 6 && parseInt(s.class) <= 8);
    
    formData.classGroup1to5 = has1to5;
    formData.classGroup6to8 = has6to8;
    
    // Add student attendance data to form
    formData.studentAttendance = studentAttendanceData;
  }

  // Validation
  if (!formData.classGroup1to5 && !formData.classGroup6to8) {
    showAlert('Please select at least one class group', 'warning');
    return;
  }

  if (!formData.mealType) {
    showAlert('Please select a meal type', 'warning');
    return;
  }

  if (currentAttendanceMode === 'count') {
    // Count-based mode validation
    // Check beneficiaries <= students for selected group
    if (formData.classGroup1to5) {
      for (const classNum of ['class1', 'class2', 'class3', 'class4', 'class5']) {
        if (formData.beneficiaries[classNum] > formData.students[classNum]) {
          showAlert(`Beneficiaries cannot exceed students in ${classNum}`, 'warning');
          return;
        }
      }
    }

    if (formData.classGroup6to8) {
      for (const classNum of ['class6', 'class7', 'class8']) {
        if (formData.beneficiaries[classNum] > formData.students[classNum]) {
          showAlert(`Beneficiaries cannot exceed students in ${classNum}`, 'warning');
          return;
        }
      }
    }
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Data saved successfully!', 'success');
      resetForm();
      await loadRecords();
      await loadDashboardStats();
    } else {
      showAlert(data.message || 'Failed to save data', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Reset form
 */
function resetForm() {
  const mainForm = document.getElementById('mainForm');
  const classGroup1to5 = document.getElementById('classGroup1to5');
  const classGroup6to8 = document.getElementById('classGroup6to8');
  const recordDate = document.getElementById('recordDate');
  const detectedStudents = document.getElementById('detectedStudents');

  if (mainForm) mainForm.reset();
  if (recordDate) recordDate.value = new Date().toISOString().split('T')[0];
  if (classGroup1to5) classGroup1to5.checked = false;
  if (classGroup6to8) classGroup6to8.checked = false;
  if (detectedStudents) detectedStudents.value = 0;

  const allFields = [
    'class1Students',
    'class2Students',
    'class3Students',
    'class4Students',
    'class5Students',
    'class6Students',
    'class7Students',
    'class8Students',
    'class1Beneficiaries',
    'class2Beneficiaries',
    'class3Beneficiaries',
    'class4Beneficiaries',
    'class5Beneficiaries',
    'class6Beneficiaries',
    'class7Beneficiaries',
    'class8Beneficiaries',
  ];

  allFields.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.value = 0;
    }
  });

  studentAttendanceData = [];
  updateAttendanceSummary();
  calculateTotalBeneficiaries();
  const studentListContainer = document.getElementById('studentListContainer');
  if (studentListContainer) {
    studentListContainer.innerHTML = '<p class="no-students-message">Select a class to load students</p>';
  }
  const attendanceClassSelect = document.getElementById('attendanceClassSelect');
  if (attendanceClassSelect) {
    attendanceClassSelect.value = '';
  }

  updateClassGroupVisibility();
}

/* ===== DASHBOARD ===== */

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/records/stats/dashboard', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.success && data.statistics) {
      const stats = data.statistics;

      document.getElementById('totalRecords').textContent = stats.totalRecords || 0;
      document.getElementById('totalStudents').textContent = stats.totalStudents || 0;
      document.getElementById('totalMeals').textContent = stats.totalBeneficiaries || 0;
      document.getElementById('beneficiaryRate').textContent =
        (stats.beneficiaryPercentage || 0) + '%';

      // Display meal types
      displayMealTypes(stats.mealTypes || {});
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

/**
 * Display meal types in dashboard
 */
function displayMealTypes(mealTypes) {
  const list = document.getElementById('mealTypesList');
  list.innerHTML = '';

  if (Object.keys(mealTypes).length === 0) {
    list.innerHTML = '<li>No meal data yet</li>';
    return;
  }

  Object.entries(mealTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([meal, count]) => {
      const li = document.createElement('li');
      li.textContent = `${meal}: ${count} times`;
      list.appendChild(li);
    });
}

/* ===== RECORDS VIEW ===== */

/**
 * Load records
 */
async function loadRecords(page = 1) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/records?page=${page}&limit=10`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.success) {
      displayRecords(data.data);
      totalRecords = data.pagination.total;
      displayPagination(data.pagination);
    }
  } catch (error) {
    console.error('Error loading records:', error);
    showAlert('Failed to load records', 'error');
  }
}

/**
 * Display records in table
 */
function displayRecords(records) {
  const tbody = document.getElementById('recordsTableBody');
  tbody.innerHTML = '';

  if (records.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No records found</td></tr>';
    return;
  }

  records.forEach((record) => {
    const isStudentWise = record.attendanceType === 'student-wise';
    const totalStudents = isStudentWise ? record.attendanceSummary?.totalStudents || 0 : Object.values(record.students || {}).reduce((a, b) => a + b, 0);
    const totalBeneficiaries = isStudentWise ? record.attendanceSummary?.presentCount || 0 : Object.values(record.beneficiaries || {}).reduce((a, b) => a + b, 0);
    const date = new Date(record.date).toLocaleDateString('en-US');

    const row = `
      <tr>
        <td>${date}</td>
        <td>${record.classGroup1to5 ? '✓' : '✕'}</td>
        <td>${record.classGroup6to8 ? '✓' : '✕'}</td>
        <td>${totalStudents}</td>
        <td>${record.detectedStudents || 0}</td>
        <td>${totalBeneficiaries}</td>
        <td>${record.mealType}</td>
        <td>
          <div class="action-buttons">
            ${isStudentWise ? `<button class="btn btn-secondary" onclick="toggleDetails('${record._id}')">Details</button>` : ''}
            <button class="btn" onclick="deleteRecord('${record._id}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
    
    if (isStudentWise && record.studentAttendance) {
        const studentsByClass = {};
        record.studentAttendance.forEach(s => {
            if (!studentsByClass[s.class]) studentsByClass[s.class] = [];
            studentsByClass[s.class].push(s);
        });
        
        let detailsHtml = `<div class="record-details" id="details-${record._id}" style="display:none; padding: 1rem; background: #f9f9f9; margin-bottom: 1rem; border-radius: 8px; text-align: left;">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div style="padding: 0.25rem 0.75rem; background: #e0e0e0; border-radius: 4px; font-weight: bold; color: var(--gray-800);">Total: ${record.attendanceSummary?.totalStudents || 0}</div>
                <div style="padding: 0.25rem 0.75rem; background: #2d8f6f; color: white; border-radius: 4px; font-weight: bold;">Present: ${record.attendanceSummary?.presentCount || 0}</div>
                <div style="padding: 0.25rem 0.75rem; background: #d64550; color: white; border-radius: 4px; font-weight: bold;">Absent: ${record.attendanceSummary?.absentCount || 0}</div>
            </div>`;
            
        Object.keys(studentsByClass).sort((a,b) => parseInt(a) - parseInt(b)).forEach(cls => {
            detailsHtml += `<h4 style="margin-top: 0.5rem; margin-bottom: 0.5rem; color: var(--gray-800);">Class ${cls}</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">`;
            studentsByClass[cls].forEach(s => {
                const statusColor = s.status === 'Present' ? '#2d8f6f' : '#d64550';
                detailsHtml += `<span style="padding: 0.2rem 0.5rem; border-radius: 4px; background: ${statusColor}; color: white; font-size: 0.85rem;">${s.studentName} (${s.rollNumber})</span>`;
            });
            detailsHtml += `</div>`;
        });
        
        detailsHtml += `</div>`;
        
        const detailsRow = `
        <tr class="details-row">
            <td colspan="8" style="padding: 0;">
                ${detailsHtml}
            </td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', detailsRow);
    }
  });
}

/**
 * Toggle record details
 */
window.toggleDetails = function(id) {
    const el = document.getElementById(`details-${id}`);
    if (el) {
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
};

/**
 * Display pagination
 */
function displayPagination(pagination) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  for (let i = 1; i <= pagination.pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === pagination.page ? 'active' : '';
    btn.onclick = () => loadRecords(i);
    container.appendChild(btn);
  }
}

/**
 * Search records by date range
 */
async function searchRecords() {
  const startDate = document.getElementById('searchStartDate').value;
  const endDate = document.getElementById('searchEndDate').value;

  if (!startDate || !endDate) {
    showAlert('Please select both dates', 'warning');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `/api/records/range?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    const data = await response.json();

    if (data.success) {
      displayRecords(data.data);
      showAlert(`Found ${data.count} record(s)`, 'success');
    }
  } catch (error) {
    console.error('Error searching records:', error);
    showAlert('Search failed', 'error');
  }
}

/**
 * Reset search
 */
function resetSearch() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('searchStartDate').value = today;
  document.getElementById('searchEndDate').value = today;
  loadRecords();
}

/**
 * Delete record
 */
async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/records/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Record deleted successfully', 'success');
      await loadRecords();
      await loadDashboardStats();
    } else {
      showAlert(data.message || 'Failed to delete record', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/* ===== TAB NAVIGATION ===== */

/**
 * Switch between tabs
 */
function switchTab(tabIndex) {
  console.log(`switchTab called with tabIndex: ${tabIndex}`);
  const views = document.querySelectorAll('.view');
  const tabs = document.querySelectorAll('.tab-btn');
  
  console.log(`Total views found: ${views.length}, Total tabs found: ${tabs.length}`);
  
  if (!views[tabIndex]) {
    console.error(`ERROR: views[${tabIndex}] is undefined! Only found ${views.length} views.`);
    return;
  }

  views.forEach((view) => view.classList.remove('active'));
  tabs.forEach((tab) => tab.classList.remove('active'));

  views[tabIndex].classList.add('active');
  console.log(`Added 'active' class to view at index ${tabIndex}: ${views[tabIndex].id}`);
  
  if (tabs[tabIndex]) {
    tabs[tabIndex].classList.add('active');
  }

  // Refresh data when switching to records tab
  if (tabIndex === 1) {
    console.log('Calling loadRecords()');
    loadRecords();
  }

  // Load stock data when switching to stock tab
  if (tabIndex === 3) {
    console.log('Calling loadStockItems()');
    loadStockItems();
  }
}

/* ===== CAMERA MODAL ===== */

/**
 * Open camera modal
 */
async function openCameraModal() {
  const modal = document.getElementById('cameraModal');
  modal.classList.add('active');

  const videoElement = document.getElementById('videoFeed');

  // Load models while the camera starts
  window.faceDetection.initializeFaceDetection().catch(() => {
    // ignore initialization failure here; capture process will handle it
  });

  const started = await window.faceDetection.startVideoStream(videoElement);

  if (!started) {
    modal.classList.remove('active');
  }
}

/* ===== STUDENT-WISE ATTENDANCE ===== */

// Global state for student attendance
let currentAttendanceMode = null; // 'count' or 'student-wise'
let currentStudents = [];
let studentAttendanceData = [];



// Attendance mode selection logic for new checkboxes
function selectAttendanceMode(mode) {
  // Only allow one checkbox to be checked at a time
  const countBox = document.getElementById('modeCount');
  const studentWiseBox = document.getElementById('modeStudentWise');
  if (mode === 'count') {
    countBox.checked = true;
    studentWiseBox.checked = false;
    currentAttendanceMode = 'count';
    document.getElementById('countModeSection').style.display = 'block';
    document.getElementById('studentAttendanceSection').style.display = 'none';
    const mealSection = document.getElementById('mealBeneficiariesSection');
    if (mealSection) mealSection.style.display = 'block';
    // Reset student-wise section
    document.getElementById('studentListContainer').innerHTML = '<p class="no-students-message">Select a class to load students</p>';
    document.getElementById('attendanceSummary').style.display = 'none';
    document.getElementById('attendanceClassSelect').value = '';
  } else if (mode === 'student-wise') {
    countBox.checked = false;
    studentWiseBox.checked = true;
    currentAttendanceMode = 'student-wise';
    document.getElementById('countModeSection').style.display = 'none';
    document.getElementById('studentAttendanceSection').style.display = 'block';
    const mealSection = document.getElementById('mealBeneficiariesSection');
    if (mealSection) mealSection.style.display = 'none';
    // Optionally load students if a class is selected
    const selectedClass = document.getElementById('attendanceClassSelect').value;
    if (selectedClass) {
      loadStudentsForAttendance();
    }
  }
}

/**
 * Load students for attendance when class is selected
 */
async function loadStudentsForAttendance() {
  const classSelect = document.getElementById('attendanceClassSelect');
  const selectedClass = classSelect.value;
  const container = document.getElementById('studentListContainer');
  
  if (!selectedClass) {
    container.innerHTML = '<p class="no-students-message">Select a class to load students</p>';
    currentStudents = [];
    updateAttendanceSummary();
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/students?class=${selectedClass}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      currentStudents = data.data;
      
      // Add students to studentAttendanceData if they don't already exist
      currentStudents.forEach(student => {
        const exists = studentAttendanceData.some(s => s.studentId === student._id);
        if (!exists) {
          studentAttendanceData.push({
            studentId: student._id,
            studentName: student.name,
            rollNumber: student.rollNumber,
            class: student.class,
            status: 'Present',
          });
        }
      });
      
      renderStudentAttendanceList();
      updateAttendanceSummary();
    } else {
      container.innerHTML = '<p class="no-students-message">No students found for this class. Please add students first.</p>';
      currentStudents = [];
      updateAttendanceSummary();
    }
  } catch (error) {
    console.error('Error loading students:', error);
    container.innerHTML = '<p class="no-students-message">Error loading students. Please try again.</p>';
  }
}

/**
 * Render the student attendance list with toggle buttons
 */
function renderStudentAttendanceList() {
  const container = document.getElementById('studentListContainer');
  const selectedClass = document.getElementById('attendanceClassSelect').value;
  
  const classStudents = studentAttendanceData.filter(s => s.class === selectedClass);
  
  if (classStudents.length === 0) {
    container.innerHTML = '<p class="no-students-message">No students in this class</p>';
    return;
  }
  
  container.innerHTML = classStudents.map((student) => {
    // Find global index to update correct student
    const globalIndex = studentAttendanceData.findIndex(s => s.studentId === student.studentId);
    return `
    <div class="student-attendance-item ${student.status === 'Absent' ? 'absent' : ''}" data-index="${globalIndex}">
      <div class="student-info">
        <span class="student-roll">${student.rollNumber}</span>
        <span class="student-name">${student.studentName}</span>
      </div>
      <div class="student-status-toggle">
        <button 
          type="button" 
          class="status-btn present ${student.status === 'Present' ? 'active' : ''}" 
          onclick="setStudentStatus(${globalIndex}, 'Present')"
        >
          Present
        </button>
        <button 
          type="button" 
          class="status-btn absent ${student.status === 'Absent' ? 'active' : ''}" 
          onclick="setStudentStatus(${globalIndex}, 'Absent')"
        >
          Absent
        </button>
      </div>
    </div>
  `}).join('');
}

/**
 * Set student attendance status
 */
function setStudentStatus(index, status) {
  studentAttendanceData[index].status = status;
  
  // Update UI
  const item = document.querySelector(`.student-attendance-item[data-index="${index}"]`);
  if (item) {
    const presentBtn = item.querySelector('.status-btn.present');
    const absentBtn = item.querySelector('.status-btn.absent');
    
    if (status === 'Present') {
      presentBtn.classList.add('active');
      absentBtn.classList.remove('active');
      item.classList.remove('absent');
    } else {
      presentBtn.classList.remove('active');
      absentBtn.classList.add('active');
      item.classList.add('absent');
    }
  }
  
  updateAttendanceSummary();
}

/**
 * Update attendance summary counts
 */
function updateAttendanceSummary() {
  const presentCount = studentAttendanceData.filter(s => s.status === 'Present').length;
  const absentCount = studentAttendanceData.filter(s => s.status === 'Absent').length;
  const totalCount = studentAttendanceData.length;
  
  document.getElementById('presentCount').textContent = presentCount;
  document.getElementById('absentCount').textContent = absentCount;
  document.getElementById('totalCount').textContent = totalCount;
  
  const generatedMealBen = document.getElementById('generatedMealBeneficiariesCount');
  if (generatedMealBen) {
    generatedMealBen.textContent = presentCount;
  }
  
  // Show/hide summary based on whether students are loaded
  const summary = document.getElementById('attendanceSummary');
  summary.style.display = totalCount > 0 ? 'flex' : 'none';

  // Pre-fill meal beneficiaries for student-wise mode
  const modeStudentWise = document.getElementById('modeStudentWise');
  if (modeStudentWise && modeStudentWise.checked) {
    for (let i = 1; i <= 8; i++) {
      const presentInClass = studentAttendanceData.filter(s => s.status === 'Present' && parseInt(s.class) === i).length;
      const benInput = document.getElementById(`class${i}Beneficiaries`);
      if (benInput) {
        benInput.value = presentInClass;
      }
    }
  }

  calculateTotalBeneficiaries();
  updateClassGroupVisibility();
}

/**
 * Show student-wise mode button when students exist
 */
function checkStudentModeAvailability() {
  const switchBtn = document.getElementById('switchToStudentMode');
  console.log('Checking student mode availability...');

  // Show the button if there are students in the database
  fetch('/api/students')
    .then(res => res.json())
    .then(data => {
      console.log('Student API response:', data);
      if (data.success && data.data.length > 0) {
        console.log('Students found. Enabling button.');
        switchBtn.style.display = 'inline-block';
      } else {
        console.log('No students found. Hiding button.');
        switchBtn.style.display = 'none';
      }
    })
    .catch((error) => {
      console.error('Error fetching students:', error);
      switchBtn.style.display = 'none';
    });
}


// On DOMContentLoaded, set initial attendance mode UI
document.addEventListener('DOMContentLoaded', () => {
  // Default: nothing selected, both hidden
  document.getElementById('countModeSection').style.display = 'none';
  document.getElementById('studentAttendanceSection').style.display = 'none';
  // Uncheck both checkboxes
  document.getElementById('modeCount').checked = false;
  document.getElementById('modeStudentWise').checked = false;
});

/* ===== STUDENT MANAGEMENT ===== */

/**
 * Add a new student
 */
async function addStudent() {
  const name = document.getElementById('studentName').value.trim();
  const studentClass = document.getElementById('studentClass').value;
  const rollNumber = parseInt(document.getElementById('studentRoll').value);

  // Validation
  if (!name) {
    showAlert('Please enter student name', 'warning');
    return;
  }
  if (!studentClass) {
    showAlert('Please select a class', 'warning');
    return;
  }
  if (!rollNumber || rollNumber < 1) {
    showAlert('Please enter a valid roll number', 'warning');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        name,
        class: studentClass,
        rollNumber,
      }),
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Student added successfully!', 'success');
      // Clear form
      document.getElementById('studentName').value = '';
      document.getElementById('studentClass').value = '';
      document.getElementById('studentRoll').value = '';
      // Reload student list
      loadAllStudents();
      // Refresh student mode availability
      checkStudentModeAvailability();
    } else {
      showAlert(data.message || 'Failed to add student', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Load all students
 */
async function loadAllStudents() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/students?active=false', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.success) {
      displayStudents(data.data);
    }
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

/**
 * Display students in table
 */
function displayStudents(students) {
  const tbody = document.getElementById('studentTableBody');
  
  if (!students || students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No students added yet</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(student => `
    <tr>
      <td>${student.rollNumber}</td>
      <td>${student.name}</td>
      <td>Class ${student.class}</td>
      <td>
        <button class="delete-btn" onclick="deleteStudent('${student._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

/**
 * Delete a student (soft delete)
 */
async function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to delete this student?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/students/${studentId}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Student deleted successfully', 'success');
      loadAllStudents();
      checkStudentModeAvailability();
    } else {
      showAlert(data.message || 'Failed to delete student', 'error');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'error');
  }
}

/**
 * Filter students by class
 */
async function filterStudents() {
  const classFilter = document.getElementById('filterStudentClass').value;
  
  try {
    const token = localStorage.getItem('token');
    const url = classFilter 
      ? `/api/students?class=${classFilter}&active=false`
      : '/api/students?active=false';
    
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.success) {
      displayStudents(data.data);
    }
  } catch (error) {
    console.error('Error filtering students:', error);
  }
}

// Override switchTab to handle student management tab
const originalSwitchTab = switchTab;
switchTab = function(tabIndex) {
  originalSwitchTab(tabIndex);
  
  // Load students when switching to student management tab
  if (tabIndex === 4) {
    loadAllStudents();
  }
};

/**
 * Close camera modal
 */
function closeCameraModal() {
  const modal = document.getElementById('cameraModal');
  modal.classList.remove('active');
  window.faceDetection.stopVideoStream();

  // Reset UI
  document.getElementById('detectionResult').style.display = 'none';
  document.getElementById('canvasOutput').style.display = 'none';
}

/**
 * Capture photo and detect faces
 */
/**
 * Capture photo and detect faces
 */
async function capturePhoto() {
  console.log('capturePhoto: Starting capture process...');
  
  const videoElement = document.getElementById('videoFeed');
  const canvasElement = document.getElementById('canvasOutput');

  const manualClassValues = {
    class1: document.getElementById('class1Students').value,
    class2: document.getElementById('class2Students').value,
    class3: document.getElementById('class3Students').value,
    class4: document.getElementById('class4Students').value,
    class5: document.getElementById('class5Students').value,
  };

  const classInputs = [
    'class1Students',
    'class2Students',
    'class3Students',
    'class4Students',
    'class5Students',
  ];

  classInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.readOnly = true;
    }
  });

  // Capture photo
  console.log('Capturing photo from stream...');
  await window.faceDetection.capturePhotoFromStream(videoElement, canvasElement);

  // Detect faces
  console.log('Processing captured photo for face detection...');
  const detectedCount = await window.faceDetection.processCapturedPhoto(
    canvasElement.toDataURL()
  );
  
  console.log('Detection result:', detectedCount);

  // Display result
  window.faceDetection.displayDetectionResult(detectedCount, canvasElement);

  if (detectedCount !== null && detectedCount > 0) {
    console.log('Valid detection count, saving detected total only...');

    document.getElementById('detectedStudents').value = detectedCount;

    document.getElementById('class1Students').value = manualClassValues.class1;
    document.getElementById('class2Students').value = manualClassValues.class2;
    document.getElementById('class3Students').value = manualClassValues.class3;
    document.getElementById('class4Students').value = manualClassValues.class4;
    document.getElementById('class5Students').value = manualClassValues.class5;

    classInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.readOnly = false;
      }
    });

    showAlert('Detected student count updated. Manual class totals are preserved.', 'success');
    setTimeout(() => {
      closeCameraModal();
    }, 3000);
  } else {
    console.log('No faces detected or error in detection');

    // Restore manual values if anything changed during capture
    document.getElementById('class1Students').value = manualClassValues.class1;
    document.getElementById('class2Students').value = manualClassValues.class2;
    document.getElementById('class3Students').value = manualClassValues.class3;
    document.getElementById('class4Students').value = manualClassValues.class4;
    document.getElementById('class5Students').value = manualClassValues.class5;

    classInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.readOnly = false;
      }
    });
  }
}

/* ===== ALERTS ===== */

/**
 * Show alert/notification
 */
function showAlert(message, type = 'info') {
  const container = document.getElementById('alertContainer');

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <strong>${type.toUpperCase()}</strong>: ${message}
  `;

  container.appendChild(alert);

  // Remove after 4 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(400px)';
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}

console.log('App.js loaded');
