export interface SignInViewModel {    
    userId: string,
    access_token: string,
    expires: number,
    refresh_token: string,
    refresh_token_expires: number
}