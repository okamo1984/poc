import React, { useRef } from "react";

type SelectFileProps = {
  accept: string;
  handleSelect: (fileName: string) => void;
};

export function SelectFile({ accept, handleSelect }: SelectFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!inputRef?.current) {
      return;
    }
    const files = inputRef.current.files;
    if (!files) {
      return;
    }
    handleSelect(files[0].name);
  };
  return (
    <input
      type="file"
      id="selectFile"
      accept={accept}
      ref={inputRef}
      onChange={handleChange}
    />
  );
}
