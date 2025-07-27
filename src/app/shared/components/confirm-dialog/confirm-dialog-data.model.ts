import { Confirmation } from 'primeng/api';
import { Observable } from 'rxjs';

export interface ConfirmDialogData {
    confirmation: Confirmation;
    accept: () => Observable<boolean>;
    reject?: () => Observable<boolean>;
}
