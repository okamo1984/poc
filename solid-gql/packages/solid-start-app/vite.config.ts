import solid from "solid-start/vite"
import { defineConfig } from "vite"
import Unocss from "unocss/vite"
import { presetAttributify, presetUno, presetIcons } from "unocss"

export default defineConfig({
  plugins: [
    solid(),
    Unocss({
      shortcuts: {
        title:
          "title-color font-100 text-4rem my-4rem mx-a max-w-14rem uppercase leading-1 sm:max-w-none",
      },
      presets: [presetAttributify(), presetUno(), presetIcons()],
      theme: {
        breakpoints: {
          sm: "480px",
        },
      },
      rules: [["title-color", { color: "#335d92" }]],
      preflights: [
        {
          getCSS: () => `
          body {
            font-family: Gordita, Roboto, Oxygen, Ubuntu, Cantarell,
              'Open Sans', 'Helvetica Neue', sans-serif;
          }
          main {
            text-align: center;
            padding: 1em;
            margin: 0 auto;
          }
          a {
            margin-right: 1rem;
          }          
          p {
            max-width: 14rem;
            margin: 2rem auto;
            line-height: 1.35;
          }
          `,
        },
      ],
    }),
  ],
  build: {
    target: "esnext",
  },
})
