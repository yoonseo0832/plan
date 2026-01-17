// --- 설정 ---
let currentYear = 2026;
let currentMonth = 0; // 0 = 1월
let selectedDateKey = null;

// 로컬 스토리지 데이터 불러오기
let tasks = JSON.parse(localStorage.getItem("myPlannerTasks")) || {};
let studyNotes = JSON.parse(localStorage.getItem("myStudyNotes")) || {};
// 체크리스트는 배열 형태로 저장 (index 기반)
let roadmapChecklist = JSON.parse(localStorage.getItem("myRoadmapChecklist")) || [];

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    loadNotes();
    initChecklist(); // 체크리스트 초기화 및 불러오기
});

// --- 탭 전환 ---
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    if(evt) evt.currentTarget.className += " active";
}

// --- ★ [신규] 연간 체크리스트 저장/로드 로직 ---
function initChecklist() {
    // 체크리스트 영역 안의 모든 체크박스 선택
    const checkboxes = document.querySelectorAll('.checklist-grid input[type="checkbox"]');
    
    checkboxes.forEach((box, index) => {
        // 1. 저장된 상태 불러오기
        if (roadmapChecklist[index]) {
            box.checked = true;
        }

        // 2. 변경 시 저장하기 (이벤트 리스너)
        box.addEventListener('change', () => {
            // 현재 모든 체크박스의 상태를 배열로 만듦
            const currentStates = Array.from(checkboxes).map(cb => cb.checked);
            localStorage.setItem("myRoadmapChecklist", JSON.stringify(currentStates));
            // 전역 변수 업데이트 (선택 사항)
            roadmapChecklist = currentStates;
        });
    });
}

// --- 학습 노트 관련 ---
function saveNote(subject) {
    const textarea = document.getElementById(`note-${subject}`);
    if (textarea) {
        studyNotes[subject] = textarea.value;
        localStorage.setItem("myStudyNotes", JSON.stringify(studyNotes));
        alert(`${subject} 노트가 저장되었습니다!`);
    }
}

function loadNotes() {
    for (const [subject, content] of Object.entries(studyNotes)) {
        const textarea = document.getElementById(`note-${subject}`);
        if (textarea) {
            textarea.value = content;
        }
    }
}

// --- 달력 관련 ---
function renderCalendar() {
    const calendarDays = document.getElementById("calendar-days");
    const monthYear = document.getElementById("monthYear");
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    
    monthYear.innerText = `${currentYear}년 ${monthNames[currentMonth]}`;
    calendarDays.innerHTML = "";

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "day empty";
        calendarDays.appendChild(emptyDiv);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "day";
        const dateKey = `${currentYear}-${currentMonth}-${day}`;
        dayDiv.innerHTML = `<span>${day}</span>`;

        if (tasks[dateKey] && tasks[dateKey].length > 0) {
            const dotsContainer = document.createElement("div");
            dotsContainer.className = "dots-container";
            const dotCount = Math.min(tasks[dateKey].length, 4);
            for(let k=0; k<dotCount; k++) {
                const dot = document.createElement("span");
                dot.className = "task-dot";
                dotsContainer.appendChild(dot);
            }
            dayDiv.appendChild(dotsContainer);
        }

        const today = new Date();
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add("today");
        }

        dayDiv.onclick = () => openModal(day);
        calendarDays.appendChild(dayDiv);
    }
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

// --- 모달 & 할 일 ---
function openModal(day) {
    selectedDateKey = `${currentYear}-${currentMonth}-${day}`;
    document.getElementById("modalDateDisplay").innerText = `${currentMonth + 1}월 ${day}일 할 일`;
    renderTaskList();
    document.getElementById("taskModal").style.display = "block";
    document.getElementById("newTaskInput").focus();
}

function closeModal() {
    document.getElementById("taskModal").style.display = "none";
    renderCalendar();
}

function addTask() {
    const input = document.getElementById("newTaskInput");
    const text = input.value.trim();
    if (!text) return;

    if (!tasks[selectedDateKey]) tasks[selectedDateKey] = [];
    tasks[selectedDateKey].push(text);
    
    saveTasks();
    input.value = "";
    renderTaskList();
}

function deleteTask(index) {
    if(confirm("삭제하시겠습니까?")) {
        tasks[selectedDateKey].splice(index, 1);
        if(tasks[selectedDateKey].length === 0) delete tasks[selectedDateKey];
        saveTasks();
        renderTaskList();
    }
}

function renderTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    const currentTasks = tasks[selectedDateKey] || [];

    currentTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${task}</span>
            <button class="delete-btn" onclick="deleteTask(${index})">삭제</button>
        `;
        list.appendChild(li);
    });
}

function saveTasks() {
    localStorage.setItem("myPlannerTasks", JSON.stringify(tasks));
}

window.onclick = function(event) {
    const modal = document.getElementById("taskModal");
    if (event.target === modal) closeModal();
}

document.getElementById("newTaskInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") addTask();
});
