console.log('Popup script loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  const loadPageButton = document.getElementById('loadPage');
  const searchPageButton = document.getElementById('searchPage');
  const responseDiv = document.getElementById('response');

  loadPageButton.addEventListener('click', function() {
    console.log('Load page button clicked');
    responseDiv.style.display = 'block';
    responseDiv.textContent = 'Dummy response: Current page loaded successfully!';
  });

  searchPageButton.addEventListener('click', async function() {
    console.log('Search button clicked');
    
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('No active tab found');
      }

      // Inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      console.log('Content script injected successfully');

      // Send message to show search popup
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'showSearchPopup' });
      } catch (error) {
        // If there's an error sending the message, try re-injecting the content script
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        await chrome.tabs.sendMessage(tab.id, { action: 'showSearchPopup' });
      }

    } catch (error) {
      console.error('Error:', error);
      responseDiv.style.display = 'block';
      responseDiv.textContent = 'Error: Could not initialize search. Please try again.';
    }
  });

  // Listen for search queries from the content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      console.log('Message received in popup:', request);
      
      if (request.action === 'searchQuery') {
        console.log('Processing search query:', request.query);
        // Show the response in the popup
        responseDiv.style.display = 'block';
        responseDiv.textContent = `Dummy response: Searching for "${request.query}"...`;
        
        // Keep the popup open
        window.focus();
      }
    } catch (error) {
      console.error('Error processing message:', error);
      responseDiv.style.display = 'block';
      responseDiv.textContent = 'Error processing search. Please try again.';
    }
  });
}); 