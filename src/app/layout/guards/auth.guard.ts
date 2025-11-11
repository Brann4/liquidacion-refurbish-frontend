import { AuthStore } from '@/pages/auth/login/stores/AuthStore';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from '../service/toast.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authStore = inject(AuthStore);
  const router = inject(Router);
  const toastr = inject(ToastService);

  if(authStore.isLoggedIn() && !authStore.isTokenExpired() ){
    return true;
  }
  if(authStore.getJWT()){
    toastr.error("Tu sesion ha expirado, porfavor inicia sesion nuevamente");
  }

  authStore.clearAuthData();
  return router.createUrlTree(['/']);
};
