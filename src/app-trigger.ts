import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('app-trigger')
export class AppTrigger extends LitElement {
  @property({ type: Boolean }) active = false

  static styles = css`
    :host { display: inline-block; }
    button {
      width: 34px;
      height: 34px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      display: grid;
      grid-template-columns: repeat(3, 5px);
      grid-template-rows: repeat(3, 5px);
      gap: 3px;
      place-content: center;
      place-items: center;
      padding: 0;
      box-sizing: border-box;
      transition: background 0.2s ease;
      outline: none;
    }
    button:hover {
      background: rgba(var(--hds-accent-rgb, 99 102 241) / 0.1);
    }
    button:focus-visible {
      outline: 2px solid var(--hds-accent, #6366f1);
      outline-offset: 2px;
    }
    button.active {
      background: rgba(var(--hds-accent-rgb, 99 102 241) / 0.12);
    }
    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #94a3b8;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    button:hover .dot {
      background: var(--hds-accent, #6366f1);
    }
    button.active .dot {
      background: var(--hds-accent, #6366f1);
      transform: scale(1.15);
    }
  `

  render() {
    return html`
      <button
        class=${this.active ? 'active' : ''}
        aria-label="App switcher"
        aria-expanded=${String(this.active)}
        aria-haspopup="true"
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
