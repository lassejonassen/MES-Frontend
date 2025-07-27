import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TemplatesService } from '../../../../core/services/templates.service';
import { MessageService } from 'primeng/api';
import { Template } from '../../../../shared/models/template.model';
import { Subscription } from 'rxjs';
import { TemplatesDialogData } from './templates-dialog-data.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule, Toast } from 'primeng/toast';

@Component({
    selector: 'app-templates-dialog',
    imports: [ButtonModule, ReactiveFormsModule, InputTextModule, ToastModule, Toast],
    providers: [MessageService],
    standalone: true,
    templateUrl: './templates-dialog.component.html',
    styleUrl: './templates-dialog.component.scss'
})
export class TemplatesDialogComponent {
    private fb = inject(FormBuilder);
    private ref = inject(DynamicDialogRef);
    private cdr = inject(ChangeDetectorRef);
    private config = inject(DynamicDialogConfig);
    private templatesService = inject(TemplatesService);
    private messageService = inject(MessageService);
    form = this.fb.group({
        name: this.fb.control<string | null>(null, { nonNullable: true }),
        description: this.fb.control<string | null>(null, { nonNullable: true })
    });
    template?: Template;
    saving = signal(false);
    editMode = signal(false);
    private subscriptions = new Subscription();

    constructor() {
        const data = this.config.data as TemplatesDialogData;

        if (data) {
            if (data.template) {
                this.template = data.template;
                this.editMode.set(true);
                this.form.patchValue({
                    name: this.template.name,
                    description: this.template.description
                });
            }
        } else {
            throw new Error('TemplatesDialogComponent was opened with incorecct config.');
        }
        this.subscriptions.add(
            this.form.valueChanges.subscribe(() => {
                this.cdr.detectChanges();
            })
        );
    }

    save(): void {
        if (this.form.valid && this.form.controls.name.value) {
            this.saving.set(true);
            const { name, description } = this.form.getRawValue();
            const editMode = this.editMode();
            const request = editMode ? this.templatesService.update(this.template!) : this.templatesService.create(name!, description!);
            this.subscriptions.add(
                request.subscribe({
                    next: (template) => {
                        this.saving.set(false);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: editMode ? 'Template updated successfully.' : 'Template created successfully.'
                        });
                        setTimeout(() => {
                            // Adding a small timeout creates the best effect when showing the success message
                            this.ref.close(template);
                        }, 200);
                    },
                    error: (err) => {
                        this.saving.set(false);
                        this.messageService.add({
                            summary: 'Error',
                            detail: editMode ? 'Failed to update template.' : 'Failed to create template.',
                            severity: 'error',
                            life: 5000
                        });
                    }
                })
            );
        }
    }

    cancel(): void {
        this.ref.close();
    }
}
