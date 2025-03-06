const container = document.getElementById('containers');
const loginLink = document.getElementById('login-link');
const registerBtn = document.getElementById('register_btn');
const loginBtn = document.getElementById('login_btn');

loginLink.addEventListener('click', (e) => {
  e.preventDefault();
  container.classList.remove('active'); 
  window.history.pushState({}, '', '/login'); 
});
registerBtn.addEventListener('click', () => {
  container.classList.add('active'); 
  window.history.pushState({}, '', '/signup'); 
});
loginBtn.addEventListener('click', () => {
  container.classList.remove('active'); 
  window.history.pushState({}, '', '/login'); 
});
const signupForm = document.querySelector('form[action="/signup"]');
const subscriptionSection = document.getElementById('subcription-option');
const loginSignupSection = document.getElementById('login_signup_section');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(signupForm);
  const data = Object.fromEntries(formData);

  if (!data.name || !data.email || !data.password) {
    alert('All fields are required!');
    return;
  }

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert('Sign-up successful! Please choose your subscription plan.');
      loginSignupSection.classList.add('hidden-subscription');
      subscriptionSection.classList.remove('hidden-subscription');
    } else if (response.status === 409) {
      alert('Email already registered. Please use a different email.');
    } else {
      alert('An error occurred during signup. Please try again.');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('Unable to connect to the server. Please try again later.');
  }
});

function selectPlan(planName, cost) {
  const email = document.querySelector('#email').value; 
  const subscription = planName === 'Free Plan' ? 'no' : 'yes';

  fetch('/update-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, subscription }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(`Subscription updated to: ${planName}`);
        subscriptionSection.classList.add('hidden-subscription');
        window.location.href = '/login';
      } else {
        alert('Subscription update failed! Please try again.');
      }
    })
    .catch((error) => console.error('Error:', error));
}
const loginForm = document.querySelector('form[action="/login"]');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        window.location.href = result.redirectUrl; 
      } else {
        console.error('Login failed:', result.message);
        alert('An error occurred during login. Please try again.');
      }
    } else {
      const errorText = await response.text();
      console.error('Login error:', errorText);
      alert('An error occurred during login: ' + errorText);
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('Unable to connect to the server. Please try again later.');
  }
});


