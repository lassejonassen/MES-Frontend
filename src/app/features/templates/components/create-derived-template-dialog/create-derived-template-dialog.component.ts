import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TemplatesService } from '../../../../core/services/templates.service';
import { Template } from '../../../../shared/models/template.model';
import { Subscription } from 'rxjs';
import { CreateDerivedTemplateDialogData } from './create-derived-template-dialog-data.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Toast, ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-create-derived-template-dialog',
    imports: [ButtonModule, ReactiveFormsModule, InputTextModule, ToastModule, Toast],
    providers: [MessageService],
    standalone: true,
    templateUrl: './create-derived-template-dialog.component.html',
    styleUrl: './create-derived-template-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDerivedTemplateDialogComponent {
    private fb = inject(FormBuilder);
    private ref = inject(DynamicDialogRef);
    private cdr = inject(ChangeDetectorRef);
    private config = inject(DynamicDialogConfig);
    private templatesService = inject(TemplatesService);
    private messageService = inject(MessageService);
    form = this.fb.nonNullable.group({
        baseTemplateId: ['', Validators.required],
        name: ['', Validators.required],
        description: ['', Validators.required]
    });
    baseTemplate?: Template;
    saving = signal(false);
    private subscriptions = new Subscription();

    constructor() {
        const data = this.config.data as CreateDerivedTemplateDialogData;
        if (data) {
            if (data.baseTemplate) {
                this.form.controls.baseTemplateId.setValue(data.baseTemplate.id!);
                this.baseTemplate = data.baseTemplate;
            }
        } else {
            throw new Error('CreateDerivedTemplateDialogComponent was opened with incorrect config');
        }
        this.subscriptions.add(
            this.form.valueChanges.subscribe(() => {
                this.cdr.detectChanges();
            })
        );
    }

    save(): void {
        if (this.form.valid && this.form.controls.name.value) {
            const baseTemplateId = this.form.controls.baseTemplateId.value;
            const name = this.form.controls.name.value;
            const description = this.form.controls.description.value;

            this.saving.set(true);
            this.subscriptions.add(
                this.templatesService.createDerivedTemplate(baseTemplateId, name, description).subscribe({
                    next: () => {
                        this.saving.set(false);
                        this.messageService.add({
                            summary: 'Success',
                            detail: 'Derivded Template created successfully',
                            severity: 'success'
                        });
                        setTimeout(() => {
                            // Adding a small timeout creates the best effect when showing the success message
                            this.ref.close();
                        }, 200);
                    },
                    error: () => {
                        this.saving.set(false);
                        this.messageService.add({
                            summary: 'Error',
                            detail: 'Failed to create derived template',
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
