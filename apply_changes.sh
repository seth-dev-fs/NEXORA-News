 #!/usr/bin/env bash                                                                                               
  set -e                                                                                                            
  git checkout feature/update-topics                                                                                
  git add .                                                                                                         
  git commit -m "fix: apply all pending changes and fix Vercel build"                                               
  git push -u origin feature/update-topics                                                                          
  echo "All changes have been committed and pushed to the 'feature/update-topics' branch." 