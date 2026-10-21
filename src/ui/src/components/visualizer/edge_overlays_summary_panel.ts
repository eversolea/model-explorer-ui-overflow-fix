/**
 * @license
 * Copyright 2026 Intel Corporation. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==============================================================================
 */

import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AppService} from './app_service';
import {EdgeOverlaysService} from './edge_overlays_service';

/** One edge overlay as a row of the list. */
interface OverlayRow {
  /** Id of the overlay set the overlay was loaded in. */
  setId: string;
  /** Id of the overlay itself. */
  overlayId: string;
  name: string;
  /** Whether the overlay is currently drawn. */
  selected: boolean;
}

/**
 * The info panel's list of loaded edge overlays (e.g. critical paths), laid
 * out like the node data providers list: a numbered row per overlay with a
 * show/hide toggle and a delete button. Unlike node data providers, any
 * number of overlays can be shown at once.
 */
@Component({
  standalone: true,
  selector: 'edge-overlays-summary-panel',
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './edge_overlays_summary_panel.ng.html',
  // Reuses the node data provider run list's styles; the markup uses the same
  // classes.
  styleUrls: ['./node_data_provider_summary_panel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdgeOverlaysSummaryPanel {
  private readonly appService = inject(AppService);
  private readonly edgeOverlaysService = inject(EdgeOverlaysService);

  /** Every loaded overlay, across all overlay sets, in load order. */
  readonly rows = computed<OverlayRow[]>(() => {
    const selectedIds = this.edgeOverlaysService.selectedOverlayIds();
    const rows: OverlayRow[] = [];
    for (const set of this.edgeOverlaysService.filteredLoadedEdgeOverlays()) {
      for (const overlay of set.processedOverlays) {
        rows.push({
          setId: set.id,
          overlayId: overlay.id,
          name: overlay.name,
          selected: selectedIds.includes(overlay.id),
        });
      }
    }
    return rows;
  });

  get fontSize(): number {
    return this.appService.config()?.infoPanelFontSize ?? 12;
  }

  handleClickToggleVisibility(row: OverlayRow, event: Event) {
    event.stopPropagation();
    this.edgeOverlaysService.toggleOverlaySelection(row.overlayId);
  }

  /** Deletes the row's whole overlay set, which is how overlays are loaded. */
  handleClickDelete(row: OverlayRow, event: Event) {
    event.stopPropagation();
    this.edgeOverlaysService.deleteOverlayData(row.setId);
  }

  /** Returns the tooltip of the row's show/hide toggle. */
  getVisibleToggleTooltip(row: OverlayRow): string {
    return row.selected
      ? 'Showing in graph. Click to hide'
      : 'Click to show in graph';
  }
}
