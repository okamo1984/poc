/** @jsx h */
import { Fragment, h } from "preact";
import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { tw } from "twind";

import { Button } from "../components/Button.tsx";
import { NewUser } from "../models/user.ts";

type InputEvent = JSX.TargetedEvent<HTMLInputElement, Event>;
type FormEvent = JSX.TargetedEvent<HTMLFormElement, Event>;

type TextInputProps = {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email";
  value: string;
  onChange: JSX.EventHandler<InputEvent>;
};

function TextInput({
  id,
  label,
  placeholder,
  type,
  value,
  onChange,
}: TextInputProps) {
  return (
    <Fragment>
      <label
        class={tw`block text-gray-700 text-sm font-bold mb-2`}
        for="username"
      >
        {label}
      </label>
      <input
        class={tw`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
        id={id}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
    </Fragment>
  );
}

const defaultNewUser: NewUser = {
  username: "",
  password: "",
  email: "",
};

export default function Form() {
  const [formData, setFormData] = useState<NewUser>(defaultNewUser);
  const [newUser, setNewUser] = useState<NewUser | null>(null);

  const registerNewUser = async (ev: FormEvent) => {
    ev.preventDefault();
    const registerRes = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const registeredUser: NewUser = await registerRes.json();
    setFormData(defaultNewUser);
    setNewUser(registeredUser);
  };

  return (
    <div class={tw`max-w-lg rounded overflow-hidden shadow-lg`}>
      <div class={tw`px-6 py-4`}>
        <div class={tw`font-bold text-xl mb-2`}>Registration</div>
        <form onSubmit={registerNewUser}>
          <div class={tw`mb-4`}>
            <TextInput
              id="username"
              label="Username"
              placeholder="Username"
              type="text"
              value={formData.username}
              onChange={(ev: InputEvent) =>
                setFormData({ ...formData, username: ev.currentTarget.value })}
            />
          </div>
          <div class={tw`mb-4`}>
            <TextInput
              id="password"
              label="Password"
              placeholder="********"
              type="text"
              value={formData.password}
              onChange={(ev: InputEvent) =>
                setFormData({ ...formData, password: ev.currentTarget.value })}
            />
          </div>
          <div class={tw`mb-4`}>
            <TextInput
              id="email"
              label="Email"
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(ev: InputEvent) =>
                setFormData({ ...formData, email: ev.currentTarget.value })}
            />
          </div>
          <div>
            <Button>Submit</Button>
          </div>
        </form>
      </div>
      {newUser && (
        <div class={tw`px-6 py-4`}>
          <div class={tw`font-bold text-xl mb-2`}>Registered User</div>
          <div class={tw`mb-4 text-gray-700 text-sm font-bold mb-2`}>
            {newUser.username}
          </div>
          <div class={tw`mb-4 text-gray-700 text-sm font-bold mb-2`}>
            {newUser.password}
          </div>
          <div class={tw`mb-4 text-gray-700 text-sm font-bold mb-2`}>
            {newUser.email}
          </div>
        </div>
      )}
    </div>
  );
}
