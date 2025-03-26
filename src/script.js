const GIST_ID = "c3faa4fb97af9853cf665fa02cc9b07d";
const GIST_FILENAME = "images.json";
const GITHUB_TOKEN = "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";

let images = [];

function createImageElement(imageObj) {
  const { src, category = "", elements = [] } = imageObj;

  console.log('Creating image element:', { src, category, elements });

  const container = document.createElement("div");
  container.className = "image-container";
  container.setAttribute("draggable", true);
  container.dataset.src = src;
  
  /*UHH... THIS AUTOMATICALLY CREATES ELEMENT FOR EACH NEW IMAGE*/
  const img = document.createElement("img");
  img.src = src;

  /*ELEMENT ICON SVG URLS*/
  const elementIconUrls = {
    'Flora': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/plant.svg',
    'Water': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/water.svg',
    'Fire': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/fire.svg'
  };

  /*ELEMENT ICON CONTAINER ADDING*/
  const elementIconsContainer = document.createElement("div");
  elementIconsContainer.className = "element-icons";

  /* ELEMENT ICON ADDING*/
  elements.forEach(element => {
    console.log('Processing element:', element);
    
    const iconElement = document.createElement("div");
    iconElement.className = "element-icon";
    
    if (elementIconUrls[element]) {
      iconElement.style.backgroundImage = `url(${elementIconUrls[element]})`;
      console.log('Setting background image for:', element);
    } else {
      console.warn('No icon found for element:', element);
    }
    
    elementIconsContainer.appendChild(iconElement);
  });

  container.appendChild(img);
  container.appendChild(elementIconsContainer);
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
    
    /* GIST LOGGING FOR ERRORS */
    console.log('Raw Gist Content:', data.files[GIST_FILENAME].content);
    
    const content = JSON.parse(data.files[GIST_FILENAME].content);

    images = (content.images || []).map(img => ({
      src: img.src,
      category: img.category || "No category",
      elements: img.elements || [] 
    }));

    renderGrid();
  } catch (err) {
    console.error("Error loading from Gist:", err);
  }
}

/* GIST FETCH */
document.addEventListener('DOMContentLoaded', fetchFromGist);
