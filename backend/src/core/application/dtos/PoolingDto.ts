/**
 * DTOs for Pooling operations (Article 21)
 */

/** Input DTO — create pool request */
export interface CreatePoolInput {
    shipIds: string[];
    year: number;
}

/** Output DTO — pool member result */
export interface PoolMemberDto {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
}

/** Output DTO — pool with its members */
export interface PoolDto {
    poolId: string;
    year: number;
    members: PoolMemberDto[];
    netCb: number;
}
