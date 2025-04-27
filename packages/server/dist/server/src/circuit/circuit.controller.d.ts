import { CircuitService } from './circuit.service';
import { ApiResponse } from '../common/api-response';
export declare class CircuitController {
    private readonly circuitService;
    constructor(circuitService: CircuitService);
    createCircuit(createCircuitDto: any, req: any): Promise<ApiResponse<any>>;
    addPost(circuitId: string, postId: string, req: any): Promise<ApiResponse<boolean>>;
    followCircuit(circuitId: string, req: any): Promise<ApiResponse<boolean>>;
    unfollowCircuit(circuitId: string, req: any): Promise<ApiResponse<boolean>>;
    getCircuit(circuitId: string, req: any): Promise<ApiResponse<any>>;
    listCircuits(req: any, cursor?: string, limit?: number): Promise<ApiResponse<any>>;
    getCircuitFeed(circuitId: string, req: any, cursor?: string, limit?: number): Promise<ApiResponse<any>>;
}
