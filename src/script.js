const GIST_ID = "2bb78e5a29533659edb139aef9c27586";
const GIST_FILENAME = "images.json";
const GITHUB_TOKEN = "xxx";


let images = [];
let editCardIndex = null;


/*================== FILTER BUTTON AND ADD CARD MAKE SMALL HAHA ====================*/
function updateButtonTextForScreenSize() {
  const filterBtn = document.getElementById('filter-button');
  const addCardBtn = document.getElementById('add-card-button');

  if (window.innerWidth < 600) {
    filterBtn.textContent = "▼";
    addCardBtn.textContent = "＋";
  } else {
    filterBtn.textContent = "Filter";
    addCardBtn.textContent = "Add Card";
  }
}
/*============================= CARDS THEMSELVES  ==================================*/

function createImageElement(imageObj) {
  const { src, category = "", elements = [] } = imageObj;

  console.log('Creating image element:', { src, category, elements });

  const container = document.createElement("div");
  container.className = "image-container";
  container.setAttribute("draggable", true);
  container.classList.add("draggable");
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
  
  const deleteBtn = document.createElement("div");
  deleteBtn.className = "card-delete-button";
  deleteBtn.innerHTML = "🗑️";
  container.appendChild(deleteBtn);

  
  const editBtn = document.createElement("div");
  editBtn.className = "edit-card-button";
  editBtn.innerHTML = "✎"; // pencil icon for edit
  container.appendChild(editBtn);

  return container;
}

function makeDraggable() {
  let dragSrcIndex = null;
  const grid = document.querySelector(".grid-space");
  const items = Array.from(grid.querySelectorAll(".draggable"));

  items.forEach((item, index) => {
    item.setAttribute("data-index", index);

    item.addEventListener("dragstart", (e) => {
      dragSrcIndex = index;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "dragging");
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      item.classList.add("drag-over");
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");

      const targetIndex = parseInt(item.getAttribute("data-index"));
      if (dragSrcIndex !== null && targetIndex !== dragSrcIndex) {
        const moved = images.splice(dragSrcIndex, 1)[0];
        images.splice(targetIndex, 0, moved);
        renderGrid();
        saveToGist();
        showStatus("Reordering...", 4000);
      }
    });
  });
}


/*=========================== RENDER GRID  ================================*/
function renderGrid() {
  const grid = document.querySelector('.grid-space');
  grid.innerHTML = "";

  images.forEach(img => {
    grid.appendChild(createImageElement(img));
  });

  makeDraggable(); // enable reordering after rendering
}


async function fetchFromGist() {
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
    const gistData = await response.json();
    const fileContent = gistData.files[GIST_FILENAME].content;
    const parsed = JSON.parse(fileContent);

    // Fully load all card properties
    images = parsed.images.map(card => ({
      src: card.src,
      category: card.category || "",
      elements: card.elements || [],
      name: card.name || "",
      rarity: card.rarity || "",
      collection: card.collection || "",
      hp: card.hp || 0,
      atk: card.atk || 0,
      buddies: card.buddies || []
    }));

    renderGrid();
  } catch (err) {
    console.error("Error fetching from Gist:", err);
    alert("Failed to load cards from Gist.");
  }
}


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
    atk,
    buddies: selectedBuddies 
  };
}


async function saveToGist() {
  const updatedContent = JSON.stringify({ images }, null, 2);

  showStatus("Saving..."); // show before save starts

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


    setTimeout(() => showStatus("✔ Saved"), 5000);

  } catch (err) {
    console.error("❌ Error updating Gist:", err);
    const resText = await err.response?.text?.();
    console.error("Gist update response:", resText || "(no response)");
    alert("Failed to save to Gist. Check your token, Gist ID, or network.");
  }
}


