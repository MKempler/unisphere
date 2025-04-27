export interface UniEvent {
    id?: string;
    type: string;
    data: any;
    sig?: string;
    publicKey?: string;
}
export interface PostDTO {
    id?: string;
    title: string;
    content: string;
    authorId: string;
}
export interface ProfileDTO {
    id: string;
    handle: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
}
export interface AuthResponseDTO {
    token: string;
    user: ProfileDTO;
}
export interface JWTPayload {
    sub: string;
    handle: string;
}
export interface CreatePostDTO {
    title: string;
    content: string;
}
export interface SignupRequestDTO {
    handle: string;
    displayName: string;
}
export interface SignupCallbackDTO {
    handle: string;
    code: string;
}
export interface AlgorithmicCircuitQuery {
    algorithm: string;
    params: Record<string, any>;
}
export declare const ApiResponse: {
    success: (data: any) => {
        ok: boolean;
        data: any;
    };
    error: (error: any) => {
        ok: boolean;
        error: any;
    };
};
export declare const signEvent: jest.Mock<any, [event: any], any>;
export declare const verifyEvent: jest.Mock<boolean, [], any>;
