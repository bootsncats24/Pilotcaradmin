import { Transaction } from '../shared/types';

export interface DuplicateCheck {
  isDuplicate: boolean;
  matchingTransaction?: Transaction;
}

export class DuplicateDetector {
  /**
   * Check if a transaction is a duplicate
   */
  static async checkDuplicate(
    transaction: {
      date: string;
      amount: number;
      description: string;
    },
    existingTransactions: Transaction[]
  ): Promise<DuplicateCheck> {
    // Look for exact matches: same date, amount, and description
    const exactMatch = existingTransactions.find(
      (t) =>
        t.date === transaction.date &&
        Math.abs(t.amount - transaction.amount) < 0.01 && // Allow for floating point differences
        this.normalizeDescription(t.description) === this.normalizeDescription(transaction.description)
    );

    if (exactMatch) {
      return {
        isDuplicate: true,
        matchingTransaction: exactMatch,
      };
    }

    // Check for close matches (same date and amount, similar description)
    const closeMatch = existingTransactions.find(
      (t) =>
        t.date === transaction.date &&
        Math.abs(t.amount - transaction.amount) < 0.01 &&
        this.descriptionsSimilar(t.description, transaction.description)
    );

    if (closeMatch) {
      return {
        isDuplicate: true,
        matchingTransaction: closeMatch,
      };
    }

    return {
      isDuplicate: false,
    };
  }

  /**
   * Normalize description for comparison
   */
  private static normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  /**
   * Check if two descriptions are similar enough to be considered duplicates
   */
  private static descriptionsSimilar(desc1: string, desc2: string): boolean {
    const normalized1 = this.normalizeDescription(desc1);
    const normalized2 = this.normalizeDescription(desc2);

    // If one contains the other, they're similar
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true;
    }

    // Calculate simple similarity score (Jaccard similarity of words)
    const words1 = new Set(normalized1.split(' '));
    const words2 = new Set(normalized2.split(' '));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    const similarity = intersection.size / union.size;

    return similarity > 0.6; // 60% similar
  }

  /**
   * Batch check for duplicates
   */
  static async checkBatch(
    transactions: Array<{ date: string; amount: number; description: string }>,
    existingTransactions: Transaction[]
  ): Promise<Map<number, DuplicateCheck>> {
    const results = new Map<number, DuplicateCheck>();

    for (let i = 0; i < transactions.length; i++) {
      const check = await this.checkDuplicate(transactions[i], existingTransactions);
      if (check.isDuplicate) {
        results.set(i, check);
      }
    }

    return results;
  }
}












