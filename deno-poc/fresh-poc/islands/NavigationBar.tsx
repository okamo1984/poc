/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Button } from "../components/Button.tsx";
import { LoginUser } from "../models/user.ts";

type Props = {
  loginUser?: LoginUser;
  loginUrl: string;
};

export default function NavigationBar({ loginUser, loginUrl }: Props) {
  const login = () => {
    window.location.href = loginUrl;
  };
  return (
    <header
      class={tw`flex items-center justify-between fixed top-0 z-40 w-full bg-white-90 backdrop-blur border-b-1 border-transparent lt-md:!border-gray-200/60 h-16 px-8 lt-md:!px-4`}
    >
      <div />
      <div>
        {loginUser
          ? (
            <div class={tw`flex items-center h-8 gap-1.5 relative`}>
              <img
                class={tw`w-8 h-8 rounded-full cursor-pointer`}
                src={loginUser.avatarUrl}
                alt={loginUser.name}
              />
            </div>
          )
          : <Button onClick={login}>Sign in</Button>}
      </div>
    </header>
  );
}
