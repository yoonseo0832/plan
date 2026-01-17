// 초기 설정: 2026년 1월로 시작
let currentYear = 2026;
let currentMonth = 0; // 0 = 1월
let selectedDateKey = null; // 클릭한 날짜 저장용

// 로컬 스토리지에서 할 일 불러오기 (없으면 빈 객체)
let tasks = JSON.parse(localStorage.getItem("myPlannerTasks")) || {};

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
});

// 탭 전환 함수
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    if(evt) evt.currentTarget.className += " active";
}

// 달력 렌더링 함수
function renderCalendar() {
    const calendarDays = document.getElementById("calendar-days");
    const monthYear = document.getElementById("monthYear");
    
    // 월별 이름 배열
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    
    monthYear.innerText = `${currentYear}년 ${monthNames[currentMonth]}`;
    calendarDays.innerHTML = "";

    // 해당 월의 첫 날과 마지막 날 계산
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0(일) ~ 6(토)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 1. 빈 칸 채우기 (1일 이전)
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day", "empty");
        calendarDays.appendChild(emptyDiv);
    }

    // 2. 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");
        
        // 날짜 키 생성 (예: "2026-0-24")
        const dateKey = `${currentYear}-${currentMonth}-${day}`;
        dayDiv.innerHTML = `<strong>${day}</strong>`;

        // 할 일이 있으면 점(Dot) 표시
        if (tasks[dateKey] && tasks[dateKey].length > 0) {
            const dotsContainer = document.createElement("div");
            tasks[dateKey].forEach(() => {
                const dot = document.createElement("span");
                dot.className = "task-dot";
                dotsContainer.appendChild(dot);
            });
            dayDiv.appendChild(dotsContainer);
        }

        // 클릭 이벤트 (모달 열기)
        dayDiv.onclick = () => openModal(day);
        
        calendarDays.appendChild(dayDiv);
    }
}

// 월 변경 함수
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
    const modal = document.getElementById("taskModal");
    const displayDate = document.getElementById("modalDateDisplay");
    
    selectedDateKey = `${currentYear}-${currentMonth}-${day}`;
    displayDate.innerText = `${currentYear}년 ${currentMonth + 1}월 ${day}일 목표`;
    
    renderTaskList(); // 목록 갱신
    modal.style.display = "block";
}

// 모달 닫기
function closeModal() {
    document.getElementById("taskModal").style.display = "none";
    renderCalendar(); // 달력 갱신 (점 표시 업데이트)
}

// 할 일 추가
function addTask() {
    const input = document.getElementById("newTaskInput");
    const taskText = input.value.trim();
    
    if (taskText === "") return alert("할 일을 입력해주세요!");

    if (!tasks[selectedDateKey]) {
        tasks[selectedDateKey] = [];
    }
    
    tasks[selectedDateKey].push(taskText);
    saveTasks(); // 저장
    
    input.value = ""; // 입력창 초기화
    renderTaskList(); // 목록 갱신
}

// 할 일 삭제
function deleteTask(index) {
    if (confirm("삭제하시겠습니까?")) {
        tasks[selectedDateKey].splice(index, 1);
        saveTasks();
        renderTaskList();
    }
}

// 할 일 목록 렌더링 (모달 내부)
function renderTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    
    const currentTasks = tasks[selectedDateKey] || [];
    
    currentTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${task}</span>
            <button class="delete-btn" onclick="deleteTask(${index})">X</button>
        `;
        list.appendChild(li);
    });
}

// 로컬 스토리지 저장
function saveTasks() {
    localStorage.setItem("myPlannerTasks", JSON.stringify(tasks));
}

// 모달 밖 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById("taskModal");
    if (event.target == modal) {
        closeModal();
    }
}