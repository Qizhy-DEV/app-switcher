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
      top: calc(100% + 10px);
      right: 0;
      z-index: 9999;
    }
    .popover {
      background: var(--as-bg, #ffffff);
      border: 1px solid var(--as-border, #e2e8f0);
      border-radius: 16px;
      padding: 16px;
      min-width: 268px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 16px 40px -4px rgba(0,0,0,0.12);
      animation: popover-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top right;
    }
    @keyframes popover-in {
      from {
        opacity: 0;
        transform: scale(0.94) translateY(-6px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .popover { animation: none; }
    }
    .title {
      font-size: 10px;
      color: var(--as-text, #94a3b8);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 0 0 12px 2px;
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
      gap: 6px;
      padding: 10px 4px 8px;
      border-radius: 10px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s ease;
      position: relative;
    }
    .app-item:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .app-item:hover .app-icon {
      transform: scale(1.08);
    }
    .app-item.current {
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.08);
    }
    .app-item.current::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--as-accent, #6366f1);
    }
    .app-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      object-fit: cover;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .app-name {
      font-size: 10px;
      color: var(--as-text, #475569);
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 56px;
      font-weight: 500;
    }
    /* Skeleton */
    .skeleton-title {
      height: 10px;
      background: var(--as-border, #e2e8f0);
      border-radius: 4px;
      width: 50%;
      margin-bottom: 14px;
      animation: shimmer 1.6s ease-in-out infinite;
    }
    .skeleton-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px 4px 8px;
    }
    .skeleton-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--as-border, #e2e8f0);
      animation: shimmer 1.6s ease-in-out infinite;
    }
    .skeleton-label {
      height: 7px;
      background: var(--as-border, #e2e8f0);
      border-radius: 3px;
      width: 75%;
      animation: shimmer 1.6s ease-in-out infinite;
    }
    .skeleton-cell:nth-child(2) .skeleton-icon,
    .skeleton-cell:nth-child(2) .skeleton-label { animation-delay: 0.1s; }
    .skeleton-cell:nth-child(3) .skeleton-icon,
    .skeleton-cell:nth-child(3) .skeleton-label { animation-delay: 0.2s; }
    .skeleton-cell:nth-child(4) .skeleton-icon,
    .skeleton-cell:nth-child(4) .skeleton-label { animation-delay: 0.3s; }
    @keyframes shimmer {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.45; }
    }
    /* Error state */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 16px 0 8px;
    }
    .error-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
    }
    .error-icon svg { width: 20px; height: 20px; }
    .error-message {
      font-size: 11px;
      color: var(--as-text, #475569);
      text-align: center;
      margin: 0;
      font-weight: 500;
    }
    .retry-btn {
      font-size: 11px;
      font-weight: 600;
      color: var(--as-accent, #6366f1);
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.08);
      border: none;
      border-radius: 8px;
      padding: 6px 16px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .retry-btn:hover {
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.15);
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
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="error-message">Không thể tải danh sách app</p>
        <button class="retry-btn" @click=${this._handleRetry}>Thử lại</button>
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
