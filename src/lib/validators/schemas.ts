import { z } from "zod";

// ==========================================
// 1. Normalized Prescription Schema
// ==========================================
export const NormalizedMedicineSchema = z.object({
    name: z.preprocess((val) => (typeof val === 'string' ? val : 'Unknown Medicine'), z.string().trim().min(1, "Medicine name is required")),
    strength: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    dosage: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    frequency: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    duration: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    notes: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    confidence: z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 1.0 : parsed;
        }
        return 1.0;
    }, z.number().min(0).max(1).default(1.0))
});

export const PrescriptionSchema = z.object({
    medicines: z.array(NormalizedMedicineSchema).default([])
});

export type NormalizedMedicine = z.infer<typeof NormalizedMedicineSchema>;
export type PrescriptionData = z.infer<typeof PrescriptionSchema>;

// ==========================================
// 2. Normalized Workflow Schema
// ==========================================
export const WorkflowSourceSchema = z.enum(["voice", "document", "signal"]);
export const WorkflowPrioritySchema = z.enum(["NORMAL", "URGENT"]);
export const WorkflowStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const WorkflowItemSchema = z.object({
    id: z.string(),
    source: WorkflowSourceSchema,
    title: z.preprocess((val) => (typeof val === 'string' ? val : 'Untitled Action'), z.string().trim().min(1)),
    description: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    confidence: z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0.9 : parsed;
        }
        return 0.9;
    }, z.number().min(0).max(1).default(0.9)),
    priority: WorkflowPrioritySchema.default("NORMAL"),
    status: WorkflowStatusSchema.default("PENDING"),
    createdAt: z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string' || val instanceof Date) {
            const d = new Date(val);
            return isNaN(d.getTime()) ? Date.now() : d.getTime();
        }
        return Date.now();
    }, z.number().default(() => Date.now())),
    reasoning: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    data: z.any().optional()
});

export type WorkflowItem = z.infer<typeof WorkflowItemSchema>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export type WorkflowPriority = z.infer<typeof WorkflowPrioritySchema>;
export type WorkflowSource = z.infer<typeof WorkflowSourceSchema>;

// ==========================================
// 3. Document OCR Interpretation Schema
// ==========================================
export const DocumentInterpretationItemSchema = z.object({
    name: z.string().trim(),
    abnormal: z.preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return false;
    }, z.boolean().default(false)),
    interpretation: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('')),
    explanation: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('Extracted via Azure Neural Document Analysis.'))
});

export const DocumentOcrResponseSchema = z.object({
    interpretations: z.array(DocumentInterpretationItemSchema).default([]),
    proposedAction: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('Monitor patient status and consult a physician if needed.'))
});

export type DocumentOcrResponse = z.infer<typeof DocumentOcrResponseSchema>;

// ==========================================
// 4. Voice Intent Schema
// ==========================================
export const VoiceIntentResponseSchema = z.object({
    intent: z.preprocess((val) => (typeof val === 'string' ? val : 'Unknown Intent'), z.string().trim().default('Unknown Intent')),
    specialty: z.preprocess((val) => (typeof val === 'string' ? val : 'General Medicine'), z.string().trim().default('General Medicine')),
    priority: z.preprocess((val) => {
        if (typeof val === 'string') {
            const upper = val.toUpperCase();
            if (upper === "URGENT" || upper === "NORMAL") return upper;
        }
        return "NORMAL";
    }, z.enum(["NORMAL", "URGENT"]).default("NORMAL")),
    confidence: z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0.8 : parsed;
        }
        return 0.8;
    }, z.number().min(0).max(1).default(0.8)),
    summary: z.preprocess((val) => (typeof val === 'string' ? val : 'No voice summary available.'), z.string().trim().default('No voice summary available.')),
    instructions: z.preprocess((val) => (typeof val === 'string' ? val : 'No specific patient instructions extracted.'), z.string().trim().default('No specific patient instructions extracted.')),
    language: z.preprocess((val) => (typeof val === 'string' ? val : 'en'), z.string().trim().default('en')),
    languageName: z.preprocess((val) => (typeof val === 'string' ? val : 'English'), z.string().trim().default('English')),
    suggested_action: z.preprocess((val) => (typeof val === 'string' ? val : 'No suggested action.'), z.string().trim().default('No suggested action.')),
    verbal_response: z.preprocess((val) => (typeof val === 'string' ? val : 'Understood. Audio logged and parsed.'), z.string().trim().default('Understood. Audio logged and parsed.'))
});

export type VoiceIntentResponse = z.infer<typeof VoiceIntentResponseSchema>;

// ==========================================
// 5. Wellness Plan Schema
// ==========================================
export const WellnessMealSchema = z.object({
    title: z.preprocess((val) => (typeof val === 'string' ? val : 'Balanced Whole Foods'), z.string().trim().default('Balanced Whole Foods')),
    description: z.preprocess((val) => (typeof val === 'string' ? val : 'Lean proteins and vegetables.'), z.string().trim().default('Lean proteins and vegetables.')),
    nutrients: z.preprocess((val) => (Array.isArray(val) ? val.map(String) : ['Fiber', 'Protein']), z.array(z.string()).default(['Fiber', 'Protein'])),
    why: z.preprocess((val) => (typeof val === 'string' ? val : 'Generic safe recommendation due to AI engine failure.'), z.string().trim().default('Generic safe recommendation due to AI engine failure.'))
});

export const WellnessMovementSchema = z.object({
    name: z.preprocess((val) => (typeof val === 'string' ? val : 'Light Walking'), z.string().trim().default('Light Walking')),
    focus: z.preprocess((val) => (typeof val === 'string' ? val : 'General circulation'), z.string().trim().default('General circulation'))
});

export const WellnessPlanResponseSchema = z.object({
    meal: WellnessMealSchema.default({
        title: "Balanced Whole Foods",
        description: "Lean proteins and vegetables.",
        nutrients: ["Fiber", "Protein"],
        why: "Generic safe recommendation due to AI engine failure."
    }),
    warnings: z.preprocess((val) => (Array.isArray(val) ? val.map(String) : []), z.array(z.string()).default(["System was unable to analyze drug-nutrient interactions. Please consult a pharmacist."])),
    movement: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(WellnessMovementSchema).default([
        { name: "Light Walking", focus: "General circulation" }
    ])),
    tags: z.preprocess((val) => (Array.isArray(val) ? val.map(String) : []), z.array(z.string()).default(["Safe Fallback"])),
    dailySummaryText: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('Namaste. I encountered a small issue connecting to my reasoning core, but your vitals are stable. Stick to light movements and balanced meals today.')),
    confidence: z.preprocess((val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0.1 : parsed;
        }
        return 0.1;
    }, z.number().min(0).max(1).default(0.1)),
    uncertainty: z.preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return true;
    }, z.boolean().default(true)),
    uncertaintyReason: z.preprocess((val) => (typeof val === 'string' ? val : ''), z.string().trim().default('Gemini AI generation failed or returned invalid JSON.')),
    generatedAt: z.preprocess((val) => (typeof val === 'string' ? val : new Date().toISOString()), z.string().trim().default(() => new Date().toISOString()))
});

export type WellnessPlanResponse = z.infer<typeof WellnessPlanResponseSchema>;
