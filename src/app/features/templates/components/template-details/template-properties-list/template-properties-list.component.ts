import { Component, inject, Input, OnDestroy } from '@angular/core';
import { Property } from '../../../../../shared/models/property.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TemplatePropertiesService } from '../../../../../core/services/template-properties.service';
import { TableModule } from 'primeng/table';
import { PropertyType } from '../../../../../shared/enumns/property-type.enum';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { PropertyValueComponent } from '../../../../../shared/components/property-value/property-value.component';

@Component({
    selector: 'app-template-properties-list',
    imports: [TableModule, ButtonModule, SkeletonModule, PropertyValueComponent],
    providers: [DialogService, MessageService],
    standalone: true,
    templateUrl: './template-properties-list.component.html',
    styleUrl: './template-properties-list.component.scss'
})
export class TemplatePropertiesListComponent implements OnDestroy {
    @Input({ required: true }) templateId!: string;
    @Input({ required: true }) properties: Property[] | null = null;
    @Input({ required: true }) propertiesLoaded = false;
    private readonly messageService = inject(MessageService);
    private readonly propertiesService = inject(TemplatePropertiesService);
    private readonly dialogService = inject(DialogService);
    readonly PropertyType = PropertyType;
    private ref?: DynamicDialogRef;
    private readonly subscriptions = new Subscription();

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
        this.ref?.destroy();
    }

    showCreatePropertyDialog(): void {}

    showEditDropdownItemsDialog(property: Property): void {}

    showEditTableColumnItemsDialog(property: Property): void {}

    showEditPropertyDialog(property: Property): void {}

    showDeletePropertyDialog(property: Property): void {}
}
