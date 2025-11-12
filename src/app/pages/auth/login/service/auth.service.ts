import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthStore } from '../stores/AuthStore';
import { DTOAuthResponse } from '../entities/DtoAuthResponse';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly apiUrl = environment.URL;
    private readonly module = "Auth";

    constructor() { }

    login(credentials: { nombreUsuario: string, passwordHash: string }) {
        return this.http.post<DTOAuthResponse>(`${this.apiUrl}/Auth/Autenticar`, credentials)
    }

}
