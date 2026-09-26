import { useRef } from "react";
import Character from "./components/Character";
import Chat from "./components/Chat";
import "./App.css";

import type {
  CharacterController,
} from "./character/useCharacterController";

export default function App() {
  const characterRef =
    useRef<CharacterController | null>(
      null
    );

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <a className="brand-lockup" href="/" aria-label="JEV, inicio">
          <span className="brand-mark" aria-hidden="true">
            je
          </span>
          <span>
            <span className="brand-name">JEV</span>
            <span className="brand-caption"> / compañero digital</span>
          </span>
        </a>

        <span className="topbar-status">
          <span className="status-dot" aria-hidden="true" />
          En vivo
        </span>
      </header>

      <div className="workspace">
        <section className="character-panel" aria-labelledby="character-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Tu compañero está aquí</p>
              <h1 id="character-title">JEV</h1>
              <p className="panel-description">
                Háblale. Observa cómo piensa, responde y cambia de forma.
              </p>
            </div>

            <span className="live-pill">
              <span className="status-dot" aria-hidden="true" />
              Activo
            </span>
          </div>

          <div className="character-stage">
            <Character ref={characterRef} />
          </div>
        </section>

        <section className="conversation-panel" aria-labelledby="conversation-title">
          <header className="conversation-panel__header">
            <p className="eyebrow">Conversación</p>
            <h2 id="conversation-title">Habla con JEV</h2>
            <p className="panel-description">
              Escribe algo y deja que JEV encuentre una respuesta propia.
            </p>
          </header>

          <Chat
            characterRef={characterRef}
            className="chat-surface"
          />
        </section>
      </div>
    </main>
  );
}
