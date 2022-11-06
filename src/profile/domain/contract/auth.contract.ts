
export interface AuthProvider {
    updateProfile(profile: any): Promise<void>
}