import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { FaRegularChessKnight, FaRegularMap } from "solid-icons/fa";
import { ImRoad } from "solid-icons/im";
import { TbCarCrane } from "solid-icons/tb";
import { splitProps, type ComponentProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

const DevelopmentCardTypes: Record<
  PlayableDevelopmentCard["type"],
  { label: string; description: () => JSX.Element; icon: () => JSX.Element }
> = {
  knight: {
    label: "Knight",
    icon: () => <FaRegularChessKnight />,
    description: () => (
      <>
        <p>Move the robber.</p>
        <p>
          Steal <strong>1</strong> resource from the owner of a settlement or city adjacent to the
          robber's nex hex.
        </p>
      </>
    ),
  },
  monopoly: {
    label: "Monopoly",
    icon: () => <FaRegularMap class="text-3xl" />,
    description: () => (
      <p>
        When you play this card, announce <strong>1 type</strong> of resource. All other players
        must give you <strong>all</strong> of their resources of that type.
      </p>
    ),
  },
  year_of_plenty: {
    label: "Year Of Plenty",
    icon: () => <TbCarCrane class="text-3xl" />,
    description: () => (
      <p>
        Take any <strong>2</strong> resources from the bank. Add them to your hand. They can be 2 of
        the same resource or 2 different resources.
      </p>
    ),
  },
  road_building: {
    label: "Road Building",
    icon: () => <ImRoad class="text-3xl" />,
    description: () => (
      <p>
        Place <strong>2</strong> new roads as if you had just built them.
      </p>
    ),
  },
};

interface Props extends ComponentProps<"button"> {
  cardType: PlayableDevelopmentCard["type"];
  statusCount: Record<DevelopmentCardStatus, number>;
}
export default function DevelopmentCard(props: Props) {
  const [, rest] = splitProps(props, ["cardType", "statusCount", "class"]);
  return (
    <Tooltip placement="top-end">
      <TooltipTrigger
        as={Button}
        class={cn(
          "relative flex h-[150px] w-[100px] flex-col items-center justify-between gap-2 border border-white px-2",
          props.class
        )}
        {...rest}
      >
        <div class="flex w-full flex-col items-center gap-2">
          <span class="text-3xl">
            <Dynamic component={DevelopmentCardTypes[props.cardType].icon} />
          </span>
          {DevelopmentCardTypes[props.cardType].label}
        </div>

        <div class="flex w-full flex-col gap-1">
          <p
            class={cn(
              "flex justify-between text-sm leading-none",
              !props.statusCount.played && "opacity-50"
            )}
          >
            Played: <span>{props.statusCount.played}</span>
          </p>
          <p
            class={cn(
              "flex justify-between text-sm leading-none",
              !props.statusCount.available && "opacity-50"
            )}
          >
            Available:{" "}
            <span class={cn(props.statusCount.available && "text-green-500")}>
              {props.statusCount.available}
            </span>
          </p>
          <p
            class={cn(
              "flex justify-between text-sm leading-none",
              !props.statusCount.ready_next_turn && "opacity-50"
            )}
          >
            Next Turn: <span>{props.statusCount.ready_next_turn}</span>
          </p>
        </div>
      </TooltipTrigger>

      <TooltipContent class="max-w-64 text-sm">
        <Dynamic component={DevelopmentCardTypes[props.cardType].description} />
      </TooltipContent>
    </Tooltip>
  );
}
