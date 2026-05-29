import { applyRecountResult } from '../cycleCountState.js'
import { describe, it, expect, vi } from 'vitest'

describe('applyRecountResult', () => {
    const rows = [
        {
            id: 1,
            status: "pending_review"
        },
        {
            id: 2,
            status: "processed"
        },
        {
            id: 3,
            status: "pending_review"
        }
    ];

    
    it('decreases the count by updating one of the rows', () => {
        const updatedRow = {
            id: 1,
            status: "processed"
        }
        
        const result = applyRecountResult(rows, updatedRow);

        expect(result.totals.openReviewCount).toBe(1);
        expect(result.totals.totalRows).toBe(3);
    })

    it('replaces the matched row in the returned rows array', () => {
        const updatedRow = { id: 1, status: "processed" };

        const result = applyRecountResult(rows, updatedRow);

        expect(result.rows.find(r => r.id === 1)).toEqual(updatedRow);
        expect(result.rows.find(r => r.id === 2)).toEqual(rows[1]);
        expect(result.rows.find(r => r.id === 3)).toEqual(rows[2]);
    })

    it('returns the same openReviewCount for insignificant status change', () => {
        const updatedRow = {
            id: 2,
            status: "closed"
        }

        const result = applyRecountResult(rows, updatedRow)

        expect(result.totals.openReviewCount).toBe(2);
        expect(result.totals.totalRows).toBe(3);
    })

    it('leaves rows unchanged when the id does not exist', () => {
        const updatedRow = { id: 99, status: "processed" };

        const result = applyRecountResult(rows, updatedRow);

        expect(result.rows).toEqual(rows);
        expect(result.totals.openReviewCount).toBe(2);
    })
})