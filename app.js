const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const { title } = require('process');
const router = express.Router();

const app = express();

// Set the view engine to EJS and Public
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/uploads', express.static(path.join(__dirname, 'Public/uploads')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//connecting to mysql database
const db = mysql.createConnection({
  host: '127.0.0.1', 
  user: 'root',   
  password: '1965Ndumi75Mkhuseli99Celine11Molemo',      
  database: 'smiling_food', 
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

//set the express-session
app.use(session({
  secret: 'nomathamsanqamolemo19991906khethwamajola', 
  resave: false,             
  saveUninitialized: true,   
  cookie: {
    httpOnly: true,          
    secure: false,           
    maxAge: 1000 * 60 * 60 * 24 
  }
}));
// Middleware to pass user session to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; 
  next();
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'Public/uploads'); 
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});



// Routes
app.get('/', (req, res) => {
  const recentBlogQuery = 'SELECT * FROM blog ORDER BY id DESC LIMIT 4';
  const recentRecipeQuery = 'SELECT * FROM recipes ORDER BY id DESC LIMIT 4';

  db.query(recentBlogQuery, (blogErr, blogs) => {
    if (blogErr) {
      console.error('Error fetching recent blogs:', blogErr);
      return res.status(500).send('Internal Server Error');
    }

    db.query(recentRecipeQuery, (recipeErr, recipes) => {
      if (recipeErr) {
        console.error('Error fetching recent recipes:', recipeErr);
        return res.status(500).send('Internal Server Error');
      }

      res.render('FoodrecipeHome', {
        title: 'Smiling Food Home',
        blogs,
        recipes,
      });
    });
  });
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Login' });
});
app.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Sign Up' }); 
});
app.get('/blog', (req, res) => {
  const query = 'SELECT * FROM blog';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching blogs:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('blog', { title: 'Blog', blogs: results });
    }
  });
});
app.get('/recipe', (req, res) => {
  const query = 'SELECT * FROM recipes';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recipes:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.render('recipe', { title: 'Recipes', recipes: results });
    }
  });
})
//admin routes
app.get('/admin', (req, res) => {
  if (req.session.user?.email !== 'admin@example.com') {
    return res.status(403).send('Access Denied');
  }

  db.query('SELECT * FROM blog', (err, blogResults) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database query error');
    }
    db.query('SELECT * FROM recipes', (err, recipesResults) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query error');
      }
      const blogData = blogResults.map(post => ({
        id: post.id,
        title: post.title,
        image_path: post.image_path,
        created_at: post.created_at,
        type: 'blog'
      }));

      const recipeData = recipesResults.map(recipe => ({
        id:recipe.id,
        title: recipe.title,
        image_path: recipe.image_path,
        created_at: recipe.created_at,
        type: 'recipe'
      }));
      const combinedData = [...blogData, ...recipeData];
      res.render('admin', { title: 'Administrator', data: combinedData });
    });
  });
});
app.post('/admin/delete-post', (req, res) => {
  const { id, type } = req.body;
  const tableName = type === 'blog' ? 'blog' : 'recipes';

  const query = `DELETE FROM ${tableName} WHERE id = ?`;
  db.query(query, [id], (err, result) => {
      if (err) {
          console.error('Error deleting post:', err);
          return res.status(500).json({ error: 'Database error while deleting post' });
      }

      res.json({ success: true, message: 'Post deleted successfully' });
  });
});

