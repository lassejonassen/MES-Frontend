import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TreeTableModule } from 'primeng/treetable';
import { TemplatesService } from '../../../../core/services/templates.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, map, Observable, of, skip, take, tap } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateDerivedTemplateDialogData } from '../create-derived-template-dialog/create-derived-template-dialog-data.model';
import { CreateDerivedTemplateDialogComponent } from '../create-derived-template-dialog/create-derived-template-dialog.component';
import { Template } from '../../../../shared/models/template.model';
import { TemplatesDialogData } from '../templates-dialog/templates-dialog-data.model';
import { TemplatesDialogComponent } from '../templates-dialog/templates-dialog.component';
import { ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog-data.model';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-templates-list',
    imports: [TableModule, InputIconModule, IconFieldModule, InputTextModule, TreeTableModule, ButtonModule, RouterLink, SkeletonModule],
    providers: [DialogService, MessageService],
    standalone: true,
    templateUrl: './templates-list.component.html',
    styleUrl: './templates-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesListComponent implements OnInit, OnDestroy {
    @ViewChild('tableContainer') tableContainer?: ElementRef;
    @ViewChild('filter') filter!: ElementRef;
    private templatesService = inject(TemplatesService);
    private messageService = inject(MessageService);
    private dialogService = inject(DialogService);
    nodes = toSignal(
        this.templatesService.treeNodes$.pipe(
            skip(1),
            tap(() => this.nodesLoading.set(false))
        )
    );
    nodesLoading = signal(true);
    private ref?: DynamicDialogRef;

    ngOnInit(): void {
        console.log('TemplatesListComponent initialized');
        this.templatesService
            .getAll()
            .pipe(take(1))
            .subscribe({
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        summary: 'Error',
                        detail: 'Failed to load templates',
                        severity: 'error',
                        life: 5000
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.ref?.destroy();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    showTemplatesDialog(template?: Template): void {
        const data: TemplatesDialogData = {
            template: template
        };

        this.ref = this.dialogService.open(TemplatesDialogComponent, {
            header: 'Template Details',
            dismissableMask: false,
            modal: true,
            data
        });
    }

    showCreateDerivedTemplateDialog(template: Template): void {
        const data: CreateDerivedTemplateDialogData = {
            baseTemplate: template
        };

        this.ref = this.dialogService.open(CreateDerivedTemplateDialogComponent, {
            header: 'Create Derived Template',
            dismissableMask: false,
            modal: true,
            data
        });
    }

    showDeleteTemplateDialog(template: Template) {
        console.log(template);
        const data: ConfirmDialogData = {
            confirmation: {
                message: 'Are you sure you want to delete this template?',
                header: 'Delete Template',
                icon: 'pi pi-trash',
                acceptButtonStyleClass: 'p-button-primary',
                rejectButtonStyleClass: 'p-button-text'
            },
            accept: () => this.deleteTemplate(template)
        };

        this.ref = this.dialogService.open(ConfirmDialogComponent, {
            header: data.confirmation.header,
            dismissableMask: false,
            closable: false,
            modal: true,
            data
        });
    }

    deleteTemplate(template: Template): Observable<boolean> {
        if (template?.id) {
            return this.templatesService.delete(template!.id).pipe(
                map(() => true),
                catchError(() => {
                    this.messageService.add({
                        summary: 'Error',
                        detail: 'Failed to delete template',
                        severity: 'error',
                        life: 5000
                    });
                    return of(false);
                }),
                map((success) => {
                    if (success) {
                        this.messageService.add({
                            summary: 'Success',
                            detail: 'Template deleted successfully',
                            severity: 'success'
                        });
                    }
                    return success;
                })
            );
        } else {
            return of(false);
        }
    }
}
