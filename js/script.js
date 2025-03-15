document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "https://api.github.com/repos/NickCore18/ipynb_site/contents/ipynb";
    const cacheKey = "notebooksCache";
    const cacheExpiryKey = "notebooksCacheExpiry";
    let searchAndSortAdded = false;

    async function fetchNotebooks() {
        const cachedData = localStorage.getItem(cacheKey);
        const cacheExpiry = localStorage.getItem(cacheExpiryKey);
        
        if (cachedData && cacheExpiry && new Date().getTime() < cacheExpiry) {
            return JSON.parse(cachedData);
        }

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch notebooks.");
            const data = await response.json();
            
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(cacheExpiryKey, new Date().getTime() + 3600000);
            return data;
        } catch (error) {
            console.error("Error fetching notebooks:", error);
            return [];
        }
    }

    function renderNotebookPreviews(notebooks) {
        const previewContainer = document.getElementById("preview-container");
        previewContainer.innerHTML = "";
        
        if (notebooks.length === 0) {
            previewContainer.innerHTML = `<h2>No notebooks found.</h2>`;
            return;
        }

        notebooks.forEach(notebook => {
            if (notebook.name.endsWith(".ipynb")) {
                const notebookUrl = `https://nbviewer.jupyter.org/github/NickCore18/ipynb_site/blob/main/ipynb/${notebook.name}`;
                const repoUrl = `https://github.com/NickCore18/ipynb_site/blob/main/ipynb/${notebook.name}`;
                const colabUrl = `https://colab.research.google.com/github/NickCore18/ipynb_site/blob/main/ipynb/${notebook.name}`;

                previewContainer.innerHTML += `
                    <div class="col-md-6 notebook-preview border p-3">
                        <h3>${notebook.name.replace(".ipynb", "")}</h3>
                        <iframe src="${notebookUrl}" title="Notebook Preview" allowfullscreen style="width: 100%; height: 300px;"></iframe>
                        <div class="mt-2">
                            <a href="${repoUrl}" class="btn btn-primary me-2" target="_blank">GitHub</a>
                            <a href="${notebookUrl}" class="btn btn-success me-2" target="_blank">nbviewer</a>
                            <a href="${colabUrl}" class="btn btn-warning" target="_blank">Colab</a>
                        </div>
                    </div>
                `;
            }
        });
    }

    function addSearchAndSort() {
        if (searchAndSortAdded) return;
        searchAndSortAdded = true;
        const controlsContainer = document.getElementById("notebooks");
        controlsContainer.insertAdjacentHTML("afterbegin", `
            <div class="mb-3 d-flex justify-content-center">
                <div class="w-50">
                    <input type="text" id="search-input" class="form-control" placeholder="Search notebooks...">
                </div>
                <div class="ms-2 w-25">
                    <select id="sort-select" class="form-select">
                        <option value="alpha-asc">Sort: A-Z</option>
                        <option value="alpha-desc">Sort: Z-A</option>
                        <option value="date-new">Sort: Newest</option>
                        <option value="date-old">Sort: Oldest</option>
                    </select>
                </div>
            </div>
        `);
    }

    function handleSearchAndSort(notebooks) {
        document.getElementById("search-input").addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            const filtered = notebooks.filter(nb => nb.name.toLowerCase().includes(searchTerm));
            renderNotebookPreviews(filtered);
        });

        document.getElementById("sort-select").addEventListener("change", function() {
            let sortedNotebooks = [...notebooks];
            if (this.value === "alpha-asc") {
                sortedNotebooks.sort((a, b) => a.name.localeCompare(b.name));
            } else if (this.value === "alpha-desc") {
                sortedNotebooks.sort((a, b) => b.name.localeCompare(a.name));
            } else if (this.value === "date-new") {
                sortedNotebooks.sort((a, b) => new Date(b.git_commit_date) - new Date(a.git_commit_date));
            } else if (this.value === "date-old") {
                sortedNotebooks.sort((a, b) => new Date(a.git_commit_date) - new Date(b.git_commit_date));
            }
            renderNotebookPreviews(sortedNotebooks);
        });
    }

    async function loadNotebooks() {
        const notebooks = await fetchNotebooks();
        addSearchAndSort();
        renderNotebookPreviews(notebooks);
        handleSearchAndSort(notebooks);
    }

    loadNotebooks();
});
