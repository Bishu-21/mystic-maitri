"use server";

import { redis } from "@/lib/cache/redis";

const SIGNALS_KEY = "health_signals";

export interface HealthSignal {
    id: string;
    type: "RESPIRATORY_CLUSTER" | "CARDIOLOGY_SIGNAL" | "DIAGNOSTICS_REF" | "FEVER_CLUSTER" | "DENGUE_SPIKE";
    zipCode: string;
    cases: number;
    severity: "URGENT" | "NORMAL";
    confidence: number;
    lastUpdated: number;
}

const DEFAULT_SIGNALS: HealthSignal[] = [
    {
        id: "SIG-700015-RESP",
        type: "RESPIRATORY_CLUSTER",
        zipCode: "700015",
        cases: 43,
        severity: "URGENT",
        confidence: 0.88,
        lastUpdated: Date.now() - 3600000
    },
    {
        id: "SIG-700091-CARD",
        type: "CARDIOLOGY_SIGNAL",
        zipCode: "700091",
        cases: 12,
        severity: "NORMAL",
        confidence: 0.95,
        lastUpdated: Date.now() - 7200000
    },
    {
        id: "SIG-700016-DIAG",
        type: "DIAGNOSTICS_REF",
        zipCode: "700016",
        cases: 8,
        severity: "NORMAL",
        confidence: 0.91,
        lastUpdated: Date.now() - 14400000
    }
];

export async function getLiveSignals(): Promise<HealthSignal[]> {
    try {
        const data = await redis.get<string>(SIGNALS_KEY);
        if (!data) {
            // Seed defaults if empty
            await redis.set(SIGNALS_KEY, JSON.stringify(DEFAULT_SIGNALS));
            return DEFAULT_SIGNALS;
        }
        return typeof data === "string" ? JSON.parse(data) : data;
    } catch (error) {
        console.error("[SIGNALS_ERROR] Failed to fetch signals:", error);
        return DEFAULT_SIGNALS;
    }
}

export async function registerSignalFromWorkflow(title: string, description: string): Promise<boolean> {
    try {
        const text = `${title} ${description}`.toLowerCase();
        
        let type: HealthSignal["type"] = "DIAGNOSTICS_REF";
        let severity: HealthSignal["severity"] = "NORMAL";
        
        if (text.includes("dengue") || text.includes("platelet") || text.includes("malaria")) {
            type = "DENGUE_SPIKE";
            severity = "URGENT";
        } else if (text.includes("fever") || text.includes("jwar") || text.includes("temperature")) {
            type = "FEVER_CLUSTER";
            severity = "URGENT";
        } else if (text.includes("cough") || text.includes("breath") || text.includes("pneumonia") || text.includes("asthma") || text.includes("chest")) {
            type = "RESPIRATORY_CLUSTER";
            severity = text.includes("urgent") || text.includes("pneumonia") ? "URGENT" : "NORMAL";
        } else if (text.includes("heart") || text.includes("cardio") || text.includes("bp") || text.includes("blood pressure") || text.includes("hypertension")) {
            type = "CARDIOLOGY_SIGNAL";
            severity = text.includes("urgent") || text.includes("pain") ? "URGENT" : "NORMAL";
        }

        // Randomly assign to a prominent Kolkata ZIP code
        const kolkataZips = ["700015", "700091", "700016", "700009", "700020"];
        const zipCode = kolkataZips[Math.floor(Math.random() * kolkataZips.length)];
        const id = `SIG-${zipCode}-${type.substring(0, 4)}`;

        const signals = await getLiveSignals();
        const existingIndex = signals.findIndex(s => s.id === id);

        if (existingIndex > -1) {
            signals[existingIndex].cases += 1;
            signals[existingIndex].lastUpdated = Date.now();
            if (severity === "URGENT") {
                signals[existingIndex].severity = "URGENT";
            }
        } else {
            signals.push({
                id,
                type,
                zipCode,
                cases: 1,
                severity,
                confidence: 0.90 + Math.random() * 0.09,
                lastUpdated: Date.now()
            });
        }

        await redis.set(SIGNALS_KEY, JSON.stringify(signals));
        console.log(`[SIGNALS_ACTION] Registered/updated signal ${id} for ZIP ${zipCode}`);
        return true;
    } catch (error) {
        console.error("[SIGNALS_ERROR] Failed to register signal:", error);
        return false;
    }
}
