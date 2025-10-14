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

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-4 w-screen h-screen items-center justify-center break-words">
      <Card className="min-w-[25rem]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-bold">Log in to your account</CardTitle>
          <CardDescription>Enter your Wilma credentials below to log in</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">
                  Username
                </FieldLabel>
                <Input
                id="username"
                type="username"
                placeholder="matti.heikkinen"
                required />
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
                <PasswordInput id="password" required />
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