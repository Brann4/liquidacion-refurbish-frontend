import { TokenService } from '@/layout/service/token.service';
import { DTOUsuario } from '@/pages/usuario/entities/DTOUsuario';
import { UsuarioService } from '@/pages/usuario/services/usuario.service';
import { inject, signal } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Rol } from '@/utils/Constants';
import { Router } from '@angular/router';
import { ToastService } from '@/layout/service/toast.service';

export type AuthState = {
    userAuthenticated: DTOUsuario | null;
    isAuthenticated: boolean;
    isSubmitting : boolean;
};

const initialState: AuthState = {
    userAuthenticated: null,
    isAuthenticated: false,
    isSubmitting: false
};

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState<AuthState>(initialState),
    withMethods((store, tokenService = inject(TokenService), usuarioService = inject(UsuarioService), toast = inject(ToastService), authService = inject(AuthService), router = inject(Router)) => ({
        
    
        isLoggedIn() {
            const token = this.getJWT();
            if (!token || token === '{}') {
                return false;
            }

            if (this.isTokenExpired()) {
                this.clearAuthData();
                return false;
            }

            return true;
        },
        //TODO: validar en segunda
        isValidTokenFormat(token: string): boolean {
            try {
                const parts = token.split('.');
                return parts.length === 3;
            } catch (error) {
                return false;
            }
        },
        clearAuthData() {
            this.removeJWT();
            patchState(store, {
                isAuthenticated: false,
                userAuthenticated: null
            });
        },
        saveJWT(JWT: string) {
            tokenService.set('JWT', JWT);
        },
        getJWT(): string | null {
            return tokenService.get('JWT') || null;
        },
        removeJWT() {
            tokenService.remove('JWT');
        },
        setUserAuthenticated(user: DTOUsuario) {
            patchState(store, { userAuthenticated: user });
        },

        parseJWTClaims(JWT: string): any | null {
            try {
                const payload = JWT.split('.')[1];

                if (typeof window !== 'undefined') {
                    const decoded = window.atob(payload);
                    return JSON.parse(decoded);
                }
            } catch (error) {
                console.error('Error al decodificar el JWT:', error);
            }
            return null;
        },
        getCurrentUser(): DTOUsuario | null {
            return store.userAuthenticated();
        },

        getUserId(): number | null {
            return Number(this.getUserIdFromJWT(this.getJWT() || ''));
        },

        getUserRoleId(): number | null {
            const claims = this.parseJWTClaims(this.getJWT() || '');
            if (!claims) return null;

            const roleId = claims.role || 0;
            return Number(roleId) || null;
        },
        getUserIdFromJWT(JWT: string): number | null {
            const claims = this.parseJWTClaims(JWT);
            if (!claims) return null;
            let userId = claims.nameid;

            return Number(userId) || null;
        },

        getTokenExpInfo(): { exp: string; nbf: string } | null {
            const claims = this.parseJWTClaims(this.getJWT() || '');
            if (!claims) return null;

            const tokenExpirationDate = claims['exp'];
            const tokenGenerateDate = claims['nbf'];

            const expDate = new Date(tokenExpirationDate * 1000).toLocaleString('es-PE', {
                timeZone: 'America/Lima'
            });
            const nbfDate = new Date(tokenGenerateDate * 1000).toLocaleString('es-PE', {
                timeZone: 'America/Lima'
            });

            return { exp: expDate, nbf: nbfDate };
        },

        isTokenExpired(): boolean {
            const tokenInfo = this.getTokenExpInfo();
            const currentTime = Math.floor(Date.now() / 1000);
            return currentTime > Number(tokenInfo?.exp);
        },
        async fetchUserDetails(userId: number): Promise<DTOUsuario | null> {
            try {
                const response = await firstValueFrom(usuarioService.getById(userId));
                if (!response) return null;
                const user = response.value;
                patchState(store, { userAuthenticated: user });
                return user;
            } catch (error) {
                console.error('Error al obtener los detalles del usuario:', error);
                patchState(store, { userAuthenticated: null });
                return null;
            }
        },

        async getUserAuthenticated(): Promise<DTOUsuario | null> {
            try {
                const token = this.getJWT();

                if (!token || token === '{}' || this.isTokenExpired()) {
                    patchState(store, {
                        isAuthenticated: false,
                        userAuthenticated: null
                    });
                    this.clearAuthData();
                    return null;
                }

                const userId = await this.getUserIdFromJWT(token);
                if (!userId) {
                    patchState(store, {
                        isAuthenticated: false,
                        userAuthenticated: null
                    });
                    return null;
                }

                const userDetails = await this.fetchUserDetails(userId);
                if (userDetails) {
                    patchState(store, {
                        isAuthenticated: true,
                        userAuthenticated: userDetails
                    });
                }
                return userDetails;
            } catch (error) {
                console.error('Error al decodificar el JWT:', error);
                return null;
            }
        },

        async handleLoginResponse(response: any): Promise<boolean> {
            if (!response.status) return false;
            this.saveJWT(response.token);

            const user = await this.getUserAuthenticated();

            if (user && !this.isTokenExpired()) {
                patchState(store, {
                    isAuthenticated: true,
                    userAuthenticated: user
                });
                return true;
            }
            this.clearAuthData();
            return false;
        },

        updateIsAuthenticated(isAuthenticated: boolean) {
            patchState(store, { isAuthenticated });
        },

        logout() {
            this.clearAuthData();
            this.updateIsAuthenticated(this.isLoggedIn())
            router.navigate(['/'], { replaceUrl: true })
        },
        login(data: any){
            patchState(store,{ isSubmitting: true})
            authService.login(data).subscribe({
                next: async(response)  => {
                    const success = await this.handleLoginResponse(response);
                    if(!response.status){
                        this.clearAuthData()
                        patchState(store,{ isSubmitting: false})
                        toast.warn(response.msg);
                        router.navigate(['/']);
                    }
                },
                error: () => {
                    patchState(store,{isSubmitting: false})
                }
            });
        },

        tryAutoLogin(): boolean {
            const token = this.getJWT();
            const userRolId = this.getUserRoleId();
            const state = signal<boolean>(false);

            if (userRolId && Rol[userRolId] !== undefined) {
                if (token && token !== '{}' && !this.isTokenExpired()) {
                    router.navigate(['dashboard']);
                    state.set(true);
                }
            }
            else {
                router.navigate(['/']);
                state.set(false);
            }
            return state();

        }
    }))
);
