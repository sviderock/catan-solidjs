import { Resource } from "../../constants";

export default function BuildingCosts() {
  return (
    <div class="flex min-w-[250px] flex-col gap-1 divide-y rounded-sm border  px-4 py-1">
      <span class="text-[1.2rem]">Building Costs</span>
      <div class="flex items-center justify-between gap-4 py-1">
        <span>Road</span>
        <span>
          {Resource.lumber.icon}
          {Resource.brick.icon}
        </span>
      </div>
      <div class="flex items-center justify-between gap-4 py-1">
        <span>Settlement</span>
        <span>
          {Resource.lumber.icon}
          {Resource.brick.icon}
          {Resource.grain.icon}
          {Resource.wool.icon}
        </span>
      </div>
      <div class="flex items-center justify-between gap-4 py-1">
        <span>City</span>
        <span>
          {Resource.grain.icon}
          {Resource.grain.icon}
          {Resource.ore.icon}
          {Resource.ore.icon}
          {Resource.ore.icon}
        </span>
      </div>
      <div class="flex items-center justify-between gap-4 py-1">
        <span>Development Card</span>
        <span>
          {Resource.grain.icon}
          {Resource.wool.icon}
          {Resource.ore.icon}
        </span>
      </div>
    </div>
  );
}
