// profile.js - Profile rendering

document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profileContent');

    if (profileContainer) {
        requireAuth(); // They must be logged in to be here

        const user = getCurrentUser();
        // Since we don't have uploads yet, use a stylish default avatar (UI Faces or similar logic)
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=150`;

        profileContainer.innerHTML = `
            <div class="profile-header">
                <img src="${avatarUrl}" alt="Avatar" class="avatar">
                <div>
                    <h2>${user.username}</h2>
                    <p class="text-muted">${user.email}</p>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 2rem 0;">
            <h3>Account Settings</h3>
            <form id="profileForm" style="margin-top: 1.5rem; text-align: left;">
                <div class="form-group">
                    <label for="profLocation">Location / Address</label>
                    <input type="text" id="profLocation" value="${user.location || ''}">
                </div>
                <div class="form-group">
                    <label for="profGenre">Genre (Gender)</label>
                    <select id="profGenre">
                        <option value="Male" ${user.genre === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${user.genre === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Other" ${user.genre === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
        `;

        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newLocation = document.getElementById('profLocation').value.trim();
            const newGenre = document.getElementById('profGenre').value;
            
            // Save to active user
            user.location = newLocation;
            user.genre = newGenre;
            localStorage.setItem('ecommerce_active_user', JSON.stringify(user));
            
            // Save to users array
            const users = JSON.parse(localStorage.getItem('ecommerce_users')) || [];
            const userIndex = users.findIndex(u => u.email === user.email);
            if(userIndex !== -1) {
                users[userIndex].location = newLocation;
                users[userIndex].genre = newGenre;
                localStorage.setItem('ecommerce_users', JSON.stringify(users));
            }
            
            showToast("Profile settings updated successfully!");
        });
    }
});
