# AI-Powered Campus Resource Management System (CampusFlow)

## 1. Abstract

CampusFlow is a full-stack web application designed to modernize and streamline the process of booking shared resources within an educational institution. Built with a robust Next.js and TypeScript foundation, the platform provides a seamless, role-based experience for students, faculty, and administrators. Key features include a dynamic resource browser, a real-time availability viewer, and a comprehensive admin dashboard. A core innovation is its integrated AI recommendation engine, powered by Genkit, which intelligently suggests alternative resources when a user's initial choice is unavailable, thereby optimizing resource utilization and enhancing the overall campus experience. This project demonstrates a modern approach to EdTech, combining a responsive UI with a powerful, AI-driven backend to solve a common logistical challenge in academic environments.

## 2. Purpose and Vision

The primary purpose of CampusFlow is to replace outdated, manual, or fragmented resource booking systems with a single, centralized, and intelligent platform. Our vision is to create a frictionless campus experience where students and faculty can instantly find and reserve the spaces and equipment they need, while administrators gain powerful tools to manage and optimize university assets efficiently.

## 3. Key Features

### 3.1. For Students
- **Account Registration:** Sign up for an account that is then sent to an administrator for approval.
- **Role-Specific Resource Browsing:** View and filter a catalog of resources specifically designated for student use.
- **Seamless Booking:** Check real-time availability and book resources like study rooms, sports facilities, and studio equipment.
- **AI-Powered Recommendations:** If a desired resource is booked, the system provides intelligent alternative suggestions.
- **Personalized Timetable:** View a personal weekly class schedule at a glance.
- **Profile Management:** Update personal information and profile picture.

### 3.2. For Faculty
- **Dedicated Resource Access:** Browse and book resources reserved for faculty, such as advanced labs, conference rooms, and auditoriums.
- **Teaching Schedule:** Faculty members are assigned to courses and appear in the student timetables.
- **Profile Management:** Manage professional details and contact information.
- *(All student features are also available to faculty).*

### 3.3. For Administrators
- **Comprehensive Dashboard:** A central control panel to manage all aspects of the platform.
- **User Approval Management:** View, approve, or reject new student and faculty registration requests.
- **Resource Management:** Add, edit, or delete any campus resource, including details like name, location, capacity, and image.
- **Section & Timetable Management:** Create and manage academic sections for different departments and years, which dynamically generates the timetables for students.
- **Global Timetable View:** Ability to look up the timetable for any section across the university.

## 4. User Roles and Interconnections

The three user roles are deeply interconnected, creating a realistic campus workflow:

1.  **Onboarding Workflow:** A **Student** or **Faculty** member signs up. Their account is created with a `pending` status. An **Admin** sees this request in the "Approvals" dashboard and can `approve` or `reject` it. Only upon approval can the user log in and access the platform's features.

2.  **Resource & Booking Workflow:** An **Admin** curates the list of available resources. **Students** and **Faculty** can then browse and book these resources based on their role. Their bookings are recorded in a central bookings log, which is used to display real-time availability to all users.

3.  **Academic Workflow:** An **Admin** defines the academic structure by creating `Sections` (e.g., "Year 2, IT-B"). The system then dynamically generates a `Timetable` for that section, assigning **Faculty** members and classrooms (**Resources**) to specific subjects and time slots. A **Student** belonging to that section can then view their personalized schedule.

## 5. Alignment with Sustainable Development Goals (SDGs)

This project contributes to the following UN SDGs:

*   **SDG 9: Industry, Innovation, and Infrastructure:** By implementing a modern digital infrastructure over the university's physical assets, the project fosters innovation through its AI recommendation engine and promotes inclusive access to campus resources.
*   **SDG 11: Sustainable Cities and Communities:** Viewing the campus as a micro-community, the system enhances access to essential public spaces and services, improving quality of life and ensuring the balanced, sustainable use of the campus footprint.
*   **SDG 12: Responsible Consumption and Production:** The platform promotes the efficient use of shared resources, minimizing the waste associated with underutilized facilities and providing administrators with data to make sustainable long-term decisions about resource allocation.

## 6. Technical Architecture and Proposed Algorithms

### 6.1. Tech Stack
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, ShadCN UI
- **Backend:** Next.js Server Actions, Node.js
- **AI/ML:** Genkit (with Google's Gemini model)
- **Database (Prototype):** Local Storage API to simulate a database for rapid prototyping.

### 6.2. Proposed Algorithms & Techniques

1.  **AI Recommendation Engine:** Utilizes a Large Language Model (LLM) via Genkit. The system sends contextual data (resource type, capacity, time, purpose) to a prompt-engineered flow, which returns structured JSON output containing intelligent, human-like recommendations and reasoning.

2.  **Client-Side Filtering:** The resource browser uses a multi-criteria filtering algorithm memoized with React's `useMemo` hook. This ensures the UI remains highly responsive by only re-calculating the filtered list when a search or filter parameter changes.

3.  **Secure Authentication (Production Proposal):** For a production environment, the system is designed to incorporate a standard password-hashing algorithm like **bcrypt** or **Argon2** to ensure user credentials are secure.

## 7. Software and Hardware Requirements

### 7.1. Hardware (Development)
| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **CPU** | Dual-core (2.0 GHz) | Quad-core (Intel i5/AMD Ryzen 5 or better) |
| **RAM** | 8 GB | 16 GB or more |
| **Storage** | 128 GB SSD (10 GB free) | 256 GB NVMe SSD or larger |

### 7.2. Software (Development)
| Category | Software | Version/Type |
| :--- | :--- | :--- |
| **OS** | Windows, macOS, or Linux | Latest stable versions |
| **Runtime** | Node.js | LTS (18.x or 20.x) |
| **Package Manager** | npm | Bundled with Node.js |
| **Code Editor**| VS Code, WebStorm, etc. | Any modern IDE |
| **Browser** | Chrome, Firefox, etc. | Latest stable versions |

## 8. Project Setup and Installation

To run this project locally, follow these steps:

1.  **Install Dependencies:** Open a terminal in the project's root directory and run the following command to install all the required packages listed in `package.json`.
    ```bash
    npm install
    ```

2.  **Run the Development Server:** After the installation is complete, start the Next.js development server.
    ```bash
    npm run dev
    ```

3.  **View the Application:** Open your web browser and navigate to [http://localhost:9002](http://localhost:9002). The CampusFlow application should now be running.

## 9. Project Structure

The project follows a standard Next.js App Router structure. Key directories include:

- **/src/app/**: Contains all the application's routes and pages.
  - **/src/app/admin/**: Admin-only routes for the dashboard.
  - **/src/app/api/**: API routes (if any).
  - **/src/app/layout.tsx**: The main layout file for the entire application.
  - **/src/app/page.tsx**: The homepage/resource browser.
- **/src/components/**: Contains all reusable React components.
  - **/src/components/ui/**: ShadCN UI components.
  - **/src/components/layout/**: Layout components like the header.
- **/src/lib/**: Contains utility functions, data sources, and type definitions.
  - **/src/lib/data.ts**: The mock data generation and management logic.
  - **/src/lib/firebase.ts**: Firebase configuration.
  - **/src/lib/types.ts**: TypeScript type definitions.
- **/src/hooks/**: Custom React hooks, such as `use-auth.tsx`.
- **/src/ai/**: Contains all Genkit-related AI flows and configurations.
  - **/src/ai/flows/**: The specific AI recommendation logic.
- **/public/**: Static assets like images and fonts.
- **tailwind.config.ts**: Configuration file for Tailwind CSS.
- **next.config.ts**: Configuration file for Next.js.
```