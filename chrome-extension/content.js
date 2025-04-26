console.log('Content script loaded');

// Function to inject the search popup
function injectSearchPopup() {
  console.log('Injecting search popup');
  
  // Check if popup already exists
  if (document.getElementById('searchOverlay')) {
    console.log('Popup already exists');
    return;
  }

  // Create and inject the search popup HTML
  const popupHTML = `
    <div class="search-overlay" id="searchOverlay">
      <div class="search-popup">
        <h3>What are you searching for?</h3>
        <input type="text" id="searchInput" placeholder="Enter your search query...">
        <button id="submitSearch">Search</button>
      </div>
    </div>
  `;

  // Create and inject the styles
  const style = document.createElement('style');
  style.textContent = `
    .search-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99999;
    }
    .search-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 100000;
      width: 300px;
    }
    .search-popup h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    .search-popup input {
      width: 100%;
      padding: 8px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .search-popup button {
      width: 100%;
      padding: 8px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .search-popup button:hover {
      background-color: #45a049;
    }
  `;

  // Inject the styles and HTML
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', popupHTML);

  // Set up event listeners for the newly injected popup
  setupPopupListeners();
}

// Function to set up popup event listeners
function setupPopupListeners() {
  const overlay = document.getElementById('searchOverlay');
  const searchInput = overlay.querySelector('#searchInput');
  const submitButton = overlay.querySelector('#submitSearch');

  // Store search query in a variable accessible to the window
  window.lastSearchQuery = '';

  // Handle search submission
  submitButton.onclick = () => handleSearch();

  // Handle Enter key press
  searchInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close popup when clicking outside
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      searchInput.value = '';
    }
  };
}

// Function to handle search submission
function handleSearch() {
  const overlay = document.getElementById('searchOverlay');
  const searchInput = overlay.querySelector('#searchInput');
  const query = searchInput.value.trim();
  
  if (query) {
    // Store the query in case we need it later
    window.lastSearchQuery = query;
    
    try {
      chrome.runtime.sendMessage({ 
        action: 'searchQuery', 
        query: query 
      }, (response) => {
        if (chrome.runtime.lastError) {
          // Handle the error gracefully
          console.log('Search query will be stored in page context');
        }
      });
    } catch (e) {
      console.log('Extension context invalidated, storing query in page context');
    }
    
    overlay.style.display = 'none';
    searchInput.value = '';
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'showSearchPopup') {
      // Make sure the popup is injected
      if (!document.getElementById('searchOverlay')) {
        injectSearchPopup();
      }
      
      const overlay = document.getElementById('searchOverlay');
      const searchInput = overlay.querySelector('#searchInput');
      
      // Show the popup
      overlay.style.display = 'block';
      searchInput.focus();
      
      // Send response to confirm popup is shown
      sendResponse({ success: true });
    }
  } catch (e) {
    console.error('Error in message listener:', e);
    sendResponse({ success: false, error: e.message });
  }
  return true;
}); 