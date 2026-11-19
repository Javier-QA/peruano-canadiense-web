import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { EditorModuloBase } from '../../shared/editor-modulo/editor-modulo-base';
import { EditorEsquemaMarco } from '../../shared/editor-modulo/editor-esquema-marco';
import { LICENCIAMIENTO_SCHEMA, LICENCIAMIENTO_TABS } from './licenciamiento.schema';

@Component({
  selector: 'app-admin-licenciamiento',
  standalone: true,
  imports: [EditorEsquemaMarco],
  template: `
    <app-editor-esquema-marco
      [editor]="this"
      modulo="licenciamiento"
      titulo="Licenciamiento"
      sub="Gestiona la información y los documentos del licenciamiento institucional."
      publicPath="/licenciamiento"
      [tabs]="tabs"
      [schema]="schema"
      [(activa)]="activa"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLicenciamiento extends EditorModuloBase<'licenciamiento'> {
  protected readonly moduloId = 'licenciamiento' as const;
  readonly schema = LICENCIAMIENTO_SCHEMA;
  readonly tabs = LICENCIAMIENTO_TABS;
  readonly activa = signal(LICENCIAMIENTO_TABS[0].id);
}
