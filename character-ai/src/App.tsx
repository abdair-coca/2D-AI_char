import { useRef } from "react";
import Character from "./components/Character";
import Chat from "./components/Chat";

import type {
  CharacterController,
} from "./character/useCharacterController";

export default function App() {
  const characterRef =
    useRef<CharacterController | null>(
      null
    );

  return (
    <main
      style={{
        minHeight: "100vh",

        display: "flex",
        flexDirection: "column",

        justifyContent: "center",
        alignItems: "center",

        padding: 24,
      }}
    >
      <Character
        ref={characterRef}
      />

      <Chat
        characterRef={characterRef}
      />
    </main>
  );
}
