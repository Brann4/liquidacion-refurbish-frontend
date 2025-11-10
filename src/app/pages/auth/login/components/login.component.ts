import { TokenService } from '@/layout/service/token.service';
import { PrimeModules } from '@/utils/PrimeModule';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/AuthStore';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, FormsModule],
    templateUrl: './login.component.html'
})
export class Login {
    tokenStorage = inject(TokenService)
    authService = inject(AuthStore);

    frmLogin: FormGroup;
    fb = inject(FormBuilder);
    router = inject(Router);
    isSubmitting = signal<boolean>(false);

    email: string = '';
    password: string = '';

    checked: boolean = false;

    constructor() {
        this.frmLogin = this.fb.group({
            nombreUsuario: new FormControl('', [Validators.required]),
            passwordHash: new FormControl('', [Validators.required])
        });
    }

    onSubmit() {
        this.router.navigate(['dashboard']);
    }
}
