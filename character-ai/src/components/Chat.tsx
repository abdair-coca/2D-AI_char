import {
  useState,
  type FormEvent,
  type RefObject,
} from "react";

import type {
  CharacterController,
  CharacterState,
} from "../character/useCharacterController";

import {
  getMockReply,
} from "../data/mockResponses";

import {
  decideJevAction,
} from "../ia/decideJevAction";

import {
  createShape,
} from "../ia/createShape";

import {
  ChatBubbleIcon,
  PaperclipIcon,
  SendIcon,
} from "./UiIcons";

type Message = {
  role: "user" | "character";
  content: string;
};

type Props = {
  characterRef:
  RefObject<CharacterController | null>;
  className?: string;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, ms)
  );

export default function Chat({
  characterRef,
  className,
}: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  const sendMessage = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    setInput("");
    setLoading(true);

    // Mensaje del usuario
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    try {
      // Personaje pensando mientras se resuelven las decisiones.
      await characterRef.current?.play("think");

      // Simulamos latencia del futuro LLM.
      await wait(1500);

      const decision =
        await decideJevAction(text);

      const reply = getMockReply(text);

      setMessages((current) => [
        ...current,
        {
          role: "character",
          content: reply.message,
        },
      ]);

      const talkDuration = Math.max(
        1200,
        Math.min(
          3500,
          reply.message.length * 45
        )
      );
      const steps: {
        state: CharacterState;
        duration: number;
      }[] = [];

      if (decision === "create_new") {
        const parameters =
          await createShape(text);

        await characterRef.current?.applyShapeParameters(
          parameters
        );
      } else {
        steps.push({
          state: decision,
          duration: 1200,
        });
      }

      if (reply.reaction && decision === "create_new") {
        steps.push({
          state: reply.reaction,
          duration: 900,
        });
      }

      steps.push({
        state: "Talk",
        duration: talkDuration,
      });

      await characterRef.current?.sequence(steps);
    } catch (error) {
      console.error("JEV interaction failed:", error);
      setMessages((current) => [
        ...current,
        {
          role: "character",
          content: "No pude completar esa interacción.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="chat-log" aria-live="polite">
        {messages.length === 0 && !loading && (
          <div className="chat-empty-state">
            <span className="chat-empty-icon">
              <ChatBubbleIcon size={64} />
            </span>
            <h3>Habla con JEV</h3>
            <p>Escribe algo y deja que JEV encuentre una respuesta propia.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            className={`chat-message chat-message--${message.role}`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div className="chat-status">
            <span className="typing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            JEV está pensando...
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={sendMessage}>
        <span className="composer-leading-icon" aria-hidden="true">
          <PaperclipIcon size={23} />
        </span>
        <input
          aria-label="Mensaje para JEV"
          className="chat-input"
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Dile algo..."
          disabled={loading}
        />

        <button
          aria-label="Enviar mensaje"
          className="send-button"
          type="submit"
          disabled={loading}
        >
          <SendIcon size={24} />
        </button>
      </form>
    </div>
  );
}
