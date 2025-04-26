document.addEventListener('DOMContentLoaded', function() {
    const loadPageButton = document.getElementById('loadPage');
    const searchPageButton = document.getElementById('searchPage');
    const responseContainer = document.getElementById('response');

    loadPageButton.addEventListener('click', function() {
        responseContainer.innerHTML = '<p>Loading page content...<br>Dummy response: Page loaded successfully!</p>';
    });

    searchPageButton.addEventListener('click', function() {
        responseContainer.innerHTML = '<p>Searching page...<br>Dummy response: Found 5 relevant results!</p>';
    });
}); 