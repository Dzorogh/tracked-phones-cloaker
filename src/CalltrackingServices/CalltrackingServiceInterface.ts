type resultPhone = string;

export interface CalltrackingServiceInterface {
    whenLoaded: (timeout: number) => Promise<this>

    getReplacementPhone: (searchablePhone: string, timeout: number) => Promise<resultPhone | null>
}
