import { For, Match, Switch, createSignal, onMount, type Ref, batch } from "solid-js";
import Hexagon from "./Hexagon";
import { matches } from "./utils";
import { calculateRoad } from "./utils/calculateRoad";
import { getInitialState } from "./utils/state";
import { calculateHex } from "./utils/calculateHex";
import { calculateTown } from "./utils/calculateTown";

export default function Board() {
  const refs = {} as Record<Hex["id"] | Structure["id"], HTMLDivElement | undefined>;
  const [state] = createSignal(getInitialState());

  onMount(() => {
    console.log(state());
    console.time("calculations");
    state().hexes.array.forEach((hex) => {
      const calc = calculateHex(refs[hex.id]!);
      hex.setCalc(calc);
    });

    state().structures.array.forEach((structure) => {
      switch (structure.type) {
        case "town": {
          const pos = calculateTown(structure, refs[structure.id]!);
          structure.setPos(pos);
          break;
        }

        case "road": {
          const pos = calculateRoad(structure, refs[structure.id]!);
          structure.setPos(pos);
          break;
        }
      }
    });
    console.timeEnd("calculations");
  });

  return (
    <div class="relative flex scale-150 flex-col flex-wrap items-center justify-center gap-1">
      <For each={state().hexes.layout}>
        {(hexRow) => (
          <div class="my-[-15px] flex gap-1">
            <For each={hexRow}>
              {(hex) => (
                <Hexagon
                  {...hex}
                  ref={(ref) => {
                    refs[hex.id] = ref;
                    ref!.dataset.id = hex.id;
                  }}
                  onNeighbourHover={(id, hovered) => state().hexes.byId[id]!.setHovered(hovered)}
                />
              )}
            </For>
          </div>
        )}
      </For>

      <For each={state().structures.array}>
        {(structure) => (
          <Switch>
            <Match when={matches(structure, (s): s is Town => s.type === "town")}>
              {(town) => (
                <Town
                  {...town()}
                  ref={(ref) => {
                    ref.dataset.id = town().id;
                    refs[town().id] = ref;
                  }}
                />
              )}
            </Match>
            <Match when={matches(structure, (s): s is Road => s.type === "road")}>
              {(road) => (
                <Road
                  {...road()}
                  ref={(ref) => {
                    ref.dataset.id = road().id;
                    refs[road().id] = ref;
                  }}
                />
              )}
            </Match>
          </Switch>
        )}
      </For>
    </div>
  );
}

function Town(props: Town & { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={props.ref}
      class="absolute h-[20px] w-[20px] cursor-pointer rounded-full border-2 transition hover:scale-110"
      classList={{
        "bg-green-300 border-green-900": !props.active() && !props.disabled(),
        "bg-indigo-500 border-indigo-900": props.active(),
        "bg-red-600 border-red-900 cursor-not-allowed": props.disabled()
      }}
      style={{ top: `${props.pos().y}px`, left: `${props.pos().x}px` }}
      onMouseOver={() => {
        if (props.disabled()) return;
        props.hexes.forEach(({ hex }) => hex.setHovered(true));
      }}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
      onClick={() => {
        if (props.disabled() || props.active()) return;

        batch(() => {
          props.setActive(true);
          props.closestTowns.forEach((town) => town.setDisabled(true));
        });
      }}
    />
  );
}

function Road(props: Road & { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={props.ref}
      class="absolute h-[10px] w-[30px] cursor-pointer rounded-sm border-2  transition hover:scale-110"
      style={{
        top: `${props.pos().y}px`,
        left: `${props.pos().x}px`,
        rotate: `${props.pos().angle}deg`
      }}
      classList={{
        "border-green-900 bg-green-100": !props.active(),
        "bg-indigo-300 border-indigo-500": props.active()
      }}
      onMouseOver={() => props.hexes.forEach(({ hex }) => hex.setHovered(true))}
      onMouseOut={() => props.hexes.forEach(({ hex }) => hex.setHovered(false))}
      onClick={() => {
        if (props.active()) return;
        props.setActive(true);
      }}
    />
  );
}
