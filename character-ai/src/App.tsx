import { useRef } from "react";
import Character from "./components/Character";
import Chat from "./components/Chat";
import {
  GearIcon,
  SparkleIcon,
  TrashIcon,
} from "./components/UiIcons";
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
          </div>

          <div className="character-stage">
            <Character ref={characterRef} />
          </div>
        </section>

        <section className="conversation-panel" aria-labelledby="conversation-title">
          <header className="conversation-panel__header">
            <div className="conversation-panel__title-row">
              <h2 className="eyebrow" id="conversation-title">
                Conversación
              </h2>

              <div className="conversation-tools" aria-hidden="true">
                <span className="conversation-tool">
                  <TrashIcon size={18} />
                </span>
                <span className="conversation-tool">
                  <SparkleIcon size={18} />
                </span>
                <span className="conversation-tool">
                  <GearIcon size={18} />
                </span>
              </div>
            </div>
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
