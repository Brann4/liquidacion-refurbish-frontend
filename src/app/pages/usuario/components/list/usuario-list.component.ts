import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import { DTOUsuario } from '../../entities/DTOUsuario';
import { Table } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuarioStore } from '../../stores/UsuarioStore';
import { Estado } from '@/utils/Constants';
import { Helper } from '@/utils/Helper';
import { DTOUpdateUsuario } from '../../entities/DTOUpdateUsuario';
import { PrimeModules } from '@/utils/PrimeModule';
import { CreateComponent } from '../create/usuario-create.component';
import { EditComponent } from '../edit/usuario-edit.component';
import { BreadcrumbHeader } from '@/layout/component/breadcrumb/breadcrumb.header';
import { ConfirmationDialog } from '@/pages/service/confirmation-dialog';

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [PrimeModules, CreateComponent, EditComponent, BreadcrumbHeader],
    templateUrl: './usuario-list.component.html',
    styleUrl: './usuario-list.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioListComponent {
    breadcrumbs = [{ label: 'Usuario' }];
    confirmationDialogService = inject(ConfirmationDialog);
    usuarioDialog: boolean = false;
    usuarios = signal<DTOUsuario[]>([]);
    submitted = signal<boolean>(false);
    statuses!: any[];
    @ViewChild('dt') dt!: Table;

    usuarioStore = inject(UsuarioStore);
    confirmationService = inject(ConfirmationService);
    router = inject(Router);
    route = inject(ActivatedRoute);

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.usuarioStore.getUsuarios(Estado.Todos);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openCreateModal() {
        this.usuarioStore.openModalCreate();
    }

    OnEditModal(usuario: DTOUpdateUsuario) {
        if (usuario) {
            this.usuarioStore.openModalEdit(usuario);
        }
    }

    hideDialog() {
        this.usuarioDialog = false;
        this.submitted.set(false);
    }

    onDeleteModal(usuario: DTOUsuario) {
        this.confirmationDialogService.confirmDelete().subscribe((accepted) => {
            if (accepted) {
                this.usuarioStore.delete(usuario.id);
            }
        });
    }

    findIndexById(id: number): number {
        let index = -1;
        for (let i = 0; i < this.usuarios().length; i++) {
            if (this.usuarios()[i].id == id) {
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