app.get('/admin/edit-post', (req, res) => {
  const { id, type } = req.query;

  if (type === 'blog') {
    db.query('SELECT * FROM blog WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query error');
      }
      if (results.length > 0) {
        console.log(results[0]); 
        res.render('edit', { post: results[0], type: 'blog', title: 'Edit Post' });
      } else {
        res.status(404).send('Blog post not found');
      }
    });
  } else if (type === 'recipe') {
    db.query('SELECT * FROM recipes WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query error');
      }
      if (results.length > 0) {
        console.log(results[0]); 
        res.render('edit', { post: results[0], type: 'recipe', title: 'Edit Post' });
      } else {
        res.status(404).send('Recipe not found');
      }
    });
  } else {
    res.status(400).send('Invalid type');
  }
});
app.post('/admin/save-post', (req, res) => {
  const { id, type, title, description } = req.body;

  if (type === 'recipe') {
    db.query('UPDATE recipes SET title = ?, description = ? WHERE id = ?', [title, description, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error updating recipe');
      }
      res.redirect('/admin');
    });
  } else if (type === 'blog') {
    db.query('UPDATE blog SET title = ?, description = ? WHERE id = ?', [title, description, id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error updating blog post');
      }
      res.redirect('/admin');
    });
  } else {
    res.status(400).send('Invalid type');
  }
});
app.post('/admin/submitArticle', upload.single('articleImage'), (req, res) => {
  const { articleTitle, articleDescription, articleIntro, mainArticle, articleConclusion, articleExclusive } = req.body;
  const imagePath = req.file ? req.file.filename : null; 

  const exclusive = articleExclusive === 'on' ? 'yes' : 'no'; 

  const query = 'INSERT INTO blog (title, description, introduction, main_article, conclusion, image_path, exclusivity) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [articleTitle, articleDescription, articleIntro, mainArticle, articleConclusion, imagePath, exclusive], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting article into database');
    }

    res.redirect('/admin'); 
  });
});
app.post('/admin/submitRecipe', upload.single('recipeImage'), (req, res) => {
  const { recipeTitle, recipeDescription, cookTime, region, ingredients, instructions, exclusive } = req.body;
  const imagePath = req.file ? req.file.filename : null; 

  const exclusiveValue = exclusive === 'on' ? 'yes' : 'no'; 

  const query = 'INSERT INTO recipes (title, description, cooktime, region, ingredients, instructions, image_path, exclusivity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [recipeTitle, recipeDescription, cookTime, region, ingredients, instructions, imagePath, exclusiveValue], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting recipe into database');
    }

    res.redirect('/admin'); 
  });
});
// login.ejs routes
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUserQuery = 'INSERT INTO users (name, email, password, subscription) VALUES (?, ?, ?, ?)';
      db.query(insertUserQuery, [name, email, hashedPassword, 'no'], (err) => {
        if (err) {
          console.error('Error signing up user:', err);
          return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        console.log('User signed up successfully');
        res.json({ success: true, message: 'User signed up successfully' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
});
app.post('/update-subscription', (req, res) => {
  const { email, subscription } = req.body;

  if (!email || !subscription) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = 'UPDATE users SET subscription = ? WHERE email = ?';
  db.query(query, [subscription, email], (err) => {
    if (err) {
      console.error('Error updating subscription:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    console.log(`Subscription updated to: ${subscription}`);
    res.json({ success: true, message: 'Subscription updated successfully' });
  });
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (results.length === 0) {
      console.log('User not found for email:', email);
      return res.status(401).send('Invalid email or password');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal Server Error');
      }

      if (!isMatch) {
        console.log('Password mismatch for email:', email);
        return res.status(401).send('Invalid email or password');
      }
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      const redirectUrl = user.email === 'admin@example.com' ? '/admin' : '/recipe';
      return res.json({ success: true, redirectUrl });
    });
  });
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Could not log out. Please try again.');
    }
    res.redirect('/');
  });
});
app.get('/upgrade', (req, res) => {
  res.render('upgrade', {
    title: 'Upgrade Your Subscription',
    message: 'You need an active subscription to access exclusive content. Please upgrade your plan.',
  });
});
//checking for subscription
const checkExclusivity = (req, res, next) => {
  const { id } = req.params;
  const table = req.path.includes('recipe-details') ? 'recipes' : 'blog';

  const exclusivityQuery = `SELECT exclusivity FROM ${table} WHERE id = ?`;

  db.query(exclusivityQuery, [id], (err, results) => {
    if (err) {
      console.error(`Database error while checking exclusivity in ${table}:`, err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      console.warn(`No content found in ${table} with ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const exclusivity = results[0].exclusivity;

    if (exclusivity === 'yes') {
      if (!req.session.user) {
        console.warn(`Unauthenticated access attempt to exclusive ${table} content ID: ${id}`);

        if (req.accepts('json')) {
          return res.status(401).json({ success: false, message: 'Login required' });
        }
        return res.redirect('/login'); 
      }

      const userId = req.session.user.id;
      const userQuery = 'SELECT subscription FROM users WHERE id = ?';

      db.query(userQuery, [userId], (userErr, userResults) => {
        if (userErr) {
          console.error('Database error while checking user subscription:', userErr);
          return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (userResults.length === 0) {
          console.warn(`User ID not found in the database: ${userId}`);
          return res.status(403).json({ success: false, message: 'User not found' });
        }

        const subscription = userResults[0].subscription;

        if (subscription === 'no') {
          console.warn(`Access denied for user ID: ${userId} (no subscription)`);

          if (req.accepts('json')) {
            return res.status(403).json({ success: false, message: 'Subscription required' });
          }
          return res.redirect('/upgrade'); 
        }
        next();
      });
    } else {
      next();
    }
  });
};
//blog page extra route(id)
app.get('/blog-details/:id', checkExclusivity, (req, res) => {
  const blogId = req.params.id; 
  console.log(`Fetching blog details for ID: ${blogId}`); 

  const query = 'SELECT * FROM blog WHERE id = ?';
  db.query(query, [blogId], (err, results) => {
    if (err) {
      console.error('Error fetching blog details:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      console.log(`No blog found with ID: ${blogId}`);
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const blog = results[0];
    res.json({
      success: true,
      data: {
        title: blog.title,
        description: blog.description,
        introduction: blog.introduction,
        main_article: blog.main_article, 
        conclusion: blog.conclusion,
        image_path: `/uploads/${blog.image_path}`,
      },
    });
  });
});
//recipe extended
app.get('/recipe-details/:id', checkExclusivity, (req, res) => {
  const recipeId = req.params.id;
  console.log(`Fetching recipe details for ID: ${recipeId}`);

  const query = 'SELECT * FROM recipes WHERE id = ?';
  db.query(query, [recipeId], (err, results) => {
    if (err) {
      console.error('Error fetching recipe details:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      console.log(`No recipe found with ID: ${recipeId}`);
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const recipe = results[0];
    const instructionsList = recipe.instructions
    .split(/(?:\d+\.\s)/) 
    .filter((item) => item.trim()) 
    .map((step, index) => `${index + 1}. ${step.trim()}`); 
  

    const ingredientsList = recipe.ingredients.split(','); 

    res.json({
      success: true,
      data: {
        title: recipe.title,
        description: recipe.description,
        image_path: `/uploads/${recipe.image_path}`,
        region: recipe.region,
        instructions: instructionsList,
        ingredients: ingredientsList,
      },
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
