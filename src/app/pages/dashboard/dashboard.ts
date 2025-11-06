import { Component } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';

@Component({
    selector: 'app-dashboard',
    imports: [/*StatsWidget, BestSellingWidget, RevenueStreamWidget*/],
    template: `
        <div class="grid grid-cols-24 gap-8">
            <!--<app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
            </div>-->
            <h1>Bienvenida</h1>
        </div>
    `
})
export class Dashboard {}
