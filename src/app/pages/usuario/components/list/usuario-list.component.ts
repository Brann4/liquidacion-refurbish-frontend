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

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [PrimeModules, CreateComponent, EditComponent, BreadcrumbHeader],
    templateUrl: './usuario-list.component.html',
    styleUrl: './usuario-list.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService]
})
export class UsuarioListComponent {
    breadcrumbs = [{ label: 'Usuario' }];

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
    /*
        onViewDetail(usuario: DTOUsuario) {
            this.router.navigate([usuario.id], { relativeTo: this.route });
        }*/

    hideDialog() {
        this.usuarioDialog = false;
        this.submitted.set(false);
    }

    onDeleteModal(usuario: DTOUsuario) {
        this.confirmationService.confirm({
            message: `Estas seguro que desea eliminar a ${usuario.nombres} ${usuario.apellidos} ?`,
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
                this.usuarioStore.delete(usuario.id);
            },
            reject: () => {
                console.log('ERROR');
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
