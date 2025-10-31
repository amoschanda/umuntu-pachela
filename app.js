// Initialize Supabase Client (Placeholders - will be replaced with actual keys later)
const SUPABASE_URL = 'https://stryjliwxbijimvnyjde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cnlqbGl3eGJpamltdm55amRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDcyNTEsImV4cCI6MjA3NzQ4MzI1MX0.1M5fM_uQaTpqazDsKrAPOL5tCDYI6QijXJEMmvOegGU';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Dark Mode Toggle ---
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

function setDarkMode(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    setDarkMode(true);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !savedTheme) {
    // Set to dark mode if system preference is dark and no preference is saved
    setDarkMode(true);
} else {
    setDarkMode(false);
}

darkModeToggle.addEventListener('click', () => {
    setDarkMode(!body.classList.contains('dark-mode'));
});


// --- Authentication and Action Handlers ---

// Function to handle Sign In/Sign Up (using Supabase Auth)
async function handleAuth() {
    // For a simple landing page, we'll redirect to a dedicated auth page or show a modal.
    // Use Supabase's built-in magic link sign-in for simplicity and security.
    const email = prompt("Enter your email address to sign in or sign up with a magic link:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
        alert("Error signing in: " + error.message);
    } else {
        alert("Check your email for the magic link to sign in!");
    }

    // Example of a real Supabase sign-in call (uncomment when ready)
    /*
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) console.error('Error signing in:', error.message);
    */
}

// Function to handle the Book a Ride button
function handleBookRide() {
    alert("Ready to ride? Download the app to book your first trip! (This will be replaced with a deep link to the app store).");
}

// Function to handle the Become a Rider button
async function handleRiderSignup() {
    // Collect basic information for the rider application
    const fullName = prompt("Enter your full name for the rider application:");
    if (!fullName) return;

    const phoneNumber = prompt("Enter your phone number:");
    if (!phoneNumber) return;

    const licensePlate = prompt("Enter your motorcycle license plate number:");
    if (!licensePlate) return;

    // Get the current user's ID from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert("Please sign in first before applying to be a rider.");
        return;
    }

    try {
        const { data, error } = await supabase
            .from('drivers')
            .insert([
                { 
                    id: user.id, // Link the driver profile to the auth user
                    full_name: fullName, 
                    phone_number: phoneNumber, 
                    license_plate: licensePlate,
                    // status defaults to 'pending_verification' in the database schema
                },
            ]);

        if (error) throw error;

        alert("Rider application submitted successfully! We will review your details and be in touch.");
        console.log('Rider application submitted:', data);

        // This successful insert will trigger the Zapier webhook (configured in the next phase)

    } catch (error) {
        alert("Error submitting application: " + error.message);
        console.error('Error submitting rider application:', error);
    }
}

// Attach event listeners to buttons
document.getElementById('auth-button').addEventListener('click', handleAuth);
document.getElementById('book-button').addEventListener('click', handleBookRide);
document.getElementById('download-app-hero').addEventListener('click', handleBookRide);
document.getElementById('rider-signup-hero').addEventListener('click', handleRiderSignup);
document.getElementById('rider-signup-cta').addEventListener('click', handleRiderSignup);


// --- Supabase Session Listener (For future use) ---
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth Event:', event);
    if (session) {
        // User is logged in
        document.getElementById('auth-button').textContent = 'Profile';
        document.getElementById('auth-button').removeEventListener('click', handleAuth);
        document.getElementById('auth-button').addEventListener('click', () => alert('Viewing user profile!'));
    } else {
        // User is logged out
        document.getElementById('auth-button').textContent = 'Sign In';
        document.getElementById('auth-button').removeEventListener('click', () => alert('Viewing user profile!'));
        document.getElementById('auth-button').addEventListener('click', handleAuth);
    }
});

// Placeholder for future Supabase/Zapier integration logic
async function submitRiderApplication(formData) {
    // 1. Insert data into Supabase 'pending_riders' table
    // 2. Zapier webhook listens for new row in 'pending_riders'
    // 3. Zapier sends notification to admin and welcome email to rider
    console.log('Submitting application:', formData);
}
