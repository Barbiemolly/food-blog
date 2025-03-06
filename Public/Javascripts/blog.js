document.addEventListener('DOMContentLoaded', () => {
  const blogContainer = document.getElementById('blogCardsContainer');
  const blogDetails = document.getElementById('blogDetailsContainer');

  blogContainer.addEventListener('click', async (event) => {
      if (event.target.classList.contains('view-details')) {
          const blogId = event.target.dataset.id;

          if (!blogId) {
              console.error('Blog ID is undefined or null');
              alert('Unable to load blog details. Blog ID is missing.');
              return;
          }

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
                  blogContainer.classList.add('d-none');
                  const mainArticleParts = data.main_article
                      .split(/(?<=\.)\s+/) 
                      .reduce((acc, sentence, index) => {
                          if (index < Math.ceil(data.main_article.split(/(?<=\.)\s+/).length / 2)) {
                              acc[0].push(sentence);
                          } else {
                              acc[1].push(sentence);
                          }
                          return acc;
                      }, [[], []]);
                  blogDetails.classList.remove('d-none');
                  blogDetails.innerHTML = `
                      <div class="blog-detail-card">
                          <h1>${data.title}</h1> <!-- Title in big bold letters -->
                          <br>
                          <p><em>${data.description}</em></p> <!-- Description with emphasis -->
                          <br>
                          <img src="${data.image_path}" alt="${data.title}" style="width:100%; height:auto;" /> <!-- Image -->
                          <br>
                          <p>${data.introduction}</p> <!-- Introduction -->
                          <br>
                          <div>
                              <p>${mainArticleParts[0].join(' ')}</p> <!-- First half of main article -->
                              <br>
                              <p>${mainArticleParts[1].join(' ')}</p> <!-- Second half of main article -->
                          </div>
                          <br>
                          <p>${data.conclusion}</p> <!-- Conclusion -->
                          <br>
                          <button id="back-btn" class="btn btn-primary">Back</button>
                      </div>
                  `;
              } else {
                  alert('Failed to load blog details. Please try again.');
              }
          } catch (error) {
              console.error('Error fetching blog details:', error);
              alert('Failed to load blog details. Please try again.');
          }
      }
  });
  blogDetails.addEventListener('click', (event) => {
      if (event.target.id === 'back-btn') {
          blogDetails.classList.add('d-none');
          blogContainer.classList.remove('d-none');
      }
  });
});


  