# X Posts Deleter

The script automates the manual process of deleting posts on X. It simulates clicks done by the user on the X web interface in the browser. It's meant to be run directly in the browser's developer console. It works by interacting with the DOM (webpage elements) rather than using X's API.

## Details

The script should work in most modern browsers. It will:
- Process posts in batches of 50
- Click the menu button for each post
- Select "Delete" from the menu
- Confirm the deletion
- Scroll to load more posts, until the batch limit is reached
- Show detailed progress in the console
- Show a summary at the end

The script works but it has some limitations. It relies on X's current website structure, which might change in the future. If you have a lot of posts to delete, it requires you to reload many times. In the meantime, you also have to be careful not to get rate limited by X.

## Installation

Clone the repository:
```
git clone https://github.com/ModernSamuraiInfo/x-posts-deleter.git
```

Go in the newly-created `x-posts-deleter` folder. Find the JavaScript file inside.

## Usage

To use it:
1. Log into X in your browser
2. Go to your post page (https://x.com/<yourhandle>) or your replies page (https://x.com/<yourhandle>/with_replies)
3. Open the browser console (F12)
4. Paste the code from the JavaScript file
5. Press Enter or click **Run**

## Safety And Good Practices

Be aware and adhere to the following:
- Back‑up first: Use the X “Download an archive of your data” feature (Settings > Your account > Download an archive) so you can restore anything later.
- Run in small batches:  Start with `MAX_BATCHES = 5` and `DELAY_BETWEEN_ACTIONS = 3000`. If everything works, increase the limits.
- Watch the console: If you see messages like “You’re doing that too fast” or a red “action blocked” banner on X, stop the script, wait a minute or two, then resume.
- Do not share the script with anyone who might use it on accounts that aren’t theirs. That would violate X’s policies.
- Refresh the page after each run so the next set of posts is freshly loaded. The script itself will scroll, but after it finishes, it stops. A refresh clears any leftover UI state.
