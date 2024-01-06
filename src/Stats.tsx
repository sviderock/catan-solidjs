import { Portal } from "solid-js/web";
import { Limit } from "./constants";

type Props = Game & {
  points: number;
};

export default function Stats(props: Props) {
  return (
    <Portal>
      <div class="fixed left-0 top-0 flex flex-col gap-2 bg-blue-100 p-2 text-[1rem] font-bold">
        <span>
          Roads: {props.roads} ({Limit.Roads - props.roads} left)
        </span>
        <span>
          Settlements: {props.settlements} ({Limit.Settlements - props.settlements} left)
        </span>
        <span>
          Cities: {props.cities} ({Limit.Cities - props.cities} left)
        </span>
        <span>Points: {props.points} points</span>
      </div>
    </Portal>
  );
}
