#!/usr/bin/env bash
set -e

BRANCH="feature/update-topics"

echo "This script will cleanly reset and push your branch."

# 1. Stash any uncommitted work just in case
echo "Stashing local changes..."
git stash

# 2. Go to your main branch to get a stable starting point
MAIN_BRANCH=$(git remote show origin | grep 'HEAD branch' | cut -d' ' -f3)
echo "Switching to main branch ($MAIN_BRANCH)..."
git checkout $MAIN_BRANCH

# 3. Delete the old remote branch. The '|| true' prevents the script from failing if it doesn't exist.
echo "Deleting remote branch '$BRANCH'..."
git push origin --delete $BRANCH || true

# 4. Delete the old local branch.
echo "Deleting local branch '$BRANCH'..."
git branch -D $BRANCH || true

# 5. Create a fresh branch from your main branch
echo "Creating a fresh local branch '$BRANCH'..."
git checkout -b $BRANCH

# 6. Apply your stashed changes (which should be all the correct code)
echo "Applying your saved changes..."
git stash pop

# 7. Add all files to the branch
echo "Adding all files..."
git add .

# 8. Commit the changes
echo "Committing changes..."
git commit -m "feat: reset branch with topic updates and build fixes"

# 9. Push the new, clean branch to GitHub
echo "Pushing the new branch to origin..."
git push -u origin $BRANCH

echo "---"
echo "✅ Done. The branch has been reset and pushed successfully."
echo "Please create a new Pull Request on GitHub and check Vercel."
