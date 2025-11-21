#!/usr/bin/env bash                                                                                               
  set -e                                                                                                            
  BRANCH="feature/update-topics"                                                                                    
  echo "Stashing current uncommitted changes..."                                                                    
  git stash                                                                                                         
  echo "Switching to branch '$BRANCH'..."                                                                           
  git checkout $BRANCH                                                                                              
  echo "Applying stashed changes to the branch..."                                                                  
  git stash pop                                                                                                     
  echo "Adding and committing all changes..."                                                                       
  git add .                                                                                                         
  git commit -m "fix: apply feature updates and fix Vercel build"                                                   
  echo "Pushing changes to origin..."                                                                               
  git push                                                                                                          
  echo "Recovery complete. The branch '$BRANCH' has been updated on GitHub."              