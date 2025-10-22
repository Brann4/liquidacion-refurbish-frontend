import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export function handleHttpError(error: HttpErrorResponse) {
    console.error('Error HTTP:', error);

    let errorMessage = 'Error de conexión';

    if (error.status === 400 || error.status === 500) {
        if (error.error && typeof error.error === 'object') {
            if (error.error.status === false && error.error.msg) {
                errorMessage = error.error.msg;
            } else if (error.error.msg) {
                errorMessage = error.error.msg;
            }
        } else if (typeof error.error === 'string') {
            errorMessage = error.error;
        }
    } else {
        switch (error.status) {
            case 401:
                errorMessage = 'Credenciales inválidas o sesión expirada';
                break;
            case 403:
                errorMessage = 'Acceso denegado';
                break;
            case 404:
                errorMessage = 'Servicio no encontrado';
                break;
            case 0:
                errorMessage = 'No se puede conectar al servidor. Verifique su conexión a internet.';
                break;
            default:
                if (error.error?.message) {
                    errorMessage = error.error.message;
                } else {
                    errorMessage = `Error del servidor (${error.status})`;
                }
        }
    }

    return throwError(() => new Error(errorMessage));
}
