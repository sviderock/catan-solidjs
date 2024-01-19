import { shadeHexColor } from "../utils";

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

export const Resource: Record<
  Hex["type"],
  { color: string; borderColor: string; icon: string; iconCode: string }
> = {
  brick: {
    icon: "🧱",
    color: "#A25353",
    borderColor: shadeHexColor("#A25353", -0.3),
    iconCode: "&#129521;"
  },
  lumber: {
    icon: "🪵",
    color: "#3F923A",
    borderColor: shadeHexColor("#3F923A", -0.3),
    iconCode: "&#129717;"
  },
  ore: {
    icon: "🪨",
    color: "#98B0C3",
    borderColor: shadeHexColor("#98B0C3", -0.3),
    iconCode: "&#129704;"
  },
  grain: {
    icon: "🌾",
    color: "#fece41",
    borderColor: shadeHexColor("#fece41", -0.3),
    iconCode: "&#127806;"
  },
  wool: {
    icon: "🐑",
    color: "#86CD82",
    borderColor: shadeHexColor("#86CD82", -0.3),
    iconCode: "&#128017;"
  },
  desert: {
    icon: "🏜️",
    color: "#feb536",
    borderColor: shadeHexColor("#feb536", -0.3),
    iconCode: "&#127964;"
  }
};

export const RobberIcon = "🥷";
export const RobberCode = "&#129399;";
