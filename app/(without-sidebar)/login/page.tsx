"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'next-intl';
import { getSchools } from "@/lib/wilma_api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, Form, useForm } from "react-hook-form"
import * as z from "zod"



export default function LoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [schools, setSchools] = useState<{ label: string; value: string }[]>([]);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Login");

  const formSchema = z.object({
    school: z
      .string()
      .min(1, "School is required."),
    username: z
      .string()
      .min(1, "Username is required."),
    password: z
      .string()
      .min(1, "Password is required."),
  })

  // complex search functionality to first show results that start with the search and then show results that include the search
  const filteredSchools = schools
    .filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      const searchLower = search.toLowerCase();

      const aStarts = aLabel.startsWith(searchLower);
      const bStarts = bLabel.startsWith(searchLower);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aLabel.localeCompare(bLabel);
    });

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [search]);


  useEffect(() => {
    async function loadWilmas() {
      try {
        const urls = await getSchools();
        const mapped = urls.map((url: string) => ({
          label: url.replace("https://", ""), // remove https:// prefix
          value: url,
        }));
        setSchools(
          mapped.sort((a: { label: string; value: string }, b: { label: string; value: string }) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
        );
      } catch (err) {
        console.error("Failed to fetch Wilmas", err);
      }
    }

    loadWilmas();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      school: "",
      username: "",
      password: "",
    },
    shouldFocusError: false
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    form.trigger("school"); // force re-rendering instantly to prevent unwanted delay before changing to red color on error
    form.setError("root", { message: "Username or password is wrong."});
    form.setError("username", { message: ""});
    form.setError("password", { message: ""});
    console.log("You submitted the following values:", JSON.stringify(data, null, 2));
  }

  return (
    <div className="flex flex-col gap-4 w-screen h-screen items-center justify-center break-words">
      <Card className="min-w-[25rem]">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-bold">{t("welcome_back")}</CardTitle>
          <CardDescription>{t("log_in_with_your_wilma_account")}</CardDescription>
        </CardHeader>
        <FieldSeparator/>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="school"
                control={form.control}
                render={({ field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-form-school">
                      {t("school")}
                    </FieldLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={`w-[15rem] justify-between ${fieldState.invalid ? "border-destructive ring-1 ring-destructive hover:text-destructive transition-none" : ""}`}

                        >
                          {field.value
                            ? schools.find((schools) => schools.value === field.value)?.label
                            : t("select_school")}
                          <ChevronsUpDownIcon className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[15rem] p-0">
                        <Command>
                          <CommandInput placeholder={t("search_schools")} className="h-9" onValueChange={(val) => setSearch(val)} />
                          <CommandList ref={listRef}>
                            <CommandEmpty>{t("no_schools_found")}</CommandEmpty>
                            <CommandGroup>
                              {filteredSchools.map((school) => (
                                <CommandItem
                                  id="login-form-school"
                                  key={school.value}
                                  value={school.value}
                                  onSelect={(currentValue) => {
                                    setOpen(false);
                                    setSearch("");
                                    field.onChange(currentValue);
                                    form.clearErrors();
                                  }}
                                  aria-invalid={fieldState.invalid}
                                >
                                  {school.label}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto",
                                      field.value === school.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  </Field>
                )}
              />
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-form-username">
                      {t("username")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="login-form-username"
                      placeholder={t("example_username")}
                      aria-invalid={fieldState.invalid}
                      autoComplete="username"
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors();
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="login-form-password">
                        {t("password")}
                      </FieldLabel>
                      <a
                        href="https://espoo.inschool.fi/forgotpasswd"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        {t("forgot_password")}
                      </a>
                    </div>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id="login-form-password"
                        type={isPasswordVisible ? "" : "password"}
                        aria-invalid={fieldState.invalid}
                        autoComplete="current-password"
                        onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors();
                      }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton variant="ghost" className="rounded-full" size="icon-xs" onClick={() => { setIsPasswordVisible(!isPasswordVisible) }}>
                          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {form.formState.errors.root && (
                <FieldError errors={[form.formState.errors.root]} />
              )}
              <Field>
                <Button
                  type="submit" 
                  form="login-form"
                  disabled={form.formState.isSubmitting}>
                  {t("login")}
                  </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center break-words max-w-[25rem]">
        {t("privacy_notice_1")} <a href="/terms-of-service">{t("privacy_notice_2")}</a>{" "}
        {t("privacy_notice_3")} <a href="/privacy-policy">{t("privacy_notice_4")}</a>.
      </FieldDescription>
    </div>
  )
}