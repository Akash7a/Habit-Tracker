export const loadData = (key) => JSON.parse(localStorage.getItem(key)) || [];
export const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));