import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { AppService } from './app-service'
import type { AppConfig } from './types'
import './app-trigger'
import './app-popover'

@customElement('app-switcher')
export class AppSwitcher extends LitElement {
  @property({ type: String, attribute: 'config-url' }) configUrl = ''
  @property({ type: String }) target = '_blank'
  @property({ type: String }) theme = 'light'

  @state() private _open = false
  @state() private _loading = false
  @state() private _error = false
  @state() private _config: AppConfig | null = null

  private _service!: AppService
  private _boundClose!: (e: PointerEvent) => void
  private _boundKeydown!: (e: KeyboardEvent) => void

  connectedCallback() {
    super.connectedCallback()
    this._service = new AppService(this.configUrl || undefined)
    this._load()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._removeGlobalListeners()
  }

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      font-size: 14px;
      line-height: 1.5;
    }
  `

  render() {
    return html`
      <app-trigger
        .active=${this._open}
        @trigger-click=${this._handleTrigger}
      ></app-trigger>
      ${this._open ? html`
        <app-popover
          .apps=${this._config?.apps ?? []}
          .title=${this._config?.title ?? ''}
          .loading=${this._loading}
          .error=${this._error}
          .target=${this.target}
          .currentOrigin=${window.location.origin}
          @retry=${this._handleRetry}
        ></app-popover>
      ` : ''}
    `
  }

  private async _load() {
    this._loading = true
    this._error = false
    try {
      this._config = await this._service.getApps()
    } catch {
      this._error = true
    } finally {
      this._loading = false
    }
  }

  private _handleTrigger() {
    this._open = !this._open
    if (this._open) {
      this._addGlobalListeners()
    } else {
      this._removeGlobalListeners()
    }
  }

  private _handleRetry() {
    this._service.invalidate()
    this._load()
  }

  private _addGlobalListeners() {
    this._boundClose = (e: PointerEvent) => {
      if (!this.contains(e.target as Node)) {
        this._open = false
        this._removeGlobalListeners()
      }
    }
    this._boundKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this._open = false
        this._removeGlobalListeners()
        const btn = this.shadowRoot
          ?.querySelector('app-trigger')
          ?.shadowRoot?.querySelector('button')
        btn?.focus()
      }
    }
    document.addEventListener('pointerdown', this._boundClose)
    document.addEventListener('keydown', this._boundKeydown)
  }

  private _removeGlobalListeners() {
    if (this._boundClose) document.removeEventListener('pointerdown', this._boundClose)
    if (this._boundKeydown) document.removeEventListener('keydown', this._boundKeydown)
  }
}
