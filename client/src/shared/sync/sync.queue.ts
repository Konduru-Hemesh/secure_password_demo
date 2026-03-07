import type { OutboxEvent } from '../models/vault.types';

export class SyncQueueManager {
    private storageKey: string;

    constructor(userId: string) {
        this.storageKey = `vault_outbox_${userId}`;
    }

    /**
     * Retrieve the current outbox queue from local storage.
     */
    getQueue(): OutboxEvent[] {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to parse sync queue', e);
            return [];
        }
    }

    /**
     * Add an event to the outbox queue.
     * Optimization: If the new event has the same baseVersion as the last event in the queue,
     * they are merged.
     */
    enqueue(event: OutboxEvent): void {
        const queue = this.getQueue();
        const last = queue[queue.length - 1];

        let newQueue: OutboxEvent[];
        if (last && last.delta.baseVersion === event.delta.baseVersion) {
            // Merge related events
            newQueue = [...queue.slice(0, -1), event];
        } else {
            // Append
            newQueue = [...queue, event];
        }

        this._saveQueue(newQueue);
    }

    /**
     * Peek at the oldest event in the queue without removing it.
     */
    peek(): OutboxEvent | null {
        const queue = this.getQueue();
        return queue.length > 0 ? queue[0] : null;
    }

    /**
     * Remove an event from the queue by its eventId (usually after a successful sync).
     */
    remove(eventId: string): void {
        const queue = this.getQueue();
        const newQueue = queue.filter(e => e.eventId !== eventId);
        this._saveQueue(newQueue);
    }

    /**
     * Check if the queue is empty.
     */
    isEmpty(): boolean {
        return this.getQueue().length === 0;
    }

    /**
     * Get the number of items currently in the queue.
     */
    get size(): number {
        return this.getQueue().length;
    }

    /**
     * Completely clear the queue (e.g., on logout or conflict).
     */
    clear(): void {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Internal: Save the queue to local storage.
     */
    private _saveQueue(queue: OutboxEvent[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(queue));
    }
}
