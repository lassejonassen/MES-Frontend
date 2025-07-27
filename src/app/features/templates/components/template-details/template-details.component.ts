import { ChangeDetectionStrategy, Component, inject, Input, OnInit, signal } from '@angular/core';
import { TemplatesService } from '../../../../core/services/templates.service';
import { TemplatePropertiesService } from '../../../../core/services/template-properties.service';
import { Template } from '../../../../shared/models/template.model';
import { finalize, take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { CommonModule } from '@angular/common';
import { Tab, TabsModule } from 'primeng/tabs';
import { TemplatePropertiesListComponent } from './template-properties-list/template-properties-list.component';

const COMPONENTS = [TemplatePropertiesListComponent];
const PRIMENG_MODULES = [CardModule, SkeletonModule, TabsModule];

@Component({
    selector: 'app-template-details',
    templateUrl: './template-details.component.html',
    styleUrl: './template-details.component.scss',
    standalone: true,
    imports: [CommonModule, ...PRIMENG_MODULES, ...COMPONENTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateDetailsComponent implements OnInit {
    @Input({ required: true }) templateId!: string;
    private route = inject(ActivatedRoute);
    private templatesService = inject(TemplatesService);
    protected templatePropertiesService = inject(TemplatePropertiesService);
    template = signal<Template | undefined>(undefined);
    propertiesLoaded = signal(false);

    ngOnInit(): void {
        const templateId = this.route.snapshot.paramMap.get('templateId');
        if (templateId) {
            this.templateId = templateId;

            this.templatesService
                .get(templateId)
                .pipe(take(1))
                .subscribe((x) => this.template.set(x!));
            this.templatePropertiesService
                .getProperties(templateId)
                .pipe(
                    take(1),
                    finalize(() => this.propertiesLoaded.set(true))
                )
                .subscribe();
        }
    }
}
