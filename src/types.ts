export type Screen = "init" | "play" | "end";

export interface Player {
  id: string;
  name: string;
}

let counter = 0;
export function makeId(): string {
  return `${Date.now()}-${++counter}`;
}
