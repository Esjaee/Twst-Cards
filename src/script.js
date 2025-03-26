const GIST_ID = "2bb78e5a29533659edb139aef9c27586";
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

  const img = document.createElement("img");
  img.src = src;

  // Mapping for icon URLs
  const elementIconUrls = {
    'Flora': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/plant.svg',
    'Water': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/water.svg',
    'Fire': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/fire.svg'
  };

  // Create element icons container
  const elementIconsContainer = document.createElement("div");
  elementIconsContainer.className = "element-icons";

  // Add element icons
  elements.forEach(element => {
    console.log('Processing element:', element);
    
    const iconElement = document.createElement("div");
    iconElement.className = "element-icon";
    
    // Use the raw GitHub URL for the specific element
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
    
    // Log the raw content to help debug
    console.log('Raw Gist Content:', data.files[GIST_FILENAME].content);
    
    const content = JSON.parse(data.files[GIST_FILENAME].content);

    images = (content.images || []).map(img => ({
      src: img.src,
      category: img.category || "No category",
      elements: img.elements || [] // Ensure elements is always an array
    }));

    renderGrid();
  } catch (err) {
    console.error("Error loading from Gist:", err);
  }
}

// Initial fetch when the page loads
document.addEventListener('DOMContentLoaded', fetchFromGist);// Existing code remains the same

// Modal Interaction
document.addEventListener('DOMContentLoaded', () => {
  const addCardButton = document.querySelector('.add-card-button');
  const addCardModalOverlay = document.querySelector('.add-card-modal-overlay');
  const addCardModalClose = document.querySelector('.add-card-modal-close');


  addCardButton.addEventListener('click', () => {
    addCardModalOverlay.style.display = 'flex';
  });
  
    // Close modal when clicking the 'x' button
  addCardModalClose.addEventListener('click', () => {
    addCardModalOverlay.style.display = 'none';
  });

  // Close modal when clicking outside the modal
  addCardModalOverlay.addEventListener('click', (event) => {
    if (event.target === addCardModalOverlay) {
      addCardModalOverlay.style.display = 'none';
    }
  });
});


/*** ADD CARD MODAL STUFDDFRE*/
function previewImage() {
  const url = document.getElementById('imageUrlInput').value.trim();
  const preview = document.getElementById('imagePreview');
  preview.style.backgroundImage = url ? `url("${url}")` : '';
  
  
/*============================== SPELL BLOCK =========================================*/
function toggleElementDropdown(slot) {
  slot.classList.toggle("open");
}

function updateSpellDisplay(select) {
  const slot = select.parentElement;
  const selected = select.value;
  slot.querySelector(".selected-element").textContent = selected[0]; // First letter as icon
  slot.classList.remove("open");
}

function addSpellSlot() {
  const container = document.getElementById("spellSlotContainer");
  const existingSlots = container.querySelectorAll(".spell-slot");
  if (existingSlots.length >= 3) return;

  const newSlot = existingSlots[0].cloneNode(true);
  newSlot.querySelector(".selected-element").textContent = "?";
  newSlot.querySelector(".element-dropdown").selectedIndex = 0;
  newSlot.classList.remove("open");
  container.insertBefore(newSlot, container.querySelector(".add-spell-button"));
}

/*============================== END OF SPELL BLOCK ==================================*/
}
