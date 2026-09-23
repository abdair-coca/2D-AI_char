import {
  forwardRef,
  useImperativeHandle,
} from "react";

import type {
  ShapeSpec,
} from "../types/shape";

import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceEnum,
  useViewModelInstanceTrigger,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-webgl2";

import {
  useCharacterController,
  type CharacterController,
} from "../character/useCharacterController";

import DynamicShape from "./DynamicShape";

type Props = {
  dynamicShape: ShapeSpec | null;
};

const STATE_MACHINE = "State Machine 1";

const Character =
  forwardRef<CharacterController, Props>(
    function Character(
      { dynamicShape },
      ref
    ) {
      const { rive, RiveComponent } = useRive({
        src: "/rive/prove.riv",
        stateMachines: STATE_MACHINE,
        autoplay: true,
        autoBind: false,

        layout: new Layout({
          fit: Fit.Contain,
          alignment: Alignment.Center,
        }),
      });

      const viewModel = useViewModel(rive, {
        name: "ViewModel1",
      });

      const viewModelInstance =
        useViewModelInstance(viewModel, {
          useDefault: true,
          rive,
        });

      const { setValue: setState } =
        useViewModelInstanceEnum(
          "state",
          viewModelInstance
        );

      const { trigger: triggerState } =
        useViewModelInstanceTrigger(
          "trigState",
          viewModelInstance
        );

      const character =
        useCharacterController(
          setState,
          triggerState
        );

      useImperativeHandle(
        ref,
        () => character,
        [character]
      );

      return (
        <div
          style={{
            width: "500px",
            height: "500px",
            position: "relative",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <RiveComponent />

          <DynamicShape
            shape={dynamicShape}
          />
        </div>
      );
    }
  );

export default Character;