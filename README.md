# SlideStudio v2 — TikTok Slide Creator

Welcome to SlideStudio v2, a Next.js application designed to streamline the creation of engaging TikTok-style slide content. This tool provides a user-friendly interface for generating visually appealing slides, complete with customization options for background, text, and descriptions.

## Features

-   **Slide Management:** Create, edit, and organize multiple slides for your TikTok videos.
-   **Background Customization:** Choose from preset themes, upload custom images, and adjust background properties.
-   **Text & Description Editing:** Input and style your slide titles and descriptions with various color and alignment options.
-   **Real-time Preview:** See your slides come to life instantly with a live preview.
-   **Export Functionality:** Easily export your generated slides for use in your TikTok content.
-   **AI-Powered Content Generation (Planned/Potential):** Leverage Gemini API for generating punchy titles and descriptions.

## Getting Started

To get started with SlideStudio v2, follow these steps:

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or Yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/slidestudio-v2.git
    cd slidestudio-v2
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

-   `app/`: Contains the main application layout and pages.
    -   `api/generate/route.ts`: API route for content generation (e.g., using Gemini).
    -   `layout.tsx`: Root layout for the application.
    -   `page.tsx`: Main application dashboard.
-   `components/`: Reusable UI components.
    -   `BgTab.tsx`: Background customization controls.
    -   `EditorPanel.tsx`: Main editor interface.
    -   `RenderedSlide.tsx`: Component responsible for rendering the slide preview.
    -   `SlideTab.tsx`: Slide content editing controls (text, description).
    -   `Toast.tsx`: For displaying notifications.
    -   `Header.tsx`: Application header.
    -   `InputTab.tsx`: Tab for user input.
    -   `ExportTab.tsx`, `ExportModal.tsx`: Components related to exporting slides.
    -   `SlideList.tsx`: List and management of slides.
-   `lib/`: Utility functions and presets.
    -   `gemini.ts`: Integration with the Gemini API.
    -   `presets.ts`: Predefined themes and settings.
-   `public/`: Static assets (images, fonts).
-   `types/`: TypeScript type definitions.
    -   `slide.ts`: Interface for slide data.

## Learn More

This project is built with Next.js. To learn more about Next.js, check out the official [Next.js Documentation](https://nextjs.org/docs) and [Learn Next.js](https://nextjs.org/learn) tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

---