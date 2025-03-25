const GIST_ID = "c3faa4fb97af9853cf665fa02cc9b07d";
const GIST_FILENAME = "images.json";
const GITHUB_TOKEN = "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";

let images = [];

function createImageElement(imageObj) {
  const { src, category = "" } = imageObj;

  const container = document.createElement("div");
  container.className = "image-container";
  container.setAttribute("draggable", true);
  container.dataset.src = src;

  const img = document.createElement("img");
  img.src = src;

  const label = document.createElement("div");
  label.className = "category-label";
  label.textContent = category;
  label.style.display = category ? "block" : "none";

  container.appendChild(img);
  container.appendChild(label);
  return container;
}

function renderGrid() {
  const grid = document.querySelector('.grid-space');
  grid.innerHTML = "";

  images.forEach(img => {
    grid.appendChild(createImageElement(img));
  });
}

async function fetchFromGist() {
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const data = await res.json();
    const content = JSON.parse(data.files[GIST_FILENAME].content);

    images = (content.images || []).map(img =>
      typeof img === "string" ? 
        { src: img, category: "No category" } : 
        { 
          src: img.src, 
          category: img.category || "No category"
        }
    );

    renderGrid();
  } catch (err) {
    console.error("Error loading from Gist:", err);
  }
}

// Initial fetch when the page loads
document.addEventListener('DOMContentLoaded', fetchFromGist);
