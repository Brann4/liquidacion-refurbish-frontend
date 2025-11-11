import { TokenService } from '@/layout/service/token.service';
import { PrimeModules } from '@/utils/PrimeModule';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/AuthStore';
import { ToastService } from '@/layout/service/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [PrimeModules, ReactiveFormsModule, FormsModule],
    templateUrl: './login.component.html'
})
export class Login implements OnInit {
    tokenStorage = inject(TokenService)
    authStore = inject(AuthStore);
    toast = inject(ToastService);

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

    ngOnInit(): void {
        this.authStore.tryAutoLogin();
    }

    onSubmit() {
        this.frmLogin.markAllAsTouched();

        if (this.frmLogin.invalid) {
            this.toast.error('Debe ingresas usuario y contraseña');
            return;
        }

        if (this.frmLogin.valid) {
            this.frmLogin.get('nombreUsuario')?.setValue(this.frmLogin.get('nombreUsuario')?.value.trim());
            
        }

        this.router.navigate(['dashboard']);
    }
}
