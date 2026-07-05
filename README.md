# 🏥 Medcify Plus

> **AI-Driven Healthcare Intelligence for Modern Pharmacies & Providers**

Medcify Plus is an advanced, AI-powered healthcare ecosystem designed to bridge the gap between raw medical data and actionable patient insights. By leveraging cutting-edge OCR, predictive analytics, and multimodal LLMs, Medcify Plus empowers pharmacies and distributors to manage inventory proactively while providing patients with deeply personalized wellness intelligence.

---

## 🚀 Key Features

### 🔍 1. Intelligent Prescription OCR
*   **Zero-Entry Workflow**: Automatically parse unstructured handwritten or digital prescriptions into structured JSON using **Azure AI Document Intelligence**.
*   **High Accuracy**: Specialized models optimized for complex medical terminology and dosage instructions.
*   **Bulk Processing**: Support for multi-page PDFs and high-resolution image uploads.

### 📊 2. Real-Time Dashboard & Analytics
*   **Live Metrics**: Tracking total processed prescriptions, average OCR confidence scores, and extraction frequency.
*   **Low Stock Alerts**: Intelligent monitoring that flags "unfulfilled demand" from recently scanned prescriptions against current inventory.
*   **Dynamic Polling**: UI updates every 20 seconds to reflect server-side background processing.

### 📈 3. Predictive Procurement
*   **Demand Forecasting**: A 7-day visual projection of upcoming medication needs using historical data smoothing and moving average algorithms.
*   **Proactive Stocking**: Helps pharmacists anticipate spikes in local health trends before stockouts occur.

### 🌿 4. AI Wellness Intelligence Hub
*   **Patient-Centric Insights**: Translates complex medical jargon into easy-to-understand lifestyle and dietary advice using **Google Gemini 2.5 Flash**.
*   **Multimodal Analysis**: Upload reports or prescriptions directly for holistic health evaluations.
*   **Narrated Wellness**: Built-in **Text-to-Speech (TTS)** narrates the AI-generated wellness summaries for better accessibility.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), React 19, [TailwindCSS v4](https://tailwindcss.com/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/), Radix UI, Lucide Icons, Framer Motion |
| **BaaS / Database** | [Appwrite](https://appwrite.io/) (Node SDK), [Supabase](https://supabase.com/), [Upstash Redis](https://upstash.com/) |
| **OCR Service** | [Azure AI Document Intelligence](https://azure.microsoft.com/en-us/products/ai-services/ai-document-intelligence) |
| **Wellness AI** | [Google Gemini 2.5 Flash](https://aistudio.google.com/) |
| **Voice / TTS** | [Microsoft Azure Speech SDK](https://azure.microsoft.com/en-us/products/ai-services/speech-service) |

---

## 📂 Project Structure

```text
medcify/
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   ├── components/         # Reusable Shadcn & Custom UI Components
│   ├── actions/            # Server Actions for DB & AI orchestration
│   ├── lib/
│   │   ├── data/           # Database service layers (Appwrite/Supabase)
│   │   ├── ai/             # AI logic (Gemini, Azure Document Intelligence)
│   │   └── utils/          # Core helpers and formatting
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── scripts/                # Database migration/setup scripts
```

---

## ⚙️ Getting Started

### Prerequisites
*   **Node.js**: v18.0 or higher
*   **Appwrite Project**: Access to an Appwrite instance with a `medcify-plus` database.
*   **Azure Cognitive Services**: Keys for Document Intelligence and Speech Service.
*   **Google AI Studio**: Gemini API Key.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/medcify-plus.git
    cd medcify-plus/medcify
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and populate it with the following:
    ```env
    # Appwrite Configuration
    NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
    NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"
    APPWRITE_API_KEY="your_secret_api_key"

    # Azure AI Services
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="your_endpoint"
    AZURE_DOCUMENT_INTELLIGENCE_KEY="your_key"
    NEXT_PUBLIC_AZURE_SPEECH_KEY="your_key"
    NEXT_PUBLIC_AZURE_SPEECH_REGION="your_region"

    # Google Gemini
    GEMINI_API_KEY="your_gemini_key"

    # Redis (Optional/Analytics)
    UPSTASH_REDIS_REST_URL="your_redis_url"
    UPSTASH_REDIS_REST_TOKEN="your_redis_token"
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to see the application.

---

## 🛡️ Security & Performance
*   **Edge Execution**: All sensitive AI calls and database mutations are handled via **Next.js Server Actions**, ensuring API keys never reach the client-side.
*   **Caching**: Redis is utilized for high-frequency analytics to minimize database load.
*   **Type Safety**: End-to-end TypeScript implementation for robust developer experience.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for better healthcare by the Medcify Team.**
