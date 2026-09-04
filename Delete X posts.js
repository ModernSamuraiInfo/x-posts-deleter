/*
  X Posts Deleter
  ----------------------------------------------------
  • Clicks the three-dot "More" menu on each post, selects "Delete", confirms, and then moves to the next post.
  • Runs in batches (default = 50 posts per batch, up to 50 batches).
  • Scrolls the page after each batch to load more posts.
  • Prints a simple statistics report at the end.
  • Includes enhanced debugging and error handling.

  IMPORTANT:
    • Use on your own account only.
    • Back‑up any posts that you might want later.
    • X may temporarily block further actions if you run it too fast.
*/

(async function () {
  'use strict';
  console.log('X Posts Deleter started');

  // ----------------------------------------------------
  // Configuration – tweak these values if you need to
  // ----------------------------------------------------
  const CONFIG = {
    DELAY_BETWEEN_ACTIONS: 2500, // ms - Time between delete operations
    DELAY_AFTER_CLICK: 800, // ms - Time to wait after clicking buttons
    MAX_BATCHES: 50, // Maximum number of batches to process
    SCROLL_DELAY: 2500, // ms - Time to wait after scrolling
    MAX_RETRIES: 3, // Maximum retry attempts for failed operations
    RETRY_DELAY: 1500 // ms - Delay between retry attempts
  };

  // -------------------------------------------------
  // Helper: simple Promise-based delay
  // This function pauses execution for a specified time.
  // It's essential for UI automation to prevent overwhelming the browser.
  // It ensures that the script doesn’t click too fast so that the system doesn’t think it is a bot and flags the account.
  // -------------------------------------------------
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // -------------------------------------------------
  // Statistics object – updated throughout the run
  // This is an object that keeps track of deleted posts, errors, and execution time.
  // -------------------------------------------------
  const stats = {
    deleted: 0,
    errors: 0,
    startTime: Date.now(),
  };

  // -------------------------------------------------
  // Enhanced element finder with retries
  // This function attempts to find an element multiple times.
  // If an element isn't found immediately, it waits and retries.
  // This is crucial for handling dynamic content loading.
  // -------------------------------------------------
  async function findElementWithRetry(selector, retries = CONFIG.MAX_RETRIES) {
    console.log(`[DEBUG] Attempting to find element: ${selector} (max retries: ${retries})`);
    for (let i = 0; i < retries; i++) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`[DEBUG] Successfully found element: ${selector}`);
        return element;
      }
      console.log(`[DEBUG] Element not found, retrying... (${i + 1}/${retries})`);
      await delay(CONFIG.RETRY_DELAY);
    }
    console.log(`[DEBUG] Failed to find element after ${retries} attempts: ${selector}`);
    return null;
  }

  // -------------------------------------------------
  // Main delete function
  // This is the core logic that processes posts in batches.
  // It handles the complete flow: find posts → click menu → find delete → confirm delete.
  // -------------------------------------------------
  async function deletePosts() {
    console.log('[DEBUG] Starting deletion process...');
    console.log('[DEBUG] This will take a while. Please be patient.');
    
    // Process posts in batches
    for (let batch = 0; batch < CONFIG.MAX_BATCHES; batch++) {
      console.log(`[DEBUG] Starting batch ${batch + 1}`);
      console.log(`[DEBUG] Batch ${batch + 1} started at ${new Date().toLocaleTimeString()}`);

      // Find the post containers
      console.log('[DEBUG] Detecting all post elements...');
      const postContainers = Array.from(
        document.querySelectorAll('article[data-testid="tweet"]')
      );
      if (postContainers.length === 0) {
        console.log('[DEBUG] No post containers found.');
        break;
        // continue;
      }

      console.log(`[DEBUG] Found ${postContainers.length} post containers`);

      // Then detect all caret elements within post elements
      console.log('[DEBUG] Detecting all caret elements within posts...');
      const caretElements = postContainers
        .map(t => ({
          tweet: t,
          caret: t.querySelector('button[data-testid="caret"]')
        }))
        .filter(o => o.caret); // keep only those that actually have a menu button

      if (caretElements.length === 0) {
        console.log('[-] No caret (menu) buttons found – nothing to delete in this batch.');
        break;
      }

      console.log(`[DEBUG] Found ${caretElements.length} caret elements`);
      
      // Process posts in current batch (max 50 per batch)
      const postsToProcess = Math.min(50, caretElements.length);

      for (let i = 0; i < postsToProcess; i++) {
        const {tweet, caret} = caretElements[i];
        try {
          // Click the menu button (three dots)
          console.log('[DEBUG] Clicking menu button');
          caret.click();
          
          // Wait for menu to appear
          await delay(CONFIG.DELAY_AFTER_CLICK);
          
          // Find delete option in the menu
          let deleteButton = null;
          let deleteClicked = false;
          
          // Try to find delete button by text content within span elements
          const allMenuItems = document.querySelectorAll('div[role="menuitem"]');
          for (const item of allMenuItems) {
            // Check if the menu item contains a span with delete-related text
            const spanElements = item.querySelectorAll('span');
            let foundDelete = false;
            
            for (const span of spanElements) {
              if (span.textContent && (span.textContent.includes('Delete') || span.textContent.includes('delete') || span.textContent.includes('削除'))) {
                deleteButton = item;
                console.log('[DEBUG] Found delete button by text content in span');
                foundDelete = true;
                continue;
              }
            }
            
            if (foundDelete) continue;

            if (!foundDelete) {
              console.log(`[DEBUG] Delete button not found for post #${i + 1} – skipping`);
              continue;
            }
          }
          
          if (deleteButton) {
            console.log('[DEBUG] Clicking delete button');
            deleteButton.click();
            deleteClicked = true;
            await delay(CONFIG.DELAY_AFTER_CLICK);
            
            // Confirm delete
            const confirmDelete = document.querySelector('[data-testid="confirmationSheetConfirm"]');
            if (confirmDelete) {
              console.log('[DEBUG] Clicking confirm delete button');
              confirmDelete.click();
              await delay(CONFIG.DELAY_BETWEEN_ACTIONS);
              stats.deleted++;
              // console.log(`[SUCCESS] Deleted post ${stats.deleted}`);
              console.log(`[SUCCESS] Deleted post #${i + 1} (Total deleted: ${stats.deleted})`);
            } else {
                console.log('[DEBUG] Confirmation button not found - skipping');
                continue;
              }
          }

          if (!deleteClicked) {
            console.log('[DEBUG] Delete option not found. Skipping...');
            continue;
          }

          // Close any open menus by clicking outside
          console.log('[DEBUG] Closing any open menus by clicking background');

          // 1. Identify a neutral background element (usually the body or a modal backdrop)
          const backgroundElement = document.querySelector('.backdrop, .modal-overlay') || document.body;

          if (backgroundElement) {
            // Create a Pointer/Mouse event to simulate a real user click
            const clickOutside = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: 0, // Click at the very top-left to avoid clicking UI elements
              clientY: 0
            });

            backgroundElement.dispatchEvent(clickOutside);
            
            // Wait for animations to finish
            await delay(500);
          }

          // Fallback: If the menu is stubborn and requires the specific close button
          console.log('[DEBUG] Closing any open menus');
          const closeBtn = document.querySelector('div[role="dialog"] button[aria-label="Close"]');
          if (closeBtn) {
            closeBtn.click();
            await delay(500);
          }

        } catch (error) {
          console.error(`[ERROR] Failed to process post ${i + 1} in batch ${batch + 1}:`, error);
          stats.errors++;
        }
      }
      
      // Add delay between posts to avoid rate limiting
      await delay(CONFIG.DELAY_BETWEEN_ACTIONS);

      // Scroll to load more posts
      console.log('[DEBUG] Scrolling to load more posts...');
      window.scrollTo(0, document.body.scrollHeight);
      
      // Wait for new posts to load
      await delay(CONFIG.SCROLL_DELAY);
    }
    
    // Print final statistics
    printStatistics();
  }

  // ---------------------------------------------
  // Print statistics function
  // ---------------------------------------------
  function printStatistics() {
    console.log('--- Deletion Summary ---');
    console.log(`Total posts deleted: ${stats.deleted}`);
    console.log(`Total errors: ${stats.errors}`);
    const duration = (Date.now() - stats.startTime) / 1000;
    console.log(`Total time: ${duration.toFixed(2)} seconds`);
  }

  // ---------------------------------------------
  // Start the deletion process
  // ---------------------------------------------
  await deletePosts();
})();
