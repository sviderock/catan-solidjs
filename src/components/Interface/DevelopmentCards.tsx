import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buyDevelopmentCard, currentPlayer, haveResourcesFor } from "@/state";
import { cn } from "@/utils";
import { As } from "@kobalte/core";
import { FaRegularChessKnight, FaRegularMap } from "solid-icons/fa";
import { ImCoinDollar, ImRoad } from "solid-icons/im";
import { SiOneplus } from "solid-icons/si";
import { TbCarCrane } from "solid-icons/tb";
import { For, createMemo, splitProps, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

export default function DevelopmentCards() {
  const cards = createMemo(() =>
    //@ts-ignore because for some reason Object.groupBy is not yet recognized by esnext
    Object.groupBy(currentPlayer().developmentCards(), (item) => item.status)
  );

  return (
    <div class="flex h-full flex-col gap-4 justify-self-end">
      <h3>Development cards</h3>

      <div class="grid max-h-[196px] auto-rows-[60px] grid-cols-2 gap-2 overflow-auto">
        <For each={currentPlayer().developmentCards()}>{(card) => <DevelopmentCard card={card} />}</For>
      </div>
    </div>
  );
}

const DevelopmentCardTypes: Record<
  DevelopmentCard,
  { label: string; description: () => JSX.Element; icon: () => JSX.Element }
> = {
  knight: {
    label: "Knight",
    icon: () => <FaRegularChessKnight class="text-3xl" />,
    description: () => (
      <>
        <p>Move the robber.</p>
        <p>
          Steal <strong>1</strong> resource from the owner of a settlement or city adjacent to the
          robber's nex hex.
        </p>
      </>
    )
  },
  victory_point: {
    label: "Victory Point",
    icon: () => <SiOneplus class="text-3xl" />,
    description: () => (
      <p>
        Reveal this card on your turn if, with it, you reach the number of points required for victory.
      </p>
    )
  },
  monopoly: {
    label: "Monopoly",
    icon: () => <FaRegularMap class="text-3xl" />,
    description: () => (
      <p>
        When you play this card, announce <strong>1 type</strong> of resource. All other players must
        give you <strong>all</strong> of their resources of that type.
      </p>
    )
  },
  year_of_plenty: {
    label: "Year Of Plenty",
    icon: () => <TbCarCrane class="text-3xl" />,
    description: () => (
      <p>
        Take any <strong>2</strong> resources from the bank. Add them to your hand. They can be 2 of the
        same resource or 2 different resources.
      </p>
    )
  },
  road_building: {
    label: "Road Building",
    icon: () => <ImRoad class="text-3xl" />,
    description: () => (
      <p>
        Place <strong>2</strong> new roads as if you had just built them.
      </p>
    )
  }
};

function DevelopmentCard(props: { card: PlayerDevelopmentCard } & ButtonProps) {
  const [, rest] = splitProps(props, ["card", "class"]);
  return (
    <Tooltip placement="top-end">
      <TooltipTrigger asChild>
        <As
          component={Button}
          class={cn("flex h-full items-center justify-center gap-2 border border-white", props.class)}
          {...rest}
        >
          <Dynamic component={DevelopmentCardTypes[props.card.type].icon} />
          {DevelopmentCardTypes[props.card.type].label}
        </As>
      </TooltipTrigger>

      <TooltipContent
        class="max-w-64 text-sm"
        onMouseOver={(e) => {
          console.log(e);
        }}
      >
        <Dynamic component={DevelopmentCardTypes[props.card.type].description} />
      </TooltipContent>
    </Tooltip>
  );
}