function showStatus(msg = '✔ Saved') {
  const statusEl = document.getElementById('save-status');
  statusEl.textContent = msg;
  statusEl.classList.add('visible');
  setTimeout(() => statusEl.classList.remove('visible'), 1200);
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
  document.querySelectorAll('.spell-slots').forEach(spellSlots => {
    const addSpellBtn = spellSlots.querySelector('.add-spell-btn');


    addSpellBtn.addEventListener('click', () => {
      const slots = spellSlots.querySelectorAll('.spell-slot');
      if (slots.length < 3) {
        const newSlot = slots[0].cloneNode(true);
        newSlot.querySelector('select').selectedIndex = 0;

        // Add delete button
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

    // Event delegation for delete buttons
    spellSlots.addEventListener('click', (e) => {
      if (e.target.classList.contains('spell-slot-delete')) {
        const slot = e.target.closest('.spell-slot');
        slot.remove();
        if (spellSlots.querySelectorAll('.spell-slot').length < 3) {
          spellSlots.querySelector('.add-spell-btn').style.display = 'block';
        }
      }
    });

    // Icon preview on change (optional but cool)
    spellSlots.addEventListener('change', (e) => {
      if (e.target.tagName === 'SELECT') {
        const iconUrls = {
          'Flora': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/plant.svg',
          'Water': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/water.svg',
          'Fire': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/fire.svg',
          'Cosmic': 'https://raw.githubusercontent.com/Esjaee/Twst-Cards/main/data/assets/icons/cosmic.svg'
        };

        const slot = e.target.closest('.spell-slot');
        const icon = slot.querySelector('.element-icon');
        const selected = e.target.value;

        if (icon && iconUrls[selected]) {
          icon.style.backgroundImage = `url(${iconUrls[selected]})`;
        } else if (icon) {
          icon.style.backgroundImage = '';
        }
      }
    });
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

/*============================== BUDDY BLOCK =========================================*/
let selectedBuddies = [];

const ALL_BUDDIES = [
  "Ace", "Deuce", "Grim", "Cater", "Trey", "Riddle", "Leona", "Ruggie", "Jack",
  "Azul", "Jade", "Floyd", "Vil", "Rook", "Epel", "Idia", "Ortho", "Malleus", 
  "Silver", "Lilia", "Sebek", "Jamil", "Kalim"
];

// Renders tags inside a container
function renderBuddyTags(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  selectedBuddies.forEach(name => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${name}<span class="remove">✕</span>`;
    tag.querySelector('.remove').addEventListener('click', () => {
      selectedBuddies = selectedBuddies.filter(b => b !== name);
      renderBuddyTags(containerId);
    });
    container.appendChild(tag);
  });
}

// Sets up input, suggestion list, and handlers
function setupBuddyBlock(inputId, tagContainerId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);

  input.addEventListener('input', () => {
    const value = input.value.trim();
    if (!value || selectedBuddies.length >= 3) {
      suggestions.innerHTML = '';
      return;
    }

    const filtered = ALL_BUDDIES.filter(name =>
      name.toLowerCase().startsWith(value.toLowerCase()) &&
      !selectedBuddies.includes(name)
    );

    suggestions.innerHTML = '';
    filtered.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      li.addEventListener('click', () => {
        if (selectedBuddies.length < 3) {
          selectedBuddies.push(name);
          renderBuddyTags(tagContainerId);
          input.value = '';
          suggestions.innerHTML = '';
        }
      });
      suggestions.appendChild(li);
    });
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      const value = input.value.trim();
      if (
        value &&
        ALL_BUDDIES.includes(value) &&
        !selectedBuddies.includes(value) &&
        selectedBuddies.length < 3
      ) {
        selectedBuddies.push(value);
        renderBuddyTags(tagContainerId);
        input.value = '';
        suggestions.innerHTML = '';
      }
      e.preventDefault();
    }
  });
}


/*=========================== EDIT CARD MODAL =====================================*/
function openEditModal(card) {
  // Show modal
  document.querySelector('.edit-card-modal-overlay').style.display = 'flex';

  // Preview image
  const preview = document.getElementById('editImagePreview');
  preview.style.backgroundImage = `url("${card.src}")`;

  // Fill fields
  document.getElementById('editCharacterNameInput').value = card.name || '';
  document.getElementById('editImageUrlInput').value = card.src || '';
  document.getElementById('editCollectionInput').value = card.collection || '';
  document.getElementById('editStatHP').value = card.hp || 0;
  document.getElementById('editStatATK').value = card.atk || 0;

  // Setup rarity
  document.querySelectorAll('#editRarityOptions .rarity-option').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-rarity') === card.rarity);
  });

  // Setup spells
  const spellSlots = document.getElementById('editSpellSlots');

  // ❗️Clear only .spell-slot, leave the "+" button
  spellSlots.querySelectorAll('.spell-slot').forEach(slot => slot.remove());

  // Add styled spell slots with delete buttons
  card.elements.forEach((element, i) => {
    const slot = document.createElement('div');
    slot.className = 'spell-slot';

    const wrapper = document.createElement('div');
    wrapper.className = 'spell-element-select';

    const icon = document.createElement('span');
    icon.className = 'element-icon';
    wrapper.appendChild(icon);

    const select = document.createElement('select');
    ['', 'Flora', 'Fire', 'Water', 'Cosmic'].forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      if (type === element) option.selected = true;
      select.appendChild(option);
    });

    wrapper.appendChild(select);
    slot.appendChild(wrapper);

    if (i > 0) {
      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'spell-slot-delete';
      deleteBtn.innerHTML = '✕';
      slot.appendChild(deleteBtn);
    }

    // Insert before the "+" button
    spellSlots.insertBefore(slot, spellSlots.querySelector('.add-spell-btn'));
  });

  // Buddy pills
  selectedBuddies = [...(card.buddies || [])];
  renderBuddyTags("edit-buddy-tags");

  // Reapply shared behavior (icon preview, deletion, add logic)
  setupSpellSlots();
}

/*============================= MODAL CONSOLIDATION  =====================================*/
function fillCardForm(card, prefix = '') {
  document.getElementById(`${prefix}CharacterNameInput`).value = card.name || '';
  document.getElementById(`${prefix}ImageUrlInput`).value = card.src || '';
  document.getElementById(`${prefix}CollectionInput`).value = card.collection || '';
  document.getElementById(`${prefix}StatHP`).value = card.hp || 0;
  document.getElementById(`${prefix}StatATK`).value = card.atk || 0;

  // Rarity
  document.querySelectorAll(`#${prefix}RarityOptions .rarity-option`).forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-rarity') === card.rarity);
  });

  // Spells
  const spellSlots = document.getElementById(`${prefix}SpellSlots`);
  spellSlots.innerHTML = '';
  card.elements?.forEach(val => {
    const select = document.createElement('select');
    ['','Fire','Water','Flora','Cosmic'].forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      if (type === val) opt.selected = true;
      select.appendChild(opt);
    });
    const slot = document.createElement('div');
    slot.className = 'spell-slot';
    slot.appendChild(select);
    spellSlots.appendChild(slot);
  });

  // Add "+" spell button
  const addBtn = document.createElement('button');
  addBtn.className = `${prefix}-add-spell-btn`;
  addBtn.textContent = '+';
  spellSlots.appendChild(addBtn);

  // Buddies
  selectedBuddies = [...(card.buddies || [])];
  renderBuddyTags(prefix);
}


function renderBuddyTags(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  selectedBuddies.forEach(name => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${name}<span class="remove">✕</span>`;
    tag.querySelector('.remove').addEventListener('click', () => {
      selectedBuddies = selectedBuddies.filter(b => b !== name);
      renderBuddyTags(containerId);
    });
    container.appendChild(tag);
  });
}

function setupBuddyInput(inputId, tagContainerId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);

  input.addEventListener("input", () => {
    const value = input.value.trim();
    if (value && selectedBuddies.length < 3) {
      const filtered = ALL_BUDDIES.filter(name =>
        name.toLowerCase().startsWith(value.toLowerCase()) &&
        !selectedBuddies.includes(name)
      );

      suggestions.innerHTML = "";
      filtered.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        li.addEventListener("click", () => {
          if (selectedBuddies.length < 3) {
            selectedBuddies.push(name);
            renderBuddyTags(tagContainerId.replace("-tags", "")); // Fix the tag rendering
            input.value = "";
            suggestions.innerHTML = "";
          }
        });
        suggestions.appendChild(li);
      });
    } else {
      suggestions.innerHTML = "";
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = input.value.trim();
      if (
        value &&
        ALL_BUDDIES.includes(value) &&
        !selectedBuddies.includes(value) &&
        selectedBuddies.length < 3
      ) {
        selectedBuddies.push(value);
        renderBuddyTags(tagContainerId);
        input.value = "";
        suggestions.innerHTML = "";
      }
      e.preventDefault();
    }
  });
}


/*============================== DOM CONTENT LOAD =========================================*/
document.addEventListener('DOMContentLoaded', () => {
  // Initial Fetch
  fetchFromGist();

  // Modal Setup
  const addCardButton = document.querySelector('.add-card-button');
  const addCardModalOverlay = document.querySelector('.add-card-modal-overlay');
  const addCardModalClose = document.querySelector('.add-card-modal-close');

  addCardButton.addEventListener('click', () => {
    addCardModalOverlay.style.display = 'flex';
  });

  addCardModalClose.addEventListener('click', () => {
    addCardModalOverlay.style.display = 'none';
  });

  addCardModalOverlay.addEventListener('click', (event) => {
    if (event.target === addCardModalOverlay) {
      addCardModalOverlay.style.display = 'none';
    }
  });

  // Setup Spell, Buddy, Rarity, and UI responsiveness
  setupSpellSlots();
  setupBuddyBlock("buddyInput", "buddy-tags", "buddySuggestions");
  setupBuddyBlock("editBuddyInput", "edit-buddy-tags", "editBuddySuggestions");
  setupRaritySelection();
  updateButtonTextForScreenSize();
  window.addEventListener('resize', updateButtonTextForScreenSize);

  // Save Card Logic (Add modal)
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
      elements: cardData.elements,
      name: cardData.name,
      rarity: cardData.rarity,
      collection: cardData.collection,
      hp: cardData.hp,
      atk: cardData.atk,
      buddies: cardData.buddies
    };

    images.push(newCard);
    saveToGist();

    const grid = document.querySelector('.grid-space');
    const newCardElement = createImageElement(newCard);
    grid.appendChild(newCardElement);

    selectedBuddies = [];
    renderBuddyTags("buddy-tags");

    addCardModalOverlay.style.display = 'none';
    resetModalForm();
  });

  // Delete card logic
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('card-delete-button')) {
      const cardElement = e.target.closest('.image-container');
      const src = cardElement.dataset.src;

      images = images.filter(img => img.src !== src);
      saveToGist();
      cardElement.remove();
    }
  });

  // Edit card logic
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-card-button')) {
      const cardElement = e.target.closest('.image-container');
      const src = cardElement.dataset.src;
      const index = images.findIndex(img => img.src === src);

      if (index !== -1) {
        editCardIndex = index;
        const card = images[index];

        openEditModal(card);
        setupSpellSlots(); // Re-apply spell logic
      }
    }
  });

  // Update card logic (Edit modal)
  const updateBtn = document.querySelector('.update-card-button');
  updateBtn.addEventListener('click', () => {
    if (editCardIndex === null) return;

    const updatedCard = {
      name: document.getElementById('editCharacterNameInput').value.trim(),
      src: document.getElementById('editImageUrlInput').value.trim(),
      collection: document.getElementById('editCollectionInput').value.trim(),
      hp: parseInt(document.getElementById('editStatHP').value.trim(), 10) || 0,
      atk: parseInt(document.getElementById('editStatATK').value.trim(), 10) || 0,
      rarity: document.querySelector('#editRarityOptions .rarity-option.active')?.getAttribute('data-rarity') || '',
      elements: Array.from(document.querySelectorAll('#editSpellSlots select')).map(s => s.value).filter(val => val !== ''),
      buddies: selectedBuddies
    };

    images[editCardIndex] = updatedCard;
    saveToGist();
    renderGrid();

    document.querySelector('.edit-card-modal-overlay').style.display = 'none';
    editCardIndex = null;
  });

  // Close edit modal logic
  document.querySelector('.edit-card-modal-close').addEventListener('click', () => {
    document.querySelector('.edit-card-modal-overlay').style.display = 'none';
    editCardIndex = null;
  });

  document.querySelector('.edit-card-modal-overlay').addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-card-modal-overlay')) {
      event.target.style.display = 'none';
      editCardIndex = null;
    }
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
