// 설정: 2026년 1월 시작
let currentYear = 2026;
let currentMonth = 0; // 0 = 1월
let selectedDateKey = null;

// 로컬 스토리지에서 할 일 불러오기
let tasks = JSON.parse(localStorage.getItem("myPlannerTasks")) || {};

document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});

// 탭 전환
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

// 달력 그리기
function renderCalendar() {
    const calendarDays = document.getElementById("calendar-days");
    const monthYear = document.getElementById("monthYear");
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    
    monthYear.innerText = `${currentYear}년 ${monthNames[currentMonth]}`;
    calendarDays.innerHTML = "";

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 1. 빈 칸 채우기
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "day empty";
        calendarDays.appendChild(emptyDiv);
    }

    // 2. 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "day";
        const dateKey = `${currentYear}-${currentMonth}-${day}`;
        
        // 날짜 숫자
        dayDiv.innerHTML = `<span>${day}</span>`;

        // 할 일 점(Dot) 표시
        if (tasks[dateKey] && tasks[dateKey].length > 0) {
            const dotsContainer = document.createElement("div");
            dotsContainer.className = "dots-container";
            // 최대 4개까지만 점 표시 (지저분함 방지)
            const dotCount = Math.min(tasks[dateKey].length, 4);
            for(let k=0; k<dotCount; k++) {
                const dot = document.createElement("span");
                dot.className = "task-dot";
                dotsContainer.appendChild(dot);
            }
            dayDiv.appendChild(dotsContainer);
        }

        // 오늘 날짜 표시 (실제 현재 시간 기준)
        const today = new Date();
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add("today");
        }

        dayDiv.onclick = () => openModal(day);
        calendarDays.appendChild(dayDiv);
    }
}

// 월 변경
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

// 모달 열기
function openModal(day) {
    selectedDateKey = `${currentYear}-${currentMonth}-${day}`;
    document.getElementById("modalDateDisplay").innerText = `${currentMonth + 1}월 ${day}일 할 일`;
    renderTaskList();
    document.getElementById("taskModal").style.display = "block";
    document.getElementById("newTaskInput").focus();
}

// 모달 닫기
function closeModal() {
    document.getElementById("taskModal").style.display = "none";
    renderCalendar(); // 점 갱신
}

// 할 일 추가
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

// 할 일 삭제
function deleteTask(index) {
    if(confirm("삭제하시겠습니까?")) {
        tasks[selectedDateKey].splice(index, 1);
        // 비어있으면 키 삭제 (데이터 정리)
        if(tasks[selectedDateKey].length === 0) delete tasks[selectedDateKey];
        saveTasks();
        renderTaskList();
    }
}

// 목록 렌더링
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

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById("taskModal");
    if (event.target === modal) closeModal();
}

// 엔터키 입력 지원
document.getElementById("newTaskInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") addTask();
});
