export interface AlgorithmicCircuitQuery {
    query: string;
    hashtags?: string[];
    minLikes?: number;
    parameters?: Record<string, any>;
}
