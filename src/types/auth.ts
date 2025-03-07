export interface User {
    id: string
    email: string | null
    phone: string | null
    name: string
    avatar?: string
    createdAt: string
  }
  
  export interface AuthState {
    user: User | null
    isLoading: boolean
    error: string | null
  }