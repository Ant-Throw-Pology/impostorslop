# impostorslop

Helper for the word game Impostor that I vibe-coded because the one we were using had too many ads.

## Rules

- Each player is randomly assigned a role: **Impostor** or **Crewmate**.
- A secret word is shown to all crewmates. Impostors do _not_ see it.
- Players take turns saying a word related to the secret word. No word may be repeated, and you cannot say the secret word itself.
- Impostors must bluff and figure out the topic from what others say.
- After 2 rounds, players vote on who they think the impostors are.
- Impostors are revealed, then they get one chance to guess the secret word.

## Usage

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
