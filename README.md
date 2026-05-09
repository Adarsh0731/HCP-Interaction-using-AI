HCP Interaction Logger (Cortex Agent)
A high-performance, AI-integrated professional tool designed for Healthcare Professional (HCP) engagement and interaction logging. This application helps medical sales representatives and healthcare liaisons streamline their documentation workflow using natural language processing.

🚀 Key Features
Cortex AI Assistant: Integrated Gemini-powered agent that parses natural language descriptions (e.g., "Met Dr. Smith for lunch today to discuss Prodo-X") and automatically populates form fields.
Contextual AI Suggestions: A "Query Cortex" feature that generates medical discussion points and topics tailored to the specific HCP and interaction type.
Intelligent Refinement: The AI assistant can handle follow-up prompts to modify or refine existing form data through conversational chat.
Sophisticated Medical UI: A clean, professional "Blue Tinted" white theme designed for high readability and focus in professional environments.
Comprehensive Data Capture: Log HCP names, interaction types (Meeting, Lunch, Call, Email), attendees, detailed discussion topics, and asset distribution.
Responsive & Animated: Built with motion for smooth transitions and a mobile-friendly layout for logging interactions on the go.

🛠️ Tech Stack
Frontend: React 19, TypeScript
Styling: Tailwind CSS (Modern v4 style)
AI Engine: Google Gemini (via @google/genai)
Animations: Motion (motion/react)
Icons: Lucide React

📋 How It Works
Direct Entry: Manually fill out the interaction parameters.
AI Logging: Use the "Cortex Agent" sidebar to describe your meeting in plain English. The agent will extract the HCP name, date, interaction type, and discussion points.
Smart Suggestions: If you're unsure what to document, click "Query Cortex for Suggestions" to get clinically relevant topics based on your current meeting context.
Refine: Talk to the assistant to change specific details (e.g., "Change the time to 2:00 PM and add Dr. Jones as an attendee").

🛠️ Setup
Clone the repo
Install dependencies: npm install
Environment Variables: Add your GEMINI_API_KEY to a .env file.
Run Dev Server: npm run dev
GitHub Repository Summary (About section)
HCP Interaction Logger: A professional React/TypeScript application for medical reps featuring "Cortex Agent"—a Gemini-powered AI assistant for natural language interaction logging and clinical discussion suggestions. Built with Tailwind CSS and Motion.
