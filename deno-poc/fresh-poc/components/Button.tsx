/** @jsx h */
import { h } from "preact";
import { apply, tw } from "twind";
import { Spinner } from "./Spinner.tsx";

type ButtonProps = {
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: string;
};

export function Button({ loading, disabled, onClick, children }: ButtonProps) {
  return (
    <button
      className={tw(
        apply`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          disabled && "cursor-not-allowed"
        }`,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
