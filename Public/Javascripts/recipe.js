document.addEventListener('DOMContentLoaded', () => {
    const recipeContainer = document.getElementById('recipeCardsContainer');
    const recipeDetails = document.getElementById('recipeDetailsContainer');
  
    recipeContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('view-details')) {
        const recipeId = event.target.dataset.id;
  
        if (!recipeId) {
          console.error('Recipe ID is undefined or null');
          alert('Unable to load recipe details. Recipe ID is missing.');
          return;
        }
  
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
           
            recipeContainer.classList.add('d-none');
  
           
            recipeDetails.classList.remove('d-none');
            recipeDetails.innerHTML = `
              <div class="recipe-detail-card">
                <img src="${data.image_path}" alt="${data.title}" />
                <h2>${data.title}</h2>
                <p>${data.description}</p>
                <p><strong>Region:</strong> ${data.region}</p>
                <h3>Ingredients:</h3>
                <ul>
                  ${data.ingredients.map(ingredient => `<li>${ingredient.trim()}</li>`).join('')}
                </ul>
                <h3>Instructions:</h3>
                <ol>
                ${data.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
                <button id="back-btn" class="btn btn-secondary">Back</button>
              </div>
            `;
          } else {
            alert('Failed to load recipe details. Please try again.');
          }
        } catch (error) {
          console.error('Error fetching recipe details:', error);
          alert('Failed to load recipe details. Please try again.');
        }
      }
    });
    recipeDetails.addEventListener('click', (event) => {
      if (event.target.id === 'back-btn') {
        recipeDetails.classList.add('d-none');
        recipeContainer.classList.remove('d-none');
      }
    });
  });
  