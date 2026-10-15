import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MODULO_META } from '../../core/models/documento.model';
import { NewsService } from '../../core/services/news.service';
import { ArchivosStore } from '../../core/store/archivos.store';
import { ContenidoStore } from '../../core/store/contenido.store';
import { DocumentosStore } from '../../core/store/documentos.store';
import { FacultyStore } from '../../core/store/faculty.store';
import { DialogComponent } from '../../shared/ui';
import { ToastService } from '../shared/toast/toast';

@Component({
  selector: 'app-admin-contenido',
  standalone: true,
  imports: [RouterLink, DialogComponent],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="portal-header-identity">
          <div class="portal-header-copy">
            <h1 class="page-title"><i class="fa-solid fa-layer-group portal-title-icon" aria-hidden="true"></i>Contenido del portal</h1>
            <p class="page-sub">
            Administra las páginas, documentos y secciones visibles en el portal institucional.
          </p>
          </div>
        </div>
        <button type="button" class="btn-ghost" (click)="confirmar.set(true)">
          Restaurar todo
        </button>
      </header>

      <div class="modulo-grid" aria-label="Módulos del portal público">
        @for (mod of filas(); track mod.id) {
          <a class="admin-card modulo-tile" [routerLink]="mod.adminPath" [attr.aria-label]="'Editar ' + mod.titulo">
            <span class="modulo-icon"><i class="fa-solid {{ mod.icon }}" aria-hidden="true"></i></span>
            <div class="modulo-info">
              <h2 class="modulo-name">{{ mod.titulo }}</h2>
              <div class="modulo-counts">
                <span><strong>{{ mod.publicados }}</strong> publicados</span>
                <span><strong>{{ mod.borradores }}</strong> borradores</span>
              </div>
            </div>
            <div class="modulo-side">
              <i class="fa-solid fa-chevron-right modulo-arrow" aria-hidden="true"></i>
              @if (mod.modificado) {
                <span class="badge badge-modificado">Modificado</span>
              }
            </div>
          </a>
        }
      </div>
    </div>

    <app-dialog
      [open]="confirmar()"
      title="Restaurar todo el contenido"
      (openChange)="confirmar.set($event)"
    >
      @if (remoto) {
        <p>
          Los módulos de contenido y sus documentos vuelven al contenido oficial en el servidor,
          para todos los visitantes. Es inmediato y no se puede deshacer.
        </p>
        <p class="form-hint">
          Las noticias, el directorio de personal y el repositorio no se tocan: se gestionan en su
          propia pantalla.
        </p>
      } @else {
        <p>
          Se borran los cambios de los módulos de contenido, el directorio, las noticias, los
          documentos subidos y los archivos de este navegador. El portal vuelve a las constantes
          originales.
        </p>
      }
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="confirmar.set(false)">Cancelar</button>
        <button
          type="button"
          class="btn-danger"
          [disabled]="restaurando()"
          (click)="restaurarTodo()"
        >
          {{ restaurando() ? 'Restaurando…' : 'Restaurar todo' }}
        </button>
      </div>
    </app-dialog>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .admin-page { display: flex; flex-direction: column; gap: 22px; }
    .page-header {
      padding: 14px 22px; border: 1px solid #f1dfd2;
      border-radius: 16px; background: linear-gradient(115deg, #fff8f2, #fff 70%);
    }
    .page-header { align-items: center; padding: 14px 20px; border-radius: 16px; }
    .portal-header-identity { display: flex; align-items: center; flex: 1 1 auto; min-width: 0; }
    .portal-header-copy { min-width: 0; }
    .portal-title-icon { display: inline-block; margin-right: 10px; color: var(--adm-brand); font-size: .72em; vertical-align: .08em; }
    .portal-header-copy .page-title { display: flex; align-items: center; gap: 0; margin: 0 0 3px; line-height: 1.22; }
    .portal-header-copy .page-sub { margin: 0; }
    @media (max-width: 600px) { .portal-title-icon { margin-right: 8px; } }
    .page-header .page-title { font-size: clamp(1.4rem, 2vw, 1.75rem); }
    .page-header .page-sub { font-size: .85rem; }
    @media (max-width: 720px) { .page-header { padding: 20px; } }
    .page-header .page-sub { max-width: 68ch; line-height: 1.6; }
    .modulo-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      align-items: stretch;
    }
    .modulo-grid > .modulo-tile,
    .modulo-grid > .modulo-tile + .modulo-tile {
      margin: 0;
    }
    .modulo-tile {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      min-height: 102px;
      padding: 16px;
      min-width: 0;
      border: 1px solid var(--adm-line);
      border-radius: 15px;
      background: var(--adm-surface);
      box-shadow: 0 3px 14px rgba(27, 41, 61, .035);
      color: inherit;
      text-decoration: none;
      transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
    }
    .modulo-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 42px;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #fff0e4;
      color: var(--adm-brand);
      font-size: 1.04rem;
    }
    .modulo-info { flex: 1 1 auto; min-width: 0; }
    .modulo-name {
      margin: 0 0 7px;
      font-size: .99rem;
      line-height: 1.3;
      font-weight: 750;
      color: var(--adm-ink);
      overflow-wrap: normal;
    }
    .modulo-counts {
      display: flex;
      flex-wrap: wrap;
      gap: 3px 10px;
      color: var(--adm-muted);
      font-size: .72rem;
      line-height: 1.35;
    }
    .modulo-counts span { white-space: nowrap; }
    .modulo-counts strong { color: var(--adm-ink); font-weight: 750; }
    .modulo-side {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-between;
      align-self: stretch;
      gap: 10px;
    }
    .modulo-arrow { color: var(--adm-ink-soft); opacity: .6; font-size: .78rem; }
    .modulo-tile .badge { white-space: nowrap; font-size: .68rem; padding: 4px 8px; }
    .modulo-tile:hover { border-color: #f0b98f; box-shadow: 0 10px 24px rgba(27,41,61,.08); transform: translateY(-2px); }
    .modulo-tile:hover .modulo-arrow { color: var(--adm-brand); opacity: 1; }
    .modulo-tile:focus-visible { outline: 3px solid var(--adm-brand); outline-offset: 3px; }
    @media (max-width: 1370px) { .modulo-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 1050px) { .modulo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 640px) {
      .modulo-grid { grid-template-columns: 1fr; gap: 10px; }
      .modulo-tile { min-height: 88px; padding: 14px; }
      .page-header { padding: 16px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .modulo-tile { transition: none; }
      .modulo-tile:hover { transform: none; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContenido {
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);
  private readonly archivos = inject(ArchivosStore);
  private readonly personal = inject(FacultyStore);
  private readonly noticias = inject(NewsService);
  private readonly toast = inject(ToastService);

  readonly confirmar = signal(false);
  readonly remoto = environment.useRemoteApi;
  readonly restaurando = signal(false);

  readonly filas = computed(() =>
    MODULO_META.map((mod) => {
      const conteo = this.documentos.conteo(mod.id);
      return {
        ...mod,
        modificado: this.contenido.de(mod.id).modificado(),
        publicados: conteo.publicados,
        borradores: conteo.borradores,
      };
    }),
  );

  /**
   * Con backend, restaurar significa pedirle al servidor que reponga el copy y
   * los documentos oficiales: limpiar el navegador dejaría el cambio vivo para
   * el resto del mundo. Sin backend se limpia el almacenamiento local.
   */
  async restaurarTodo(): Promise<void> {
    this.restaurando.set(true);
    try {
      await this.contenido.resetAll();
      if (this.remoto) {
        for (const mod of MODULO_META) {
          await this.documentos.restaurarModulo(mod.id);
        }
      } else {
        this.personal.reset();
        this.noticias.reset();
        await this.documentos.reset();
        await this.archivos.vaciar();
      }
      this.confirmar.set(false);
      this.toast.success('El portal volvió al contenido original.');
    } catch {
      this.toast.error('No se pudo restaurar todo el contenido.');
    } finally {
      this.restaurando.set(false);
    }
  }
}
