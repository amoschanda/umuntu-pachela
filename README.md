# Umuntu Pachela - Modern Motorcycle Ride-Hailing Clone

**Umuntu Pachela** is a modern, full-stack prototype for a motorcycle ride-hailing service, inspired by the popular Uber model and designed with a sleek, minimalist aesthetic. This project demonstrates the integration of a static frontend with powerful backend services like **Supabase** and workflow automation using **Zapier**.

The project was created by enhancing an existing Uber clone landing page with a refreshed UI/UX and a functional backend foundation.

## ✨ Features

*   **Modern UI/UX:** A clean, mobile-first design inspired by modern ride-hailing applications, featuring a dark mode toggle.
*   **Supabase Backend:** Utilizes Supabase for a scalable, open-source backend for authentication and data management.
*   **User Authentication:** Implements a sign-in flow using Supabase's Magic Link for secure, passwordless access.
*   **Rider Application System:** Allows users to apply to become a rider, which is recorded in the Supabase database.
*   **Zapier Automation Ready:** Designed to trigger an automated workflow (e.g., sending an email notification) upon a new rider application submission.
*   **Database Schema:** Includes tables for `drivers` and `rides` with proper Row Level Security (RLS) policies.

## 🛠️ Technologies Used

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 (Custom), JavaScript | Structure, Styling, and Client-Side Logic |
| **Backend** | [Supabase](https://supabase.io/) | Authentication, Realtime Database, and Storage |
| **Automation** | [Zapier](https://zapier.com/) | Workflow automation for new rider applications |
| **Version Control** | Git, GitHub | Source code management and hosting |

## 🚀 Getting Started

### Prerequisites

1.  A Supabase account.
2.  A Zapier account (optional, for automation).

### 1. Clone the Repository

```bash
git clone [REPLACE_WITH_GITHUB_LINK]
cd umuntu-pachela
```

### 2. Set up Supabase

A Supabase project has already been initialized for this repository:

| Detail | Value |
| :--- | :--- |
| **Project ID** | `stryjliwxbijimvnyjde` |
| **API URL** | `https://stryjliwxbijimvnyjde.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cnlqbGl3eGJpamltdm55amRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDcyNTEsImV4cCI6MjA3NzQ4MzI1MX0.1M5fM_uQaTpqazDsKrAPOL5tCDYI6QijXJEMmvOegGU` |

The `app.js` file is already configured with these details.

**Database Schema:**

The following tables and RLS policies were created:

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `drivers` | Stores rider-specific profiles and verification status. | `id` (FK to `auth.users`), `full_name`, `license_plate`, `status` (`pending_verification`) |
| `rides` | Manages ride requests and real-time status. | `passenger_id`, `driver_id`, `pickup_latitude`, `status` (`requested`) |

### 3. Configure Zapier Automation

To receive instant notifications for new rider applications, set up a Zap:

1.  **Trigger:** **Supabase** -> **New Row** in the **`drivers`** table.
2.  **Action:** **Gmail** -> **Send Email** to your admin address, including the applicant's details (`full_name`, `phone_number`, `license_plate`) from the trigger data.

### 4. Run Locally

Open `index.html` in your web browser. The application will automatically connect to the live Supabase project.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page]([REPLACE_WITH_GITHUB_LINK]/issues).

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Created by Manus AI for amoschanda*
