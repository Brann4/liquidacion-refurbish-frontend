import { ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Estado } from '@/utils/Constants';
import { Helper } from '@/utils/Helper';
import { PrimeModules } from '@/utils/PrimeModule';
import { DTORol } from '../../entities/DTORol';
import { RolStore } from '../../stores/RolStore';
import { DTOUpdateRol } from '../../entities/DTOUpdateRol';
import { RolEditComponent } from '../edit/rol-edit.component';
import { RolCreateComponent } from '../create/rol-create.component';
import { BreadcrumbHeader } from '@/layout/component/breadcrumb/breadcrumb.header';

@Component({
    selector: 'app-rol-list',
    standalone: true,
    imports: [PrimeModules, RolEditComponent, RolCreateComponent, BreadcrumbHeader],
    templateUrl: './rol-list.component.html',
    styleUrl: './rol-list.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService]
})
export class RolListComponent implements OnInit {
    breadcrumbs = [{ label: 'Roles' }];
    rolDialog: boolean = false;
    roles = signal<DTORol[]>([]);
    submitted = signal<boolean>(false);
    statuses!: any[];
    @ViewChild('dt') dt!: Table;

    rolStore = inject(RolStore);
    confirmationService = inject(ConfirmationService);
    router = inject(Router);
    route = inject(ActivatedRoute);

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.rolStore.getRols(Estado.Todos);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openCreateModal() {
        this.rolStore.openModalCreate();
    }

    OnEditModal(usuario: DTOUpdateRol) {
        if (usuario) {
            this.rolStore.openModalEdit(usuario);
        }
    }
    /*
        onViewDetail(usuario: DTOUsuario) {
            this.router.navigate([usuario.id], { relativeTo: this.route });
        }*/

    hideDialog() {
        this.rolDialog = false;
        this.submitted.set(false);
    }

    onDeleteModal(rol: DTORol) {
        this.confirmationService.confirm({
            message: `Estas seguro que desea eliminar a ${rol.descripcion} ?`,
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {
                label: 'Eliminar',
                severity: 'danger'
            },
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                text: true
            },
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            accept: () => {
                this.rolStore.delete(rol.id);
            },
            reject: () => {
                console.log('ERROR');
            }
        });
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.roles().length; i++) {
            if (this.roles()[i].id == id) {
                index = i;
                break;
            }
        }
        return index;
    }

    getSeverity(status: boolean) {
        return Helper.setStatus(status);
    }
}
