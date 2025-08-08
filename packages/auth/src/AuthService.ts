import { apiClient } from '@vas-dj-saas/api-client';
import {
  AuthState,
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  RegistrationData,
  RegistrationResponse,
  SocialAuthData,
  SocialAuthResponse,
  EmailVerificationData,
  EmailVerificationResponse,
  ResendVerificationResponse,
  User,
  Organization,
  AuthError,
} from '@vas-dj-saas/types';

export type AuthStateListener = (state: AuthState) => void;

export class AuthService {
  private state: AuthState = {
    user: null,
    organization: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners: Set<AuthStateListener> = new Set();

  constructor() {
    this.initializeFromStorage();
  }

  // State management
  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: Partial<AuthState>): void {
    const prevState = this.state;
    this.state = { ...prevState, ...newState };
    
    // Only notify listeners if state actually changed
    if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
      this.listeners.forEach(listener => listener(this.state));
    }
  }

  private async initializeFromStorage(): Promise<void> {
    this.setState({ isLoading: true });
    
    try {
      const tokens = apiClient.getStoredTokens();
      
      if (tokens.accessToken) {
        // Verify token is still valid
        const tokenVerification = await apiClient.verifyToken();
        
        if (tokenVerification.valid && tokenVerification.user) {
          const authTokens: AuthTokens = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken || '',
          };

          this.setState({
            user: tokenVerification.user,
            organization: this.extractOrganizationFromUser(tokenVerification.user),
            tokens: authTokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to initialize auth from storage:', error);
      apiClient.clearTokens();
    }
    
    this.setState({
      user: null,
      organization: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }

  private extractOrganizationFromUser(user: User): Organization | null {
    // This will be enhanced when we get organization data from the API response
    return null;
  }

  private handleAuthResponse(response: LoginResponse | RegistrationResponse | SocialAuthResponse): void {
    const tokens: AuthTokens = {
      accessToken: response.access,
      refreshToken: response.refresh,
    };

    const organization = 'organization' in response ? response.organization : null;

    this.setState({
      user: response.user,
      organization,
      tokens,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.login(credentials);
      this.handleAuthResponse(response);
      return response;
    } catch (error) {
      const authError = error as AuthError;
      this.setState({ 
        isLoading: false, 
        error: authError.message || 'Login failed' 
      });
      throw authError;
    }
  }

  async register(data: RegistrationData): Promise<RegistrationResponse> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.register(data);
      this.handleAuthResponse(response);
      return response;
    } catch (error) {
      const authError = error as AuthError;
      this.setState({ 
        isLoading: false, 
        error: authError.message || 'Registration failed' 
      });
      throw authError;
    }
  }

  async socialAuth(data: SocialAuthData): Promise<SocialAuthResponse> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.socialAuth(data);
      this.handleAuthResponse(response);
      return response;
    } catch (error) {
      const authError = error as AuthError;
      this.setState({ 
        isLoading: false, 
        error: authError.message || 'Social authentication failed' 
      });
      throw authError;
    }
  }

  async logout(): Promise<void> {
    this.setState({ isLoading: true, error: null });
    
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.setState({
        user: null,
        organization: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }

  // Email verification methods
  async verifyEmail(data: EmailVerificationData): Promise<EmailVerificationResponse> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.verifyEmail(data);
      
      // Update user in state if verification was successful
      if (response.user && this.state.user) {
        this.setState({
          user: { ...this.state.user, ...response.user },
          isLoading: false,
        });
      } else {
        this.setState({ isLoading: false });
      }
      
      return response;
    } catch (error) {
      const authError = error as AuthError;
      this.setState({ 
        isLoading: false, 
        error: authError.message || 'Email verification failed' 
      });
      throw authError;
    }
  }

  async resendVerification(): Promise<ResendVerificationResponse> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.resendVerification();
      this.setState({ isLoading: false });
      return response;
    } catch (error) {
      const authError = error as AuthError;
      this.setState({ 
        isLoading: false, 
        error: authError.message || 'Failed to resend verification' 
      });
      throw authError;
    }
  }

  // Utility methods
  clearError(): void {
    this.setState({ error: null });
  }

  isEmailVerified(): boolean {
    return this.state.user?.isEmailVerified || false;
  }

  isOnTrial(): boolean {
    return this.state.organization?.onTrial || false;
  }

  getTrialDaysRemaining(): number | null {
    if (!this.state.organization?.trialEndsOn) return null;
    
    const trialEnd = new Date(this.state.organization.trialEndsOn);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  hasAdminRole(): boolean {
    return this.state.user?.isAdmin || false;
  }

  canManageBilling(): boolean {
    return this.state.user?.isOrgAdmin || this.state.user?.isOrgCreator || false;
  }
}

// Create singleton instance
export const authService = new AuthService();