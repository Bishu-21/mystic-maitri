# Medcify Analytics Pipeline

This document explains the architecture and logic behind the Medcify real-time dashboard analytics engine.

## Overview
The dashboard has been upgraded from static dummy data to a dynamic, server-driven aggregation pipeline. It reads directly from the Appwrite `prescriptions` collection, parsing OCR metadata and generating actionable insights for pharmacies and distributors.

## Architecture

1.  **Data Service Layer (`src/lib/data/dashboard-service.ts`)**
    *   Acts as the central query engine.
    *   Connects to Appwrite using `createAdminClient` via the Node SDK.
    *   Fetches all processed prescriptions and runs mathematical aggregations entirely on the server.

2.  **Edge Execution / Server Action (`src/actions/get-dashboard.ts`)**
    *   A secure Next.js Server Action (`'use server'`) bridging the UI to the data service.
    *   Ensures database credentials (like `NEXT_PUBLIC_APPWRITE_DATABASE_ID`) or internal logic is never exposed to the client.

3.  **Client UI Polling (`src/app/dashboard/page.tsx`)**
    *   The dashboard interface remains a rich, interactive Client Component.
    *   It uses `useEffect` to fetch the analytics payload on mount, and sets up a `setInterval` to re-fetch the payload every **20 seconds**.
    *   This provides a near real-time "live" feel as new prescriptions are scanned in the OCR section without requiring a hard page refresh.

## Key Metrics & MVP Logic

### 1. Total Prescriptions
A raw count of all successful document extractions stored in Appwrite.

### 2. OCR Accuracy
Averaged confidence score extracted by Azure Document Intelligence across all valid documents.

### 3. Medicines Extracted Today
Filters the `prescriptions` collection against the stroke of midnight today, mapping and counting the length of all `parsedMedicines` arrays.

### 4. MVP Low Stock Predictions (Critical Alert)
**Logic:**
1.  Iterate through all documents.
2.  If an extracted medicine belongs to a prescription marked `pharmacistReviewed: false` (i.e. it hasn't been fulfilled or processed yet).
3.  Count the frequency of these impending medicine requests.
4.  The top requested but unfulfilled medicines are tagged as "Low Stock / Critical Priority", simulating a demand spike that hasn't been met yet.

### 5. 7-Day AI Demand Forecast (Chart)
**Logic:**
1. Groups all historical prescriptions strictly partitioned into the last contiguous 7 days.
2. **Actual** data represents the hard count of prescriptions processed on that specific day (scaled slightly for visual UI consistency).
3. **Predicted** data (MVP algorithm) uses a rudimentary moving average derived from the actuals combined with a slight randomization factor to simulate seasonal surges. 

## Future Enhancements
*   **Websockets:** Replace the 20-second interval polling with the native `appwrite.subscribe('collections.[ID].documents')` realtime API stream for instant push updates.
*   **Vector Embeddings:** Implement similarity search on historically parsed medicines to catch alternative brand names (e.g., mapping generic "Paracetamol" directly to "Crocin").
*   **Pagination:** Apply cursor-based chunking in `dashboard-service.ts` as the collection scales past thousands of entries to prevent server memory saturation.
