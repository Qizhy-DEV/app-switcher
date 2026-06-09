import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { AppItem } from './types'

@customElement('app-popover')
export class AppPopover extends LitElement {
  @property({ type: Array }) apps: AppItem[] = []
  @property({ type: String }) title = ''
  @property({ type: Boolean }) loading = false
  @property({ type: Boolean }) error = false
  @property({ type: String }) target = '_blank'
  @property({ type: String }) currentOrigin = ''

  static readonly styles = css`
    :host {
      display: block;
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 9999;
    }
    .popover {
      background: var(--as-bg, #1e293b);
      border: 1px solid var(--as-border, #334155);
      border-radius: 12px;
      padding: 14px;
      min-width: 220px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .title {
      font-size: 10px;
      color: var(--as-text, #94a3b8);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0 0 10px;
    }
    .grid,
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
    }
    .app-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 2px;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s;
    }
    .app-item:hover { background: rgba(255,255,255,0.07); }
    .app-item.current { background: rgba(99,102,241,0.15); }
    .app-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      object-fit: cover;
    }
    .app-name {
      font-size: 9px;
      color: var(--as-text, #94a3b8);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 52px;
    }
    .skeleton-title {
      height: 10px;
      background: var(--as-border, #334155);
      border-radius: 4px;
      width: 60%;
      margin-bottom: 12px;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px 2px;
    }
    .skeleton-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--as-border, #334155);
      animation: shimmer 1.5s infinite;
    }
    .skeleton-label {
      height: 6px;
      background: var(--as-border, #334155);
      border-radius: 3px;
      width: 80%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 0;
    }
    .error-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(239,68,68,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .error-message {
      font-size: 10px;
      color: var(--as-text, #94a3b8);
      text-align: center;
      margin: 0;
    }
    .retry-btn {
      font-size: 10px;
      color: var(--as-accent, #6366f1);
      background: none;
      border: 1px solid var(--as-accent, #6366f1);
      border-radius: 6px;
      padding: 4px 12px;
      cursor: pointer;
    }
  `

  render() {
    let content
    if (this.loading) {
      content = this._renderSkeleton()
    } else if (this.error) {
      content = this._renderError()
    } else {
      content = this._renderApps()
    }
    return html`<div class="popover">${content}</div>`
  }

  private _renderSkeleton() {
    return html`
      <div class="skeleton-title"></div>
      <div class="skeleton-grid">
        ${Array.from({ length: 8 }, () => html`
          <div class="skeleton-cell">
            <div class="skeleton-icon"></div>
            <div class="skeleton-label"></div>
          </div>
        `)}
      </div>
    `
  }

  private _renderError() {
    return html`
      <div class="error-state">
        <div class="error-icon">&#9888;</div>
        <p class="error-message">Kh&#244;ng th&#7875; t&#7843;i danh s&#225;ch app</p>
        <button class="retry-btn" @click=${this._handleRetry}>Th&#7917; l&#7841;i</button>
      </div>
    `
  }

  private _renderApps() {
    return html`
      <p class="title">${this.title}</p>
      <div class="grid">
        ${this.apps.map(app => {
          let isCurrent = false
          try {
            isCurrent = !!this.currentOrigin && new URL(app.url).origin === this.currentOrigin
          } catch { /* ignore malformed URLs */ }
          return html`
            <a
              class="app-item ${isCurrent ? 'current' : ''}"
              href=${app.url}
              target=${this.target}
              rel="noopener noreferrer"
              title=${app.name}
            >
              <img class="app-icon" src=${app.icon} alt=${app.name} />
              <span class="app-name">${app.name}</span>
            </a>
          `
        })}
      </div>
    `
  }

  private _handleRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }))
  }
}
