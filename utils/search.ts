
import type { Module, Quiz } from '../types';

/**
 * Lightweight Inverted Index Search Engine
 * Optimizes client-side filtering for datasets growing beyond simple array.filter capabilities.
 */
export class SearchEngine<T extends { id: string }> {
    private index: Map<string, Set<string>> = new Map();
    private items: Map<string, T> = new Map();

    constructor(items: T[], fields: (keyof T | string)[]) {
        this.buildIndex(items, fields);
    }

    /**
     * Tokenizes text into searchable terms.
     * Normalizes accents and converts to lowercase.
     */
    private tokenize(text: string): string[] {
        if (!text) return [];
        return text
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .split(/[^a-z0-9]+/)
            .filter(t => t.length > 2); // Filter out very short words
    }

    private buildIndex(items: T[], fields: (keyof T | string)[]) {
        this.index.clear();
        this.items.clear();

        items.forEach(item => {
            this.items.set(item.id, item);
            
            const tokens = new Set<string>();
            
            fields.forEach(field => {
                const value = item[field as keyof T];
                if (typeof value === 'string') {
                    this.tokenize(value).forEach(t => tokens.add(t));
                } else if (Array.isArray(value)) {
                    value.forEach(v => {
                        if (typeof v === 'string') {
                            this.tokenize(v).forEach(t => tokens.add(t));
                        }
                    });
                }
            });

            tokens.forEach(token => {
                if (!this.index.has(token)) {
                    this.index.set(token, new Set());
                }
                this.index.get(token)!.add(item.id);
            });
        });
    }

    /**
     * Performs a search against the index.
     * Returns items that match ALL tokens in the query (AND logic).
     */
    public search(queryText: string): T[] {
        const queryTokens = this.tokenize(queryText);
        if (queryTokens.length === 0) return Array.from(this.items.values());

        // Find match sets for each token (Prefix matching)
        const matchSets = queryTokens.map(qToken => {
            const matches = new Set<string>();
            for (const [token, ids] of this.index.entries()) {
                if (token.startsWith(qToken)) {
                    ids.forEach(id => matches.add(id));
                }
            }
            return matches;
        });

        if (matchSets.length === 0) return [];

        // Intersect all sets (AND operation)
        const intersection = matchSets.reduce((a, b) => {
            const result = new Set<string>();
            a.forEach(id => { if (b.has(id)) result.add(id); });
            return result;
        });

        return Array.from(intersection).map(id => this.items.get(id)!).filter(Boolean);
    }
}
