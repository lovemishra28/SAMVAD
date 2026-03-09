# SAMVAD 🗳️

**SAMVAD** (Sanskrit: *conversation/dialogue*) is an intelligent voter engagement and campaign management platform designed to bridge the gap between government schemes and citizens. Built with modern web technologies, SAMVAD empowers political representatives and community organizers to analyze voter demographics, manage government schemes, and deliver targeted notifications at scale.

---

## 📋 Overview

In democratic societies, effective communication between elected representatives and constituents is crucial. SAMVAD addresses this need by providing a comprehensive digital solution for:

- **Voter Analytics**: Understand your constituency through intelligent segmentation and visual insights
- **Scheme Management**: Organize and promote government welfare schemes to the right beneficiaries
- **Campaign Automation**: Deploy multi-channel notification campaigns (SMS, Voice) with delivery tracking
- **Real-time Intelligence**: Get AI-powered insights on voter demographics and engagement patterns

### Why SAMVAD Matters

Traditional voter engagement methods are often inefficient, lack targeting, and provide minimal feedback. SAMVAD modernizes this process by:

1. **Data-Driven Decision Making**: Move from intuition to evidence-based engagement strategies
2. **Targeted Outreach**: Ensure the right schemes reach the right people at the right time
3. **Measurable Impact**: Track notification delivery success rates and campaign performance
4. **Resource Optimization**: Focus efforts where they matter most through intelligent segmentation

---

## ✨ Key Features

### 🎯 Voter Segmentation & Analytics
- Automatic categorization of voters into: Farmers, Students, Senior Citizens, Workers, and Others
- Age-based distribution analysis with interactive charts
- Booth-wise intelligence summaries with key statistics
- AI-generated insights for strategic planning

### 📊 Interactive Dashboard
- Real-time visualization of voter demographics using Chart.js
- Category-wise and age-wise distribution charts
- Booth intelligence summary displaying total voters, average age, and dominant categories
- Click-through details for each voter segment

### 🏛️ Government Scheme Management
- Comprehensive scheme database with categorization
- Status tracking (Active, Upcoming, Closed)
- Registration deadline monitoring with countdown timers
- Search, filter, and sort functionality
- Direct portal links for scheme applications

### 📢 Campaign Engine
- Multi-channel notification delivery (SMS & Voice Call simulation)
- Launch notifications for new schemes
- Deadline reminder automation
- Real-time delivery tracking with success/failure analytics
- Detailed campaign logs with voter-level delivery status

### 🗺️ Booth Selection Interface
- Interactive map-based booth selection using Leaflet
- Booth information including area, district, voter count, and type
- Multiple booth support across urban, semi-urban, and rural areas

### 🎨 Modern UI/UX
- Smooth animations and transitions powered by Framer Motion
- Responsive design for desktop, tablet, and mobile devices
- Intuitive navigation with progress tracking
- Dark-themed interface optimized for extended use

---

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 16.1.6** - React framework with App Router for modern web applications
- **React 19.2.3** - Component-based UI library
- **TypeScript 5** - Type-safe JavaScript for better development experience

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework for rapid UI development
- **Framer Motion 12.35.0** - Production-ready animation library
- **Lucide React 0.577.0** - Beautiful & consistent icon set

### Data Visualization
- **Chart.js 4.5.1** - Flexible charting library
- **React Chart.js 2** - React wrapper for Chart.js

### Mapping
- **Leaflet 1.9.4** - Open-source JavaScript library for interactive maps
- **React Leaflet 5.0.0** - React components for Leaflet maps

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS transformations
- **TypeScript** - Static type checking

---

## 🚀 Installation & Setup

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm**, **yarn**, **pnpm**, or **bun** - Package manager
- **Git** - Version control

### Step 1: Clone the Repository
```bash
git clone https://github.com/lovemishra28/SAMVAD.git
cd samvad
```

### Step 2: Install Dependencies
Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### Step 3: Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Step 4: Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

The application will automatically hot-reload when you make changes to the source files.

---

## 📁 Project Structure

```
samvad/
├── public/                    # Static assets (images, icons, etc.)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── voters/        # Voter data endpoints
│   │   ├── booth-selection/   # Booth selection interface with map
│   │   ├── dashboard/         # Voter analytics dashboard
│   │   ├── fetch-data/        # Data fetching utilities page
│   │   ├── notifications/     # Campaign notifications management
│   │   ├── processing/        # Data processing workflows
│   │   ├── schemes/           # Government schemes management
│   │   │   └── [id]/          # Individual scheme detail pages
│   │   ├── layout.tsx         # Root layout component
│   │   ├── page.tsx           # Home page (redirects to booth-selection)
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # Reusable React components
│   │   ├── AgeChart.js        # Age distribution visualization
│   │   ├── CategoryChart.js   # Category-wise voter chart
│   │   ├── BackButton.js      # Navigation back button
│   │   ├── BoothIndicator.js  # Booth status indicator
│   │   └── ProgressBar.js     # Loading/progress indicator
│   │
│   └── lib/                   # Business logic & utilities
│       ├── applicationTracker.js   # Track scheme applications
│       ├── campaignEngine.js       # Notification campaign logic
│       ├── generateInsight.js      # AI-powered insights generation
│       ├── getSchemes.js           # Scheme data retrieval
│       ├── schemesData.js          # Government schemes database
│       └── segmentVoters.js        # Voter categorization algorithms
│
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── next-env.d.ts              # Next.js TypeScript declarations
├── package.json               # Project dependencies & scripts
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation (this file)
```

