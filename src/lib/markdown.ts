const fs = require('fs');
const path = require('path');
const matter = require('front-matter'); // Use require for better CJS compatibility
const { remark } = require('remark');
const html = require('remark-html');

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

// This interface needs to be exported for other files to use it.
// We also ensure all properties are properly typed.
export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl: string;
  contentHtml: string;
  source_url?: string;
  needs_review?: boolean;
}

export async function getSortedArticlesData(): Promise<ArticleData[]> {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  const allArticlesData = await Promise.all(
    fileNames.map(async (fileName) => {
      if (!fileName.endsWith('.md')) return null;
      
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      try {
        const { attributes, body } = matter(fileContents); // Corrected here
        const processedContent = await remark().use(html).process(body);
        const contentHtml = processedContent.toString();

        return {
          slug,
          contentHtml,
          ...(attributes as ArticleData),
        };
      } catch (e) {
        console.error(`Error processing file: ${fileName}`, e);
        return null;
      }
    })
  );

  const validArticles = allArticlesData.filter(Boolean) as ArticleData[];

  return validArticles.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getArticleData(slug: string): Promise<ArticleData | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  try {
    const { attributes, body } = matter(fileContents); // Corrected here
    const processedContent = await remark().use(html).process(body);
    const contentHtml = processedContent.toString();

    return {
      slug,
      contentHtml,
      ...(attributes as ArticleData),
    };
  } catch (e) {
    console.error(`Error processing file for slug ${slug}:`, e);
    return null;
  }
}




const fs = require('fs');                                                                                         
  const path = require('path');                                                                                     
  const matter = require('front-matter'); // Use require for better CJS compatibility                               
  const { remark } = require('remark');                                                                             
  const html = require('remark-html');                                                                              
                                                                                                                    
  const postsDirectory = path.join(process.cwd(), 'content', 'posts');                                              
                                                                                                                    
  // This interface needs to be exported for other files to use it.                                                 
  // We also ensure all properties are properly typed.                                                              
  export interface ArticleData {                                                                                    
    slug: string;                                                                                                   
    title: string;                                                                                                  
    description: string;                                                                                            
    category: string;                                                                                               
    date: string;                                                                                                   
    imageUrl: string;                                                                                               
    contentHtml: string;                                                                                            
    source_url?: string;                                                                                            
    needs_review?: boolean;                                                                                         
  }                                                                                                                 
                                                                                                                    
  export async function getSortedArticlesData(): Promise<ArticleData[]> {                                           
    if (!fs.existsSync(postsDirectory)) {                                                                           
      return [];                                                                                                    
    }                                                                                                               
    const fileNames = fs.readdirSync(postsDirectory);                                                               
    const allArticlesData = await Promise.all(                                                                      
      fileNames.map(async (fileName) => {                                                                           
        if (!fileName.endsWith('.md')) return null;                                                                 
                                                                                                                    
        const slug = fileName.replace(/\.md$/, '');                                                                 
        const fullPath = path.join(postsDirectory, fileName);                                                       
        const fileContents = fs.readFileSync(fullPath, 'utf8');                                                     
                                                                                                                    
        try {                                                                                                       
          const { attributes, body } = matter(fileContents); // Corrected here                                      
          const processedContent = await remark().use(html).process(body);                                          
          const contentHtml = processedContent.toString();                                                          
                                                                                                                    
          return {                                                                                                  
            slug,                                                                                                   
            contentHtml,                                                                                           ▄
            ...(attributes as ArticleData),                                                                         
          };                                                                                                        
        } catch (e) {                                                                                               
          console.error(Error processing file: ${fileName}, e);                                                     
          return null;                                                                                              
        }                                                                                                           
      })                                                                                                            
    );                                                                                                              
                                                                                                                    
    const validArticles = allArticlesData.filter(Boolean) as ArticleData[];                                         
                                                                                                                    
    return validArticles.sort((a, b) => {                                                                           
      return new Date(b.date).getTime() - new Date(a.date).getTime();                                               
    });                                                                                                             
  }                                                                                                                 
                                                                                                                    
  export async function getArticleData(slug: string): Promise<ArticleData | null> {                                 
    const fullPath = path.join(postsDirectory, ${slug}.md);                                                         
    if (!fs.existsSync(fullPath)) {                                                                                 
      return null;                                                                                                  
    }                                                                                                               
    const fileContents = fs.readFileSync(fullPath, 'utf8');                                                         
                                                                                                                    
    try {                                                                                                           
      const { attributes, body } = matter(fileContents); // Corrected here                                          
      const processedContent = await remark().use(html).process(body);                                              
      const contentHtml = processedContent.toString();                                                              
                                                                                                                    
      return {                                                                                                      
        slug,                                                                                                       
        contentHtml,                                                                                                
        ...(attributes as ArticleData),                                                                             
      };                                                                                                            
    } catch (e) {                                                                                                   
      console.error(Error processing file for slug ${slug}:, e);                                                    
      return null;                                                                                                  
    }                                                                                                               
  }                                               