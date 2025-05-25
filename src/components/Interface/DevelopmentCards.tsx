import DevelopmentCard from "@/components/Interface/DevelopmentCard";
import ResourcePicker, { type ResourcePickerProps } from "@/components/ResourcePicker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RESOURCES } from "@/constants";
import { currentPlayer, exachange, opponents, playDevelopmentCard, setState, state } from "@/state";
import { resourceCount } from "@/utils";
import { FaRegularCircleCheck } from "solid-icons/fa";
import { Show, batch, createMemo, createSignal } from "solid-js";

export default function DevelopmentCards() {
  const cardStatusCount = createMemo(() => {
    return currentPlayer()
      .developmentCards.filter(
        (card): card is PlayableDevelopmentCard => card.type !== "victory_point"
      )
      .reduce(
        (acc, card) => {
          acc[card.type][card.status]++;
          return acc;
        },
        {
          knight: { deck: 0, available: 0, ready_next_turn: 0, played: 0 },
          monopoly: { deck: 0, available: 0, ready_next_turn: 0, played: 0 },
          year_of_plenty: { deck: 0, available: 0, ready_next_turn: 0, played: 0 },
          road_building: { deck: 0, available: 0, ready_next_turn: 0, played: 0 },
        } as { [K in PlayableDevelopmentCard["type"]]: Record<DevelopmentCardStatus, number> }
      );
  });

  return (
    <div class="flex h-full flex-col gap-4 justify-self-end">
      <div class="flex gap-2">
        <h3>Development card:</h3>
        <Show when={state.game.playedDevelopmentCard} fallback={<div>Not played</div>}>
          <div class="flex items-center gap-1 text-green-500">
            Played <FaRegularCircleCheck />
          </div>
        </Show>
      </div>
      <div class="flex gap-2">
        <Knight count={cardStatusCount().knight} available={cardStatusCount().knight.available} />
        <Monopoly
          count={cardStatusCount().monopoly}
          available={cardStatusCount().monopoly.available}
        />
        <RoadBuilding
          count={cardStatusCount().road_building}
          available={cardStatusCount().road_building.available}
        />
        <YearOfPlenty
          count={cardStatusCount().year_of_plenty}
          available={cardStatusCount().year_of_plenty.available}
        />
      </div>
    </div>
  );
}

function Knight(props: { count: Record<DevelopmentCardStatus, number>; available: number }) {
  function playKnight() {
    batch(() => {
      playDevelopmentCard("knight");
      setState("robber", "status", "select_hex_and_player");
    });
  }

  return (
    <DevelopmentCard
      cardType="knight"
      statusCount={props.count}
      disabled={!props.available || !!state.game.playedDevelopmentCard}
      onClick={playKnight}
    />
  );
}

function Monopoly(props: { count: Record<DevelopmentCardStatus, number>; available: number }) {
  const [open, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal<Resource | null>(null);

  function playMonopoly() {
    if (!selected()) return;

    const type = selected()!;
    batch(() => {
      playDevelopmentCard("monopoly");
      let res = 0;
      opponents().forEach((player) => {
        res += player.resources()[type];
        player.setResources((res) => ({ ...res, [type]: 0 }));
      });
      exachange([{ idx: currentPlayer().idx, add: { [type]: res } }]);
      setSelected(null);
      setOpen(false);
    });
  }

  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        as={DevelopmentCard}
        cardType="monopoly"
        statusCount={props.count}
        disabled={!props.available || !!state.game.playedDevelopmentCard}
      />

      <PopoverContent class="flex flex-col gap-2">
        <PopoverArrow />
        <span>Select resource to take from other players:</span>
        <div class="flex items-center gap-2">
          <ResourcePicker selected={selected()} onPick={setSelected} />
          <Button variant="success" onClick={playMonopoly} disabled={!selected()}>
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RoadBuilding(props: { count: Record<DevelopmentCardStatus, number>; available: number }) {
  function playRoadBuilding() {
    batch(() => {
      playDevelopmentCard("road_building");
      //TODO
    });
  }

  return (
    <DevelopmentCard
      cardType="road_building"
      statusCount={props.count}
      disabled={!props.available || !!state.game.playedDevelopmentCard}
      onClick={playRoadBuilding}
    />
  );
}

function YearOfPlenty(props: { count: Record<DevelopmentCardStatus, number>; available: number }) {
  const [open, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal<Partial<PlayerResources>>({});
  const allSelected = createMemo(() => resourceCount(selected()) === 2);
  const disabled = createMemo(() =>
    RESOURCES.reduce<NonNullable<ResourcePickerProps["disabled"]>>((acc, res) => {
      acc[res] = allSelected() && !selected()[res];
      return acc;
    }, {})
  );

  function playYearOfPlenty() {
    if (!allSelected()) return;

    batch(() => {
      playDevelopmentCard("year_of_plenty");
      exachange([{ idx: currentPlayer().idx, add: selected() }]);
      setSelected({});
      setOpen(false);
    });
  }

  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        as={DevelopmentCard}
        cardType="year_of_plenty"
        statusCount={props.count}
        disabled={!props.available || !!state.game.playedDevelopmentCard}
      />

      <PopoverContent>
        <PopoverArrow />
        <span>Take 2 resources from the bank:</span>
        <div class="flex items-center gap-2">
          <ResourcePicker
            multiple
            selected={selected()}
            disabled={disabled()}
            onPick={(res) => {
              setSelected((val) => {
                const allCount = resourceCount(val);
                const newCount = (val[res] || 0) + 1;
                return {
                  ...val,
                  [res]: newCount === 3 || allCount + 1 === 3 ? undefined : newCount,
                };
              });
            }}
          />
          <Button variant="success" onClick={playYearOfPlenty} disabled={!allSelected()}>
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
