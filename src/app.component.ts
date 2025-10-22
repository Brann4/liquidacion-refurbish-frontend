import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ToastModule, NgClass, ConfirmDialog],
    template: `
        <p-toast position="top-center" key="global" [baseZIndex]="1000"></p-toast>
        <p-confirm-dialog [draggable]="false">
            <ng-template #message let-message>
                <div class="flex flex-col items-center gap-4 w-xs">
                    <i [ngClass]="message.icon" style="font-size: 2.5rem"></i>
                    <p class="text-center">{{ message.message }}</p>
                </div>
            </ng-template>
        </p-confirm-dialog>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {}
