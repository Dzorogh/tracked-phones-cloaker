export interface CalltrackingServiceInterface {
    whenLoaded: (timeout: number) => Promise<this>

    getReplacementPhone: (searchablePhone: string) => Promise<string | null>
}
