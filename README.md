
# AI-Powered Campus Resource Management System (CampusFlow)

## 1. Abstract

The AI-Powered Campus Resource Management System is a full-stack web application designed to modernize and streamline the process of booking shared resources within an educational institution. Built on a robust Next.js and TypeScript foundation, the platform provides a seamless, role-based experience for students, faculty, and administrators. Key features include a dynamic resource browser with filtering capabilities, a real-time availability viewer for each resource, and a comprehensive admin dashboard for managing users, resources, and academic sections. A core innovation of the system is its integrated AI recommendation engine, powered by Genkit, which intelligently suggests alternative resources when a user's initial choice is unavailable, thereby optimizing resource utilization and enhancing the overall campus experience. The project demonstrates a modern approach to EdTech solutions, combining a responsive user interface with a powerful, AI-driven backend to solve a common logistical challenge in academic environments.

## 2. Alignment with Sustainable Development Goals (SDGs)

This project contributes to the following UN Sustainable Development Goals:

*   **SDG 9: Industry, Innovation, and Infrastructure:** By implementing a modern digital infrastructure (the booking platform) over the university's physical assets, the project fosters innovation through its AI recommendation engine and promotes inclusive access to campus resources.

*   **SDG 11: Sustainable Cities and Communities:** Viewing the campus as a micro-community, the system enhances access to essential public spaces and services, improving quality of life and ensuring the balanced, sustainable use of the campus footprint.

*   **SDG 12: Responsible Consumption and Production:** The platform promotes the efficient use of shared resources, minimizing the waste associated with underutilized facilities and providing administrators with data to make sustainable long-term decisions about resource allocation and energy consumption.

## 3. Requirements

### 3.1. Functional Requirements

- **User Authentication:** Role-based access control for Students, Faculty, and Administrators, including sign-up with admin approval.
- **Resource Booking:** A filterable catalog of campus resources, real-time schedule viewing, and a seamless booking process.
- **AI Recommendations:** An intelligent recommendation engine (via Genkit) that suggests alternative resources when a user's choice is unavailable.
- **Admin Dashboard:** A comprehensive interface for administrators to manage user approvals, add/delete resources, and manage academic sections.
- **Timetable Viewing:** A personalized view of weekly class timetables for students and a global view for administrators.

### 3.2. Non-Functional Requirements

- **Performance:** Fast page loads and instantaneous UI feedback for filtering and searching.
- **Usability:** An intuitive, responsive design that works flawlessly on desktop, tablet, and mobile devices.
- **Security:** Secure access control based on user roles to protect sensitive data and administrative functions.
- **Maintainability:** A clean, component-based architecture for easy updates and future development.

## 4. Technical Architecture and Proposed Algorithms

### 4.1. Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, ShadCN UI
- **Backend:** Next.js Server Actions, Node.js
- **AI/ML:** Genkit (with Google's Gemini model)
- **Database (Prototype):** Local Storage API to simulate a database for rapid prototyping.

### 4.2. Proposed Algorithms & Techniques

1.  **AI Recommendation Engine:** Utilizes a Large Language Model (LLM) via Genkit. The system sends contextual data (e.g., resource type, capacity, time) to a prompt-engineered flow, which returns structured JSON output containing intelligent, human-like recommendations and reasoning.

2.  **Client-Side Filtering:** The resource browser uses a multi-criteria filtering algorithm memoized with React's `useMemo` hook. This ensures the UI remains highly responsive by only re-calculating the filtered list when a search or filter parameter changes.

3.  **Secure Authentication (Production Proposal):** For a production environment, the system is designed to incorporate a standard password-hashing algorithm like **bcrypt** or **Argon2** to ensure user credentials are secure.

## 5. Software and Hardware Requirements

### 5.1. Hardware (Development)

| Component | Minimum | Recommended |
| :--- | :--- | :--- |
| **CPU** | Dual-core (2.0 GHz) | Quad-core (Intel i5/AMD Ryzen 5 or better) |
| **RAM** | 8 GB | 16 GB or more |
| **Storage** | 128 GB SSD (10 GB free) | 256 GB NVMe SSD or larger |

### 5.2. Software (Development)

| Category | Software | Version/Type |
| :--- | :--- | :--- |
| **OS** | Windows, macOS, or Linux | Latest stable versions |
| **Runtime** | Node.js | LTS (18.x or 20.x) |
| **Package Manager** | npm | Bundled with Node.js |
| **Code Editor**| VS Code, WebStorm, etc. | Any modern IDE |
| **Browser** | Chrome, Firefox, etc. | Latest stable versions |

## 6. Project Setup and Installation

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

## 7. Project Structure

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
- **/src/hooks/**: Custom React hooks, such as `useAuth.tsx`.
- **/src/ai/**: Contains all Genkit-related AI flows and configurations.
  - **/src/ai/flows/**: The specific AI recommendation logic.
- **/public/**: Static assets like images and fonts.
- **tailwind.config.ts**: Configuration file for Tailwind CSS.
- **next.config.ts**: Configuration file for Next.js.
