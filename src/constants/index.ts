import { shadeHexColor } from "../utils";

export const RESOURCES: Resource[] = ["brick", "lumber", "wool", "grain", "ore"];

export const Colors = [
  "#0FA3B1",
  "#F7A072",
  "#B388EB",
  "#FFE74C",
  "#304C89",
  "#84E296",
  "#317B22",
  "#726DA8",
  "#C6362F"
];

export const PlayerColours = Colors.slice(0, 4);

export const SandColor = "#fde68a";

export const DiceColors = {
  dice: ["#373F51", "#E43F6F"],
  dot: "#FAFFD8"
};

export const Limit = {
  Roads: 15,
  Settlements: 5,
  Cities: 4
};

export const Icons = {
  brick: { emoji: "🧱", code: "&#129521;" },
  lumber: { emoji: "🪵", code: "&#129717;" },
  ore: { emoji: "🪨", code: "&#129704;" },
  grain: { emoji: "🌾", code: "&#127806;" },
  wool: { emoji: "🐑", code: "&#128017;" },
  desert: { emoji: "🏜️", code: "&#127964;" },
  trade: { emoji: "💰", code: "&#128176;" },
  robber: { emoji: "🥷", code: "&#129399" }
} as const;

export const Resource: Record<
  Hex["type"],
  { color: string; borderColor: string; icon: string; iconCode: string }
> = {
  brick: {
    icon: Icons.brick.emoji,
    iconCode: Icons.brick.code,
    color: "#A25353",
    borderColor: shadeHexColor("#A25353", -0.3)
  },
  lumber: {
    icon: Icons.lumber.emoji,
    iconCode: Icons.lumber.code,
    color: "#3F923A",
    borderColor: shadeHexColor("#3F923A", -0.3)
  },
  ore: {
    icon: Icons.ore.emoji,
    iconCode: Icons.ore.code,
    color: "#98B0C3",
    borderColor: shadeHexColor("#98B0C3", -0.3)
  },
  grain: {
    icon: Icons.grain.emoji,
    iconCode: Icons.grain.code,
    color: "#fece41",
    borderColor: shadeHexColor("#fece41", -0.3)
  },
  wool: {
    icon: Icons.wool.emoji,
    iconCode: Icons.wool.code,
    color: "#86CD82",
    borderColor: shadeHexColor("#86CD82", -0.3)
  },
  desert: {
    icon: Icons.desert.emoji,
    iconCode: Icons.desert.code,
    color: "#feb536",
    borderColor: shadeHexColor("#feb536", -0.3)
  }
};

export const ROBBER_ROLL = 7;
export const DESERT_VALUE = ROBBER_ROLL;
