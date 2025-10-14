"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import { useEffect } from "react";
import { WilmaSession } from "@/lib/wilma_api"

export default function LoginPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // prevent the default form submission behavior
    e.preventDefault();

    // get the data from the input fields
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    // send the login request through the internal API
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
      console.log("Logged in!", data);
    } else {
      console.error("Login failed", data.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-screen h-screen items-center justify-center break-words">
      <Card className="min-w-[25rem]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Log in with your Wilma account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="username"
                  name="username"
                  placeholder="matti.heikkinen"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="https://espoo.inschool.fi/forgotpasswd"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <PasswordInput
                  id="password"
                  type="password"
                  name="password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit">Log in</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center break-words max-w-[25rem]">
        By clicking continue, you agree to our <a href="/terms-of-service">Terms of Service</a>{" "}
        and <a href="/privacy-policy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}