import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }
  get(key: string) : string | null {
    if(isPlatformBrowser(this.platformId))
    {
      return sessionStorage.getItem(key);
    }
    return null;
  }

  set(key: string, value: string): void {
    if(isPlatformBrowser(this.platformId))
    {
      sessionStorage.setItem(key, value);
    }
  }

  remove(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(key);
    }
  }
}
