import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBUKy7dy-Z-SXm4kTXaD11IHr-p1pFKfkY",
    authDomain: "general-79f0e.firebaseapp.com",
    projectId: "general-79f0e",
    storageBucket: "general-79f0e.firebasestorage.app",
    messagingSenderId: "356303791863",
    appId: "1:356303791863:web:1d414d063857a8af5155f2",
    measurementId: "G-45EMCDT0QW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variables
let allRecords = [];

// Navigation functions
window.showSection = function (sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load records if viewing records section
    if (sectionId === 'view-records') {
        loadRecords();
    }
};

// Form submission
document.getElementById('recordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const messageContainer = document.getElementById('message-container');

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding Record...';

    try {
        // Get form data
        const formData = new FormData(e.target);
        const recordData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            middleName: formData.get('middleName').trim(),
            dateOfBirth: formData.get('dateOfBirth'),
            email: formData.get('email').trim().toLowerCase(),
            graduationYear: parseInt(formData.get('graduationYear')),
            degreeProgram: formData.get('degreeProgram').trim(),
            studentId: formData.get('studentId').trim(),
            createdAt: new Date().toISOString()
        };

        // Add document to Firestore
        await addDoc(collection(db, 'records'), recordData);

        // Show success message
        messageContainer.innerHTML = '<div class="message success">Record added successfully!</div>';

        // Reset form
        e.target.reset();

        // Clear message after 3 seconds
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 3000);

    } catch (error) {
        console.error('Error adding record:', error);
        messageContainer.innerHTML = '<div class="message error">Error adding record. Please check your Firebase configuration.</div>';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Record';
    }
});

// Load records from Firestore
async function loadRecords() {
    const recordsContainer = document.getElementById('recordsContainer');
    recordsContainer.innerHTML = '<div class="loading">Loading records...</div>';

    try {
        const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        allRecords = [];
        querySnapshot.forEach((doc) => {
            allRecords.push({ id: doc.id, ...doc.data() });
        });

        displayRecords(allRecords);

    } catch (error) {
        console.error('Error loading records:', error);
        recordsContainer.innerHTML = '<div class="message error">Error loading records. Please check your Firebase configuration.</div>';
    }
}

// Display records
function displayRecords(records) {
    const recordsContainer = document.getElementById('recordsContainer');

    if (records.length === 0) {
        recordsContainer.innerHTML = '<div class="loading">No records found.</div>';
        return;
    }

    const recordsHTML = records.map(record => `
                <div class="record-card">
                    <div class="record-header">
                        <div class="record-name">${record.firstName} ${record.middleName ? record.middleName + ' ' : ''}${record.lastName}</div>
                        <div class="record-id">${record.studentId}</div>
                    </div>
                    <div class="record-details">
                        <div class="record-detail">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${record.email}</span>
                        </div>
                        <div class="record-detail">
                            <span class="detail-label">Date of Birth</span>
                            <span class="detail-value">${new Date(record.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        <div class="record-detail">
                            <span class="detail-label">Graduation Year</span>
                            <span class="detail-value">${record.graduationYear}</span>
                        </div>
                        <div class="record-detail">
                            <span class="detail-label">Degree Program</span>
                            <span class="detail-value">${record.degreeProgram}</span>
                        </div>
                    </div>
                </div>
            `).join('');

    recordsContainer.innerHTML = `<div class="records-grid">${recordsHTML}</div>`;
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (!searchTerm) {
        displayRecords(allRecords);
        return;
    }

    const filteredRecords = allRecords.filter(record => {
        const fullName = `${record.firstName} ${record.middleName || ''} ${record.lastName}`.toLowerCase();
        return fullName.includes(searchTerm) ||
            record.email.toLowerCase().includes(searchTerm) ||
            record.studentId.toLowerCase().includes(searchTerm) ||
            record.degreeProgram.toLowerCase().includes(searchTerm);
    });

    displayRecords(filteredRecords);
});

// Show configuration message if Firebase is not configured
if (firebaseConfig.apiKey === "your-api-key") {
    setTimeout(() => {
        const messageContainer = document.getElementById('message-container');
        messageContainer.innerHTML = '<div class="message error">Please configure Firebase by replacing the firebaseConfig object with your actual Firebase project settings.</div>';
    }, 1000);
}