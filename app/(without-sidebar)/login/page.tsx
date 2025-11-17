"use client";

import { redirect } from "next/navigation";
import schoolList from "@/lib/school-list";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

export default function LoginPage() {
    const t = useTranslations("Login");
    const [loadingSchools, setLoadingSchools] = useState(true);
    const [schools, setSchools] = useState<{ label: string; value: string }[]>(
        []
    );
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const formSchema = z.object({
        school: z.string().min(1, t("schoolIsRequired")),
        username: z.string().min(1, t("usernameIsRequired")),
        password: z.string().min(1, t("passwordIsRequired")),
        rememberSchool: z.boolean(),
    });

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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            school: "",
            username: "",
            password: "",
            rememberSchool: false,
        },
        shouldFocusError: false,
    });

    useEffect(() => {
        setLoadingSchools(true);

        // load remembered school
        const rememberedSchool = localStorage.getItem("school");
        if (rememberedSchool) {
            form.setValue("school", rememberedSchool);
            form.setValue("rememberSchool", true);
        }

        const mapped = schoolList.map((subdomain) => ({
            label: `${subdomain}.inschool.fi`,
            value: `https://${subdomain}.inschool.fi`,
        }));

        setSchools(
            mapped.sort((a, b) =>
                a.label.toLowerCase().localeCompare(b.label.toLowerCase())
            )
        );
        setLoadingSchools(false);
    }, [form]);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        // send the login request through the internal API
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                school: data.school,
                username: data.username,
                password: data.password,
            }),
        });

        const login_data = await res.json();
        if (login_data.success) {
            // store the school if wanted, else delete it
            if (data.rememberSchool) {
                localStorage.setItem("school", data.school);
            } else {
                localStorage.removeItem("school");
            }

            // redirect to home page
            redirect("/home");
        } else {
            console.error("Login failed", login_data.message);
            // force re-rendering instantly to prevent unwanted delay before changing to red color on error
            form.trigger("school");

            // set errors to the fields
            form.setError("root", { message: t("usernameOrPasswordIsWrong") });
            form.setError("username", { message: "" });
            form.setError("password", { message: "" });
        }
    }

    return (
        <div className="flex flex-col gap-4 w-screen h-screen items-center justify-center break-words">
            <Card className="min-w-[25rem]">
                <CardHeader className="flex flex-col items-center">
                    <CardTitle className="text-2xl font-bold">
                        {t("welcomeBack")}
                    </CardTitle>
                    <CardDescription>
                        {t("logInWithYourWilmaAccount")}
                    </CardDescription>
                    <CardDescription className="text-center text-yellow-400">
                        REVIEWER: login to school &quot;espoondemo.inschool.fi&quot;,
                        username &quot;oppilas&quot;, password &quot;oppilas&quot;
                    </CardDescription>
                </CardHeader>
                <FieldSeparator />
                <CardContent>
                    <form
                        id="login-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup>
                            <Controller
                                name="school"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="login-form-school">
                                            {t("school")}
                                        </FieldLabel>
                                        {loadingSchools ? (
                                            <Skeleton className="h-[2.25rem]" />
                                        ) : (
                                            <Popover
                                                open={open}
                                                onOpenChange={setOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={open}
                                                        className={`w-[15rem] justify-between ${
                                                            fieldState.invalid
                                                                ? "border-destructive ring-1 ring-destructive hover:text-destructive transition-none"
                                                                : ""
                                                        }`}
                                                    >
                                                        {field.value
                                                            ? schools.find(
                                                                  (schools) =>
                                                                      schools.value ===
                                                                      field.value
                                                              )?.label
                                                            : t("selectSchool")}
                                                        <ChevronsUpDownIcon className="opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[15rem] p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder={t(
                                                                "searchSchools"
                                                            )}
                                                            className="h-9"
                                                            onValueChange={(
                                                                val
                                                            ) => setSearch(val)}
                                                        />
                                                        <CommandList
                                                            ref={listRef}
                                                        >
                                                            <CommandEmpty>
                                                                {t(
                                                                    "noSchoolsFound"
                                                                )}
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {filteredSchools.map(
                                                                    (
                                                                        school
                                                                    ) => (
                                                                        <CommandItem
                                                                            id="login-form-school"
                                                                            key={
                                                                                school.value
                                                                            }
                                                                            value={
                                                                                school.value
                                                                            }
                                                                            onSelect={(
                                                                                currentValue
                                                                            ) => {
                                                                                setOpen(
                                                                                    false
                                                                                );
                                                                                setSearch(
                                                                                    ""
                                                                                );
                                                                                field.onChange(
                                                                                    currentValue
                                                                                );
                                                                                form.clearErrors();
                                                                            }}
                                                                            aria-invalid={
                                                                                fieldState.invalid
                                                                            }
                                                                        >
                                                                            {
                                                                                school.label
                                                                            }
                                                                            <CheckIcon
                                                                                className={cn(
                                                                                    "ml-auto",
                                                                                    field.value ===
                                                                                        school.value
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    )
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
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
                                            placeholder={t(
                                                "usernamePlaceholder"
                                            )}
                                            aria-invalid={fieldState.invalid}
                                            autoComplete="username"
                                            onChange={(e) => {
                                                field.onChange(e);
                                                form.clearErrors();
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
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
                                                {t("forgotPassword")}
                                            </a>
                                        </div>
                                        <InputGroup>
                                            <InputGroupInput
                                                {...field}
                                                id="login-form-password"
                                                type={
                                                    isPasswordVisible
                                                        ? ""
                                                        : "password"
                                                }
                                                aria-invalid={
                                                    fieldState.invalid
                                                }
                                                autoComplete="current-password"
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    form.clearErrors();
                                                }}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupButton
                                                    variant="ghost"
                                                    className="rounded-full"
                                                    size="icon-xs"
                                                    onClick={() => {
                                                        setIsPasswordVisible(
                                                            !isPasswordVisible
                                                        );
                                                    }}
                                                >
                                                    {isPasswordVisible ? (
                                                        <EyeOffIcon />
                                                    ) : (
                                                        <EyeIcon />
                                                    )}
                                                </InputGroupButton>
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            {form.formState.errors.root && (
                                <FieldError
                                    errors={[form.formState.errors.root]}
                                />
                            )}
                            <Controller
                                name="rememberSchool"
                                control={form.control}
                                render={({ field }) => (
                                    <Field orientation="horizontal">
                                        {loadingSchools ? (
                                            <Skeleton className="h-[1rem] w-[1rem] rounded-[0.25rem]" />
                                        ) : (
                                            <Checkbox
                                                id="login-form-remember-school"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                        <FieldLabel htmlFor="login-form-remember-school">
                                            {t("rememberSchool")}
                                        </FieldLabel>
                                    </Field>
                                )}
                            />
                            <Field>
                                <Button
                                    type="submit"
                                    form="login-form"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {t("login")}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center break-words max-w-[25rem]">
                {t("privacyPolicy1")}{" "}
                <a href="/terms-of-service">{t("privacyPolicy2")}</a>{" "}
                {t("privacyPolicy3")}{" "}
                <a href="/privacy-policy">{t("privacyPolicy4")}</a>.
            </FieldDescription>
        </div>
    );
}
