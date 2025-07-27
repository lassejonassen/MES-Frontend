import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Confirmation } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Observable, take } from 'rxjs';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
    private readonly ref = inject(DynamicDialogRef);
    private readonly config = inject(DynamicDialogConfig);
    confirmation: Confirmation;
    accepting = signal(false);
    rejecting = signal(false);
    accept: () => Observable<boolean>;
    reject?: () => Observable<boolean>;

    constructor() {
        if (this.config.data?.confirmation && this.config.data?.accept) {
            this.confirmation = this.config.data.confirmation as Confirmation;
            if (this.confirmation.accept || this.confirmation.reject) {
                throw new Error('Accept/reject functions should not be set on the confirmation object');
            }
            this.accept = this.config.data.accept;
            this.reject = this.config.data.reject;
        } else {
            throw new Error('ConfirmDialogComponent was opened with incorrect config');
        }
    }

    confirm(): void {
        this.accepting.set(true);
        this.accept()
            .pipe(take(1))
            .subscribe((result) => {
                this.accepting.set(false);
                this.ref.close(result);
            });
    }

    cancel(): void {
        if (this.reject) {
            this.rejecting.set(true);
            this.reject()
                .pipe(take(1))
                .subscribe((result) => {
                    this.rejecting.set(false);
                    this.ref.close(result);
                });
        } else {
            this.ref.close(false);
        }
    }
}
