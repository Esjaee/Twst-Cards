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
    'Fire': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/fire.svg',
    'Cosmic': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/cosmic.svg'
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

/*============================== SAVE CARD =========================================*/

function getCardDataFromModal() {
  const name = document.getElementById('characterNameInput').value.trim();
  const src = document.getElementById('imageUrlInput').value.trim();

  // Get elements
  const elementSelects = document.querySelectorAll('.spell-slot select');
  const elements = Array.from(elementSelects)
    .map(select => select.value.trim())
    .filter(val => val !== "");

  // Get rarity
  const rarityBtn = document.querySelector('.rarity-option.active');
  const rarity = rarityBtn ? rarityBtn.getAttribute('data-rarity') : null;

  // Get collection
  const collection = document.getElementById('collectionInput').value.trim();

  // Get stats
  const hp = parseInt(document.getElementById('statHP').value.trim(), 10) || 0;
  const atk = parseInt(document.getElementById('statATK').value.trim(), 10) || 0;

  return {
    name,
    src,
    elements,
    rarity,
    collection,
    hp,
    atk
  };
}

async function saveToGist() {
  const updatedContent = JSON.stringify({ images }, null, 2);

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: updatedContent
          }
        }
      })
    });

    if (!res.ok) throw new Error("Failed to update Gist");

    console.log("✅ Gist updated successfully");
  } catch (err) {
    console.error("❌ Error updating Gist:", err);
    alert("Failed to save to Gist. Check your network or GitHub token.");
  }
}

/*============================== SAVE CARD =========================================*/


/*** ADD CARD MODAL STUFDDFRE*/
function previewImage() {
  const url = document.getElementById('imageUrlInput').value.trim();
  const preview = document.getElementById('imagePreview');
  preview.style.backgroundImage = url ? `url("${url}")` : '';
}
  
/*============================== SPELL BLOCK =========================================*/
function setupSpellSlots() {
  const spellSlots = document.querySelector('.spell-slots');
  const addSpellBtn = spellSlots.querySelector('.add-spell-btn');
  const previewImage = document.getElementById('imagePreview');
  
  let previewElementIcons = previewImage.querySelector('.preview-element-icons');
  if (!previewElementIcons) {
    previewElementIcons = document.createElement('div');
    previewElementIcons.className = 'preview-element-icons';
    previewImage.appendChild(previewElementIcons);
  }
  
  addSpellBtn.addEventListener('click', () => {
    const slots = spellSlots.querySelectorAll('.spell-slot');
    if (slots.length < 3) {
      const newSlot = slots[0].cloneNode(true);
      newSlot.querySelector('select').selectedIndex = 0;
      
      // Add delete button for the new slot
      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'spell-slot-delete';
      deleteBtn.innerHTML = '✕';
      newSlot.appendChild(deleteBtn);
      
      spellSlots.insertBefore(newSlot, addSpellBtn);
      
      if (spellSlots.querySelectorAll('.spell-slot').length >= 3) {
        addSpellBtn.style.display = 'none';
      }
    }
  });

  // Delegate event for delete buttons
  spellSlots.addEventListener('click', (e) => {
    if (e.target.classList.contains('spell-slot-delete')) {
      const slot = e.target.closest('.spell-slot');
      const element = slot.querySelector('select').value;
      
      // Remove corresponding element icon from preview
      const iconToRemove = previewImage.querySelector(`.icon-${element}`);
      if (iconToRemove) iconToRemove.remove();
      
      // Remove the slot
      slot.remove();
      
      // Show add button if now less than 3 slots
      addSpellBtn.style.display = 'block';
    }
  });

spellSlots.addEventListener('change', (e) => {
  if (e.target.tagName === 'SELECT') {
    const slot = e.target.closest('.spell-slot');
    const selectedElement = e.target.value;

    const iconUrls = {
      'Flora': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/plant.svg',
      'Water': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/water.svg',
      'Fire': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/fire.svg',
      'Cosmic': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/cosmic.svg'
    };

    const previewElementIcons = document.querySelector('.preview-element-icons');

    // First: remove ALL icons of the current spell slot
    // then add the updated one
    const allSlotIcons = Array.from(previewElementIcons.querySelectorAll(`.element-icon`));
    const slotIndex = Array.from(spellSlots.querySelectorAll('.spell-slot')).indexOf(slot);

    // Remove any existing icon added by this slot (identified by a slot index class)
    allSlotIcons.forEach(icon => {
      if (icon.dataset.slotIndex === String(slotIndex)) {
        icon.remove();
      }
    });

    // Add the updated icon
    if (selectedElement && iconUrls[selectedElement]) {
      const iconElement = document.createElement('div');
      iconElement.className = `element-icon icon-${selectedElement}`;
      iconElement.dataset.slotIndex = slotIndex; // track which slot added this icon
      iconElement.style.backgroundImage = `url(${iconUrls[selectedElement]})`;
      previewElementIcons.appendChild(iconElement);
    }
  }
});

}

/*============================== END OF SPELL BLOCK ==================================*/

/*================================= RARITY BLOCK =====================================*/
function setupRaritySelection() {
  const rarityButtons = document.querySelectorAll('.rarity-option');

  rarityButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      rarityButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const selectedRarity = btn.getAttribute('data-rarity');
      console.log('Selected rarity:', selectedRarity); // or store for form submission
    });
  });
}

/*============================== END OF RARITY BLOCK ==================================*/

/*============================== COLLECTION BLOCK =====================================*/

/*=========================== END OF COLLECTION BLOCK =================================*/

/*============================== STATS BLOCK =========================================*/

/*=========================== END OF STATS BLOCK =====================================*/



/*============================== DOM CONTENT LOAD =========================================*/
document.addEventListener('DOMContentLoaded', () => {
  fetchFromGist();
  setupSpellSlots();
  setupRaritySelection();

  const saveButton = document.querySelector('.save-card-button');

  saveButton.addEventListener('click', () => {
    const cardData = getCardDataFromModal();
    console.log("Collected Card Data:", cardData);

    if (!cardData.name || !cardData.src || cardData.elements.length < 2 || !cardData.rarity) {
      alert("Please complete all required fields: name, image, at least 2 spells, and rarity.");
      return;
    }

    const newCard = {
      src: cardData.src,
      category: cardData.collection || "Uncategorized",
      elements: cardData.elements
    };

    images.push(newCard);
    saveToGist();

    const grid = document.querySelector('.grid-space');
    const newCardElement = createImageElement(newCard);
    grid.appendChild(newCardElement);

    // Close modal
    document.querySelector('.add-card-modal-overlay').style.display = 'none';

    // Optional: Reset modal form
    resetModalForm();
  });
});
/*========================*/
function resetModalForm() {
  document.getElementById('characterNameInput').value = '';
  document.getElementById('imageUrlInput').value = '';
  document.getElementById('collectionInput').value = '';
  document.getElementById('statHP').value = '';
  document.getElementById('statATK').value = '';

  document.querySelectorAll('.spell-slot select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('.rarity-option').forEach(r => r.classList.remove('active'));

  const iconContainer = document.querySelector('.preview-element-icons');
  if (iconContainer) iconContainer.innerHTML = '';
}






