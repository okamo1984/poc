import { Title } from "solid-start"
import Counter from "~/components/Counter"

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1 class="title title-color">Hello world!</h1>
      <Counter />
      <p class="sm:max-w-none">
        Visit{" "}
        <a href="https://docs.solidjs.com/start" target="_blank">
          docs.solidjs.com/start
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  )
}
