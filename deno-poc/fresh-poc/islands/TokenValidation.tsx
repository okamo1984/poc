/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { useState } from "preact/hooks";

import Form from "../components/Form.tsx";
import { Button } from "../components/Button.tsx";
import { ValidatedToken } from "../models/user.ts";

export default function TokenValidation() {
  const [validated, setValidated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState({ validation: false, refresh: false });
  const [expire, setExpire] = useState(0);

  const validateToken = async () => {
    setValidated(null);
    setLoading({ ...loading, validation: true });
    const validationRes = await fetch("/api/auth/validate");
    const validatedToken: ValidatedToken = await validationRes.json();
    setLoading({ ...loading, validation: false });
    setValidated(validatedToken.isValid);
    setExpire(validatedToken.expire!);
  };

  const refreshToken = async () => {
    setLoading({ ...loading, refresh: true });
    await fetch("/api/auth/refresh");
    setLoading({ ...loading, refresh: false });
    setValidated(null);
  };

  return (
    <div class={tw`flex flex-col w-full`}>
      <div class={tw`inline-flex space-x-4 my-4`}>
        <Button
          onClick={validateToken}
          loading={loading.validation}
          disabled={validated === false}
        >
          Validate token
        </Button>
        <div class={tw`self-center`}>
          {validated !== null &&
            (validated
              ? (
                <span class={tw`text-green-500 font-semibold`}>
                  {`Token is valid (Expire in ${
                    new Date(
                      expire * 1000,
                    ).toISOString()
                  })`}
                </span>
              )
              : (
                <span class={tw`text-red-500 font-semibold`}>
                  Token is invalid, let's refresh token
                </span>
              ))}
        </div>
      </div>
      {validated === false && (
        <div class={tw`my-4`}>
          <Button
            onClick={refreshToken}
            loading={loading.refresh}
            disabled={validated}
          >
            Refresh token
          </Button>
        </div>
      )}
      {validated && <Form />}
    </div>
  );
}