### Key Directories Explained

- **`src/app/`**: Contains all application pages following Next.js App Router conventions
- **`src/components/`**: Reusable UI components used across multiple pages
- **`src/lib/`**: Core business logic, data processing, and utility functions
- **`public/`**: Static files served directly (images, fonts, icons)

---

## 📖 Usage Guide

### 1. Select a Booth
- Launch the application and you'll be directed to the booth selection page
- Choose from multiple booths displayed on an interactive map
- View booth details including location, voter count, and area type

### 2. View Dashboard
- After selecting a booth, navigate to the dashboard
- Explore the **Booth Intelligence Summary** showing:
  - Total registered voters
  - Average age of voters
  - Major demographic category
  - AI-generated strategic insights
- Interact with **Category Charts** to drill down into specific voter segments
- Analyze **Age Distribution** to understand generational composition

### 3. Manage Government Schemes
- Navigate to the **Schemes** section
- Browse schemes by category (Farmers, Students, Senior Citizens, Workers)
- Filter schemes by status (Active, Upcoming, Closed)
- Search schemes by name or description
- Click on individual schemes to view detailed information
- Track registration deadlines with visual countdown indicators

### 4. Launch Notification Campaigns
- Go to the **Notifications** page
- Select target voter segments for your campaign
- Choose between:
  - **Launch Campaigns**: Announce new schemes
  - **Reminder Campaigns**: Send deadline reminders
- Simulate campaign delivery across SMS and Voice channels
- Monitor real-time delivery statistics and logs
- View success rates, failure reasons, and overall campaign performance

### 5. Track Application Progress
- Use the **Processing** page to monitor scheme application status
- Track applications through various stages
- Generate reports on application success rates

---

## 🔧 Development Best Practices

This project follows modern web development standards and includes:

### 📄 Supporting Files

1. **package.json** - Manages all project dependencies, scripts, and metadata. Defines available commands like `dev`, `build`, `start`, and `lint`.

2. **README.md** - Comprehensive project documentation (this file) providing overview, setup instructions, and usage guidelines.

3. **.gitignore** - Specifies which files and directories should be excluded from version control, including:
   - `node_modules/` - Dependencies
   - `.next/` - Build output
   - `.env*` - Environment variables (sensitive data)
   - Build artifacts and logs

4. **.env.example** *(To be created)* - Template for environment variables. Currently, the app uses localStorage and doesn't require external APIs, but this can be added for future database or API integrations.

### 🎯 Code Quality Standards
- **ESLint** configured for code consistency
- **TypeScript** for type safety where implemented
- Component-based architecture for maintainability
- Responsive design principles throughout

### 🔐 Security Considerations
- Environment variables properly excluded from version control via `.gitignore`
- Client-side data storage using localStorage (for demo purposes)
- No sensitive data exposed in the frontend code

---

## 🔮 Future Enhancements

Potential features for future development:

- **Backend Integration**: Connect to a real database (PostgreSQL, MongoDB) for persistent data storage
- **User Authentication**: Role-based access control for administrators and field workers
- **Real Notifications**: Integration with SMS APIs (Twilio, MSG91) and voice call services
- **WhatsApp Integration**: Leverage WhatsApp Business API for modern communication
- **Mobile Apps**: Native Android/iOS apps for field workers
- **Advanced Analytics**: Predictive modeling for voter behavior and engagement
- **Multi-language Support**: Regional language interfaces for broader accessibility
- **Offline Mode**: PWA capabilities for areas with limited connectivity
- **Export Features**: Generate PDF reports and CSV exports of analytics

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve SAMVAD:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open-source and available for educational and development purposes.

---

## 👨‍💻 Developer

**Love Mishra**
- GitHub: [@lovemishra28](https://github.com/lovemishra28)
- Repository: [SAMVAD](https://github.com/lovemishra28/SAMVAD)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) - The React Framework for Production
- Charts powered by [Chart.js](https://www.chartjs.org/)
- Maps by [Leaflet](https://leafletjs.com/)
- Icons from [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

**Note for Beginners**: This project serves as an excellent learning resource for modern web development practices, demonstrating real-world applications of React, Next.js, data visualization, and campaign management systems. Feel free to explore the code, experiment with modifications, and use it as a foundation for your own projects!
