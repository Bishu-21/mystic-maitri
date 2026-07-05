"use server";

import { redis } from "@/lib/cache/redis";

import { WorkflowItemSchema } from "@/lib/validators/schemas";
import type { WorkflowItem, WorkflowStatus, WorkflowPriority, WorkflowSource } from "@/lib/validators/schemas";

const QUEUE_KEY = "workflow_queue";

export async function addToWorkflow(item: WorkflowItem) {
    try {
        const validated = WorkflowItemSchema.safeParse(item);
        if (!validated.success) {
            console.error("[WORKFLOW_ERROR] Item validation failed:", validated.error);
            return { success: false, error: "Invalid workflow item payload" };
        }
        // LPUSH adds to the beginning of the list
        await redis.lpush(QUEUE_KEY, JSON.stringify(validated.data));
        console.log(`[WORKFLOW_ACTION] Item ${validated.data.id} added from ${validated.data.source}`);
        return { success: true };
    } catch (error) {
        console.error("[WORKFLOW_ERROR] Failed to add item:", error);
        return { success: false, error: "Failed to persist workflow action" };
    }
}

export async function getWorkflowQueue(limit: number = 50): Promise<WorkflowItem[]> {
    try {
        const items = await redis.lrange(QUEUE_KEY, 0, limit - 1);
        return items.map((item: any) => (typeof item === 'string' ? JSON.parse(item) : item));
    } catch (error) {
        console.error("[WORKFLOW_ERROR] Failed to fetch queue:", error);
        return [];
    }
}

export async function getWorkflowCount(): Promise<number> {
    try {
        const items = await getWorkflowQueue();
        return items.filter(i => i.status === "PENDING").length;
    } catch (error) {
        console.error("[WORKFLOW_ERROR] Failed to fetch count:", error);
        return 0;
    }
}

export async function updateWorkflowStatus(id: string, status: WorkflowStatus) {
    try {
        const items = await getWorkflowQueue();
        const approvedItem = items.find(item => item.id === id);
        
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, status } : item
        );

        // Atomically replace the queue (not ideal for high concurrency but perfect for demo)
        await redis.del(QUEUE_KEY);
        if (updatedItems.length > 0) {
            // Use pipeline for performance if we had many items
            for (const item of updatedItems.reverse()) { // Reverse because LPUSH prepends
                await redis.lpush(QUEUE_KEY, JSON.stringify(item));
            }
        }

        console.log(`[WORKFLOW_ACTION] Item ${id} status updated to ${status}`);

        // Close the loop: if approved, register/increment public health signal
        if (status === "APPROVED" && approvedItem) {
            const { registerSignalFromWorkflow } = await import("@/actions/signals");
            await registerSignalFromWorkflow(approvedItem.title, approvedItem.description);
        }

        return { success: true };
    } catch (error) {
        console.error("[WORKFLOW_ERROR] Failed to update status:", error);
        return { success: false };
    }
}
