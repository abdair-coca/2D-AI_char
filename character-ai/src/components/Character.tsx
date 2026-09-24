import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useState,
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
  useViewModelInstanceNumber,
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

type ShapeParameters = {
  width: number;
  height: number;
  sharpness: number;
};

const INITIAL_SHAPE_PARAMETERS: ShapeParameters = {
  width: 100,
  height: 100,
  sharpness: 0,
};

const BASE_SHAPE_PARAMETERS: ShapeParameters = {
  width: 100,
  height: 100,
  sharpness: 0,
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
        shouldDisableRiveListeners: false,

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
      const { setValue: setShapeWidth } =
        useViewModelInstanceNumber(
        "shapeWidth",
        viewModelInstance
      );
      const { setValue: setShapeHeight } =
        useViewModelInstanceNumber(
        "shapeHeight",
        viewModelInstance
      );
      const {
        setValue: setShapeSharpness,
      } = useViewModelInstanceNumber(
        "shapeSharpness",
        viewModelInstance
      );

      const [shapeParameters, setShapeParameters] =
        useState(INITIAL_SHAPE_PARAMETERS);

      const applyShapeParameters = useCallback(
        (parameters: ShapeParameters) => {
          setShapeWidth(parameters.width);
          setShapeHeight(parameters.height);
          setShapeSharpness(parameters.sharpness);
          setShapeParameters(parameters);
        },
        [
          setShapeWidth,
          setShapeHeight,
          setShapeSharpness,
        ]
      );

      const updateShapeParameter = (
        parameter: "width" | "height" | "sharpness",
        value: string
      ) => {
        const numericValue = Number(value);

        applyShapeParameters({
          ...shapeParameters,
          [parameter]: numericValue,
        });
      };

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

      const sequenceWithShapeReset =
        useCallback(
          async (
            steps: Parameters<
              CharacterController["sequence"]
            >[0]
          ) => {
            await character.sequence(steps);
            applyShapeParameters(BASE_SHAPE_PARAMETERS);
          },
          [
            character,
            applyShapeParameters,
          ]
        );

      useEffect(() => {
        setShapeWidth(
          INITIAL_SHAPE_PARAMETERS.width
        );
        setShapeHeight(
          INITIAL_SHAPE_PARAMETERS.height
        );
        setShapeSharpness(
          INITIAL_SHAPE_PARAMETERS.sharpness
        );
      }, [
        setShapeWidth,
        setShapeHeight,
        setShapeSharpness,
      ]);

      useImperativeHandle(
        ref,
        () => ({
          ...character,
          sequence: sequenceWithShapeReset,
        }),
        [character, sequenceWithShapeReset]
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

          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 12,
              zIndex: 2,
              padding: 10,
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.9)",
              display: "grid",
              gap: 6,
            }}
          >
            <label>
              Width: {shapeParameters.width}
              <input
                type="range"
                min="50"
                max="150"
                value={shapeParameters.width}
                onChange={(event) =>
                  updateShapeParameter(
                    "width",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Height: {shapeParameters.height}
              <input
                type="range"
                min="50"
                max="150"
                value={shapeParameters.height}
                onChange={(event) =>
                  updateShapeParameter(
                    "height",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Sharpness: {shapeParameters.sharpness}
              <input
                type="range"
                min="0"
                max="100"
                value={shapeParameters.sharpness}
                onChange={(event) =>
                  updateShapeParameter(
                    "sharpness",
                    event.target.value
                  )
                }
              />
            </label>
          </div>
        </div>
      );
    }
  );

export default Character;
