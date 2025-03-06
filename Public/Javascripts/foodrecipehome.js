document.addEventListener('DOMContentLoaded', () => {
    const displayBlogDetails = (data) => {
      const detailsContainer = document.getElementById('details-container');
      detailsContainer.innerHTML = `
        <div class="details-box">
          <h1 class="blog-title">${data.title}</h1>
          <p class="blog-description"><em>${data.description}</em></p>
          <img src="${data.image_path}" alt="${data.title}" class="details-image">
          <p class="blog-introduction">${data.introduction}</p>
          <div class="main-article">
            <p>${data.main_article.split('.').slice(0, data.main_article.length / 2).join('.')}</p>
            <p>${data.main_article.split('.').slice(data.main_article.length / 2).join('.')}</p>
          </div>
          <p class="blog-conclusion">${data.conclusion}</p>
        </div>
      `;
    };
    const displayRecipeDetails = (data) => {
      const detailsContainer = document.getElementById('detail-container');
      detailsContainer.innerHTML = `
        <div class="details-box">
          <h1 class="recipe-title">${data.title}</h1>
          <p class="recipe-description"><em>${data.description}</em></p>
          <img src="${data.image_path}" alt="${data.title}" class="details-image">
          <h3>Ingredients:</h3>
          <ul>
            ${data.ingredients.map(ingredient => `<li>${ingredient.trim()}</li>`).join('')}
          </ul>
          <h3>Instructions:</h3>
          <ol>
            ${data.instructions.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      `;
    };
    const blogViewButtons = document.querySelectorAll('#recent-blog .view-details');
    blogViewButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const blogId = button.getAttribute('data-id');
        try {
          const response = await fetch(`/blog-details/${blogId}`);
          if (!response.ok) {
            if (response.status === 401) {
              window.location.href = '/login';
            } else if (response.status === 403) {
              window.location.href = '/upgrade';
            } else {
              throw new Error(`HTTP Error: ${response.status}`);
            }
            return;
          }
          const { success, data } = await response.json();
          if (success) {
            displayBlogDetails(data);
          }
        } catch (error) {
          console.error('Error fetching blog details:', error);
          alert('Could not load blog details. Please try again later.');
        }
      });
    });
    const recipeViewButtons = document.querySelectorAll('#recent-recipe .view-details');
    recipeViewButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const recipeId = button.getAttribute('data-id');
        try {
          const response = await fetch(`/recipe-details/${recipeId}`);
          if (!response.ok) {
            if (response.status === 401) {
              window.location.href = '/login';
            } else if (response.status === 403) {
              window.location.href = '/upgrade';
            } else {
              throw new Error(`HTTP Error: ${response.status}`);
            }
            return;
          }
          const { success, data } = await response.json();
          if (success) {
            displayRecipeDetails(data);
          }
        } catch (error) {
          console.error('Error fetching recipe details:', error);
          alert('Could not load recipe details. Please try again later.');
        }
      });
    });
  });
  