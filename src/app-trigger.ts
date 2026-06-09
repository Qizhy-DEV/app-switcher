import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-trigger')
export class AppTrigger extends LitElement {
  @property({ type: Boolean }) active = false

  static styles = css`
    :host { display: inline-block; }
    button {
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      grid-template-columns: repeat(3, 5px);
      gap: 3px;
      align-items: center;
      justify-items: center;
      padding: 8px;
      box-sizing: border-box;
      transition: background 0.15s;
    }
    button:hover {
      background: rgba(99, 102, 241, 0.15);
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.15);
    }
    button.active {
      background: rgba(99, 102, 241, 0.25);
      background: rgba(var(--as-accent-rgb, 99 102 241) / 0.25);
      outline: 2px solid rgba(99, 102, 241, 0.4);
      outline-offset: 1px;
    }
    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #94a3b8;
      transition: background 0.15s;
    }
    button:hover .dot,
    button.active .dot {
      background: var(--as-accent, #6366f1);
    }
  `

  render() {
    return html`
      <button
        class=${this.active ? 'active' : ''}
        aria-label="App switcher"
        aria-expanded=${String(this.active)}
        @click=${this._handleClick}
      >
        ${Array.from({ length: 9 }, () => html`<span class="dot"></span>`)}
      </button>
    `
  }

  private _handleClick() {
    this.dispatchEvent(new CustomEvent('trigger-click', { bubbles: true, composed: true }))
  }
}
