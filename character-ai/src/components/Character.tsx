import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";

import {
  BASE_SHAPE_PARAMETERS,
  type ShapeParameters,
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

type Props = object;

const INITIAL_SHAPE_PARAMETERS: ShapeParameters = {
  ...BASE_SHAPE_PARAMETERS,
};

const STATE_MACHINE = "State Machine 1";

const Character =
  forwardRef<CharacterController, Props>(
    function Character(
      _props,
      ref
    ) {
      const { rive, RiveComponent } = useRive({
        src: "/rive/prove1.riv",
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

      const { setValue: setShapeRoundness } =
        useViewModelInstanceNumber(
        "shapeRoundness",
        viewModelInstance
      );
      const { setValue: setShapeBulge } =
        useViewModelInstanceNumber(
        "shapeBulge",
        viewModelInstance
      );
      const { setValue: setShapeTaper } =
        useViewModelInstanceNumber(
        "shapeTaper",
        viewModelInstance
      );
      const { setValue: setShapeAsymmetry } =
        useViewModelInstanceNumber(
        "shapeAsymmetry",
        viewModelInstance
      );
      const { setValue: setShapeType } =
        useViewModelInstanceNumber(
        "shapeType",
        viewModelInstance
      );
      const { setValue: setShapePressed } =
        useViewModelInstanceNumber(
        "shapePressed",
        viewModelInstance
      );

      const [shapeParameters, setShapeParameters] =
        useState(INITIAL_SHAPE_PARAMETERS);

      const writeRiveShapeParameters = useCallback(
        (parameters: ShapeParameters) => {
          setShapeWidth(parameters.shapeWidth);
          setShapeHeight(parameters.shapeHeight);
          setShapeSharpness(parameters.shapeSharpness);
          setShapeRoundness(parameters.shapeRoundness);
          setShapeBulge(parameters.shapeBulge);
          setShapeTaper(parameters.shapeTaper);
          setShapeAsymmetry(parameters.shapeAsymmetry);
          setShapeType(parameters.shapeType);
          setShapeParameters(parameters);
        },
        [
          setShapeWidth,
          setShapeHeight,
          setShapeSharpness,
          setShapeRoundness,
          setShapeBulge,
          setShapeTaper,
          setShapeAsymmetry,
          setShapeType,
        ]
      );

      const writeShapeParameters = useCallback(
        (parameters: ShapeParameters) => {
          writeRiveShapeParameters(parameters);
          setShapeParameters(parameters);
        },
        [writeRiveShapeParameters]
      );

      const applyShapeParameters = useCallback(
        async (parameters: ShapeParameters) => {
          writeShapeParameters(parameters);
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          setShapePressed(1);
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
          });
          setShapePressed(0);
        },
        [writeShapeParameters, setShapePressed]
      );

      const updateShapeParameter = (
        parameter:
          | "shapeWidth"
          | "shapeHeight"
          | "shapeSharpness",
        value: string
      ) => {
        const numericValue = Number(value);

        writeShapeParameters({
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
            await applyShapeParameters(
              BASE_SHAPE_PARAMETERS
            );
          },
          [
            character,
            applyShapeParameters,
          ]
        );

      // The Rive ViewModel is available after mount, so synchronize its
      // initial values on the next animation frame.
      useEffect(() => {
        const frameId = requestAnimationFrame(() => {
          writeRiveShapeParameters(
            INITIAL_SHAPE_PARAMETERS
          );
          setShapePressed(0);
        });

        return () => cancelAnimationFrame(frameId);
      }, [
        writeRiveShapeParameters,
        setShapePressed,
      ]);

      useImperativeHandle(
        ref,
        () => ({
          ...character,
          sequence: sequenceWithShapeReset,
          applyShapeParameters,
        }),
        [
          character,
          sequenceWithShapeReset,
          applyShapeParameters,
        ]
      );

      return (
        <div
          className="character-orbit"
          aria-label="JEV, personaje animado interactivo"
        >
          <RiveComponent />

          <div
            className="character-controls-preview"
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
              Width: {shapeParameters.shapeWidth}
              <input
                type="range"
                min="50"
                max="150"
                value={shapeParameters.shapeWidth}
                onChange={(event) =>
                  updateShapeParameter(
                    "shapeWidth",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Height: {shapeParameters.shapeHeight}
              <input
                type="range"
                min="50"
                max="150"
                value={shapeParameters.shapeHeight}
                onChange={(event) =>
                  updateShapeParameter(
                    "shapeHeight",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Sharpness: {shapeParameters.shapeSharpness}
              <input
                type="range"
                min="0"
                max="100"
                value={shapeParameters.shapeSharpness}
                onChange={(event) =>
                  updateShapeParameter(
                    "shapeSharpness",
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
