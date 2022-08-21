import { defineConfig, presetAttributify, presetIcons, presetUno } from "unocss"

export default defineConfig({
  presets: [presetAttributify(), presetIcons(), presetUno()],
  shortcuts: [
    [
      "title",
      "title-color font-100 text-4rem my-4rem mx-a max-w-14rem uppercase leading-1 sm:max-w-none",
    ],
    [
      "increment",
      "py-1rem px-2rem title-color inc-bg-1 b-rd-2rem w-200px b-solid b-2 inc-border outline-none tabular-nums active:inc-bg-2 focus:b-title-color",
    ],
  ],
  rules: [
    ["title-color", { color: "#335d92" }],
    [
      /^inc-bg-(\d+)$/,
      ([, d]) => ({ "background-color": `rgba(68, 107, 158, 0.${d})` }),
    ],
    ["w-200px", { width: "200px" }],
    ["inc-border", { "border-color": "rgba(68, 107, 158, 0)" }],
  ],
  theme: {
    breakpoints: {
      sm: "480px",
    },
  },
})
