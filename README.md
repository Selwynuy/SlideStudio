# SlideStudio v2 — TikTok Slide Creator

Welcome to SlideStudio v2, a powerful Next.js application designed to empower content creators in generating engaging, vertical-format slides perfect for TikTok and other short-form video platforms. Leverage the power of AI to transform your raw text into visually appealing and structured content, fully customizable to your brand and style.

## Key Features

-   **AI-Powered Content Generation:**
    -   Utilizes the **Gemini API** to convert raw text into punchy titles and compelling descriptions.
    -   Generate slides in batches, specifying tone, complexity, maximum slide count, and focus.
    -   Option to include an attention-grabbing "Hook Slide" as the opener.
    -   Regenerate individual slide titles or descriptions on demand.
-   **Intuitive Slide Management:**
    -   Effortlessly add, move, and delete slides within a user-friendly interface.
    -   Set an active slide for focused editing and real-time preview.
-   **Extensive Customization Options:**
    -   **Backgrounds:** Choose from predefined presets, upload your own images, or set a solid background color.
    -   **Text Styling:** Control text color, description color, and overall text alignment (left, center, right).
    -   Adjust overlay and accent colors for enhanced readability and visual appeal.
-   **Real-time Visual Preview:**
    -   Instantly see how your changes impact the final slide design in a dedicated preview panel.
    -   Navigate through slides using intuitive previous/next controls.
-   **Flexible Export Capabilities:**
    -   Export individual or all slides as high-quality PNG or JPG images.
    -   Export your slide data as a JSON file for backup or further programmatic use.
-   **Dynamic Theming:** Toggle between light and dark modes for a comfortable editing experience.
-   **Toast Notifications:** Receive instant feedback on generation status, exports, and other actions.

## Getting Started

To get started with SlideStudio v2, follow these steps:

### Prerequisites

-   Node.js (LTS version recommended, e.g., v18 or v20)
-   npm or Yarn (npm is used in examples)
-   A Gemini API key (for AI content generation functionality)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/slidestudio-v2.git
    cd slidestudio-v2
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Gemini API Key:**
    Create a `.env.local` file in the root of your project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    Replace `your_gemini_api_key_here` with your actual key.

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

-   `app/`: Core Next.js App Router directory.
    -   `api/generate/route.ts`: Serverless function for handling AI content generation requests via the Gemini API.
    -   `layout.tsx`: The root layout of the application, defining global UI elements and providers.
    -   `page.tsx`: The main application dashboard, orchestrating all major components and logic.
-   `components/`: Reusable React components that make up the UI.
    -   `BgTab.tsx`: User interface for background customization.
    -   `EditorPanel.tsx`: The central control panel for content generation settings and actions.
    -   `ExportModal.tsx`: Displays progress and status during slide export operations.
    -   `ExportTab.tsx`: UI for configuring export settings.
    -   `Header.tsx`: Application header, managing session and theme toggles.
    -   `InputTab.tsx`: Component for raw text input and generation settings.
    -   `Preview.tsx`: Displays the current active slide in real-time.
    -   `RenderedSlide.tsx`: The component responsible for rendering the actual visual output of a slide.
    -   `SlideList.tsx`: Manages the display and reordering of slides in the sidebar.
    -   `Toast.tsx`: Provides temporary, non-intrusive notifications to the user.
-   `lib/`: Utility functions and helper modules.
    -   `gemini.ts`: Client-side logic for interacting with the Gemini API.
    -   `presets.ts`: Defines predefined background themes and other default settings.
-   `public/`: Static assets such as images and icons.
-   `types/`: TypeScript type definitions for consistency and type safety.
    -   `slide.ts`: Defines the `Slide` interface, outlining the structure of slide data.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## Learn More

This project is built with Next.js. To learn more about Next.js, check out the official [Next.js Documentation](https://nextjs.org/docs) and the [Learn Next.js](https://nextjs.org/learn) tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
