function toggleSection(section) {
   const manageSection = document.getElementById('manageSection');
   const newPostSection = document.getElementById('newPostSection');
   const manageBtn = document.getElementById('manageBtn');
   const newPostBtn = document.getElementById('newPostBtn');

   if (section === 'manage') {
       manageSection.classList.add('active');
       newPostSection.classList.remove('active');
       manageBtn.classList.add('active');
       newPostBtn.classList.remove('active');
   } else if (section === 'newPost') {
       manageSection.classList.remove('active');
       newPostSection.classList.add('active');
       manageBtn.classList.remove('active');
       newPostBtn.classList.add('active');
   }
}

function toggleForm(form) {
   const recipeForm = document.getElementById('recipeForm');
   const articleForm = document.getElementById('articleForm');

   if (form === 'recipeForm') {
       recipeForm.style.display = 'block';
       articleForm.style.display = 'none';
   } else if (form === 'articleForm') {
       articleForm.style.display = 'block';
       recipeForm.style.display = 'none';
   }
}
document.querySelectorAll('.editPost').forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const postId = row.dataset.id;
      const postType = row.dataset.type;
      window.location.href = `/admin/edit-post?id=${postId}&type=${postType}`;
    });
});
function deletePost(id, type) {
    fetch('/admin/delete-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, type }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                location.reload(); 
            } else {
                alert('Error deleting post: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);
            alert('An error occurred. Please try again.');
        });
}
