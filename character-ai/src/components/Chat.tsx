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

type Message = {
  role: "user" | "character";
  content: string;
};

type Props = {
  characterRef:
  RefObject<CharacterController | null>;
};

const wait = (ms: number) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, ms)
  );

export default function Chat({
  characterRef,
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
    <div
      style={{
        width: "100%",
        maxWidth: 500,
      }}
    >
      <div
        style={{
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {messages.map(
          (message, index) => (
            <div
              key={index}
              style={{
                alignSelf:
                  message.role === "user"
                    ? "flex-end"
                    : "flex-start",

                padding: "10px 14px",
                borderRadius: 16,

                background:
                  message.role === "user"
                    ? "#222"
                    : "#eee",

                color:
                  message.role === "user"
                    ? "white"
                    : "#222",
              }}
            >
              {message.content}
            </div>
          )
        )}

        {loading && (
          <div
            style={{
              opacity: 0.5,
            }}
          >
            Pensando...
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          gap: 10,
        }}
      >
        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Dile algo..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={loading}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
