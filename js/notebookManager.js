// notebookManager.js - Manages caching, fallback, and sorting for notebooks

const NOTEBOOKS_KEY = "cached_notebooks";

async function fetchNotebooks() {
    try {
        // Check if cached data exists
        let cachedData = localStorage.getItem(NOTEBOOKS_KEY);
        if (cachedData) {
            console.log("Using cached notebooks.");
            return JSON.parse(cachedData);
        }

        // Fetch notebooks dynamically (adjust URL/path as needed)
        let response = await fetch("/ipynb/");
        if (!response.ok) throw new Error("Failed to fetch notebooks.");

        let notebooks = await response.json();
        
        // Cache data
        localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks));
        return notebooks;
    } catch (error) {
        console.error("Error fetching notebooks:", error);
        return [];
    }
}

function fallbackNotebooks() {
    return [{ name: "Sample_Notebook.ipynb", date: "N/A" }];
}

function sortNotebooks(notebooks, sortBy = "name") {
    return notebooks.sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "date") return new Date(b.date) - new Date(a.date);
        return 0;
    });
}

async function displayNotebooks(sortBy = "name") {
    let notebooks = await fetchNotebooks();
    if (notebooks.length === 0) {
        notebooks = fallbackNotebooks();
    }
    notebooks = sortNotebooks(notebooks, sortBy);

    let container = document.getElementById("notebook-list");
    container.innerHTML = "";
    notebooks.forEach(nb => {
        let item = document.createElement("div");
        item.innerText = `${nb.name} (${nb.date})`;
        container.appendChild(item);
    });
}

// Sorting dropdown event listener
document.getElementById("sort-options").addEventListener("change", (event) => {
    displayNotebooks(event.target.value);
});

// Example: Call displayNotebooks("date") to sort by date
document.addEventListener("DOMContentLoaded", () => displayNotebooks("name"));
