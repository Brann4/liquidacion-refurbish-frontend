import { AuthStore } from "@/pages/auth/login/stores/AuthStore";
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { ToastService } from "../service/toast.service";


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authStore = inject(AuthStore)
  const router = inject(Router);
  const toastr = inject(ToastService);

  if (req.url.includes('/auth/') ) {
    return next(req);
  }

  const token = authStore.getJWT()
  if (!token || token === '{}' || authStore.isTokenExpired()) {
    return next(req);
  }

  //Para rutas protegidas, clonar request con token
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 419 ) //Tiempo de sesion expirado
      {
        const message = error.error.message || 'Se terminó el tiempo de sesión';
        toastr.error(message);

        authStore.logout();
        router.navigate(['/'], { replaceUrl: true });
      }
      else if (error.status === 401 ) //Unauthorized
      {
        const message = error.error?.message || 'Acceso denegado debido a credenciales no validas';
        toastr.error(message);
        authStore.logout();
        router.navigate(['/'], { replaceUrl: true });
      }
      else if(error.status === 403)
      {
        const message = error.error?.message || 'Acceso denegado';
        toastr.warn(message)
      }
      return throwError(() => error);
    })
  );


}
