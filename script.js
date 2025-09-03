const habitForm = document.querySelector("#habit_form");
const habitTitleElem = document.querySelector("#habit_title");
const habitColorElem = document.querySelector("#color_habit");
const habitFrequency = document.querySelector("#frequency");
const taskForm = document.querySelector("#task_form");
const taskTitleElem = document.querySelector("#task_title");
const taskDescElem = document.querySelector("#task_description");
const taskDueDate = document.querySelector("#dueDate");
const timesWrapper = document.querySelector("#timesWrapper");
const timesPerWeek = document.querySelector("#times");
const habitContainer = document.querySelector(".habit_container");
const showActiveHabits = document.querySelector("#show_active");
const showArchivedHabits = document.querySelector("#show_archived");

const data = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : [];

const saveToLocalStorage = () => {
    localStorage.setItem("data", JSON.stringify(data));
};

// ✅ button factory
const createButtons = (label, className, onclick) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add(className);

    if (typeof onclick === "function") {
        btn.addEventListener("click", onclick);
    }

    return btn;
};

const calculateProgress = (habit) => {
    let total = 7;
    let currentStreak = habit.streak;

    let percentage = Math.floor(Math.min((currentStreak / total) * 100, 100));

    return percentage;
}
// ✅ render card
const renderHabitCard = (h, showArchived) => {
    const habit = document.createElement("div");
    habit.classList.add("habit");
    habit.style.borderLeft = `10px solid ${h.color}`;

    const title = document.createElement("p");
    title.classList.add("habit_title");
    title.textContent = h.title;

    const freq = document.createElement("p");
    freq.classList.add("habit_freq");
    freq.textContent = `Frequency: ${h.frequency}`;

    const streak = document.createElement("p");
    streak.classList.add("habit_streak");
    streak.textContent = `Streak: ${h.streak}`;

    const progress = calculateProgress(h);

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("progress_container");

    const progressBar = document.createElement("p");
    progressBar.classList.add("progress_bar");

    progressBar.style.width = "0%";

    setTimeout(() => {
        progressBar.style.width = `${progress}%`;
    }, 100);

    const progressText = document.createElement("p");
    progressText.textContent = `${progress}% completed`;

    habit.appendChild(title);
    habit.appendChild(freq);
    habit.appendChild(streak);
    progressContainer.appendChild(progressBar);
    habit.appendChild(progressText);
    habit.appendChild(progressContainer);

    // buttons last
    if (showArchived) {
        const restoreBtn = createButtons("♻️ Restore", "restore_btn", () => {
            h.archived = false;
            saveToLocalStorage();
            readHabit(true);
        });
        habit.appendChild(restoreBtn);
    } else {
        const streakBtn = createButtons("⬆️", "streak_btn", () => maintainStreak(h.id));
        const archivedBtn = createButtons("⛔", "archive_btn", () => archiveHabits(h.id));
        habit.appendChild(streakBtn);
        habit.appendChild(archivedBtn);
    }

    return habit;
};

// ✅ read habits
const readHabit = (showArchived = false) => {
    habitContainer.innerHTML = `<h1>${showArchived ? "Archived Habits" : "Your Habits"}</h1>`;

    let filteredData = data.filter(h => showArchived ? h.archived : !h.archived);

    if (filteredData.length === 0) {
        let message = document.createElement("p");
        message.textContent = showArchived ? "No archived habits yet." : "No habits added yet.";
        habitContainer.appendChild(message);
    } else {
        filteredData.forEach(h => {
            const habit = renderHabitCard(h, showArchived);
            habitContainer.appendChild(habit);
        });
    }
};

// ✅ archive habit
const archiveHabits = (id) => {
    const habit = data.find(h => h.id === id);
    if (!habit) return;

    habit.archived = true;
    saveToLocalStorage();
    readHabit();
};

// ✅ streak maintain
const maintainStreak = (id) => {
    const habit = data.find((h) => h.id === id);
    if (!habit) return;

    const today = new Date().toISOString().split("T")[0];
    const alreadyCompleted = habit.history.some(entry => entry.date === today && entry.completed);

    if (alreadyCompleted) {
        alert("You have already completed this habit for today ✅");
        return;
    }

    habit.streak += 1;
    habit.history.push({
        date: today,
        completed: true,
    });
    habit.updatedAt = Date.now();

    saveToLocalStorage();
    readHabit();
};

// ✅ add habit
habitForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let titleVal = habitTitleElem.value;
    let colorVal = habitColorElem.value;
    let frequencyVal = habitFrequency.value;
    let customFreVal = timesPerWeek.value;

    if (titleVal.trim() === "" || colorVal.trim() === "" || frequencyVal.trim() === "") return;

    if (frequencyVal === "custom") {
        frequencyVal = customFreVal;
    }

    const habitData = {
        id: Date.now(),
        title: titleVal,
        color: colorVal,
        frequency: frequencyVal,
        history: [],
        streak: 0,
        createdAt: Date.now(),
        updatedAt: null,
        archived: false,
    };

    data.push(habitData);

    // reset form
    habitTitleElem.value = "";
    habitColorElem.value = "";
    habitFrequency.value = "";
    timesPerWeek.value = "";
    timesWrapper.classList.remove("visible");

    readHabit();
    saveToLocalStorage();
});

// ✅ custom frequency show/hide
habitFrequency.addEventListener("change", (e) => {
    if (e.target.value === "custom") {
        timesWrapper.classList.add("visible");
    } else {
        timesWrapper.classList.remove("visible");
    }
});

// ✅ toggle buttons
showActiveHabits.addEventListener("click", () => readHabit(false));
showArchivedHabits.addEventListener("click", () => readHabit(true));

// first load
readHabit();