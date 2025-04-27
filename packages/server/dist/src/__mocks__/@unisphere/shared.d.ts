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
