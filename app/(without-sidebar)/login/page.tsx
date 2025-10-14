"use client";

import { useState, useEffect, useRef } from "react";
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
import { Separator } from "@radix-ui/react-separator";

export default function LoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [schools, setSchools] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const filteredSchools = schools
  .filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => {
    const aLabel = a.label.toLowerCase();
    const bLabel = b.label.toLowerCase();
    const searchLower = search.toLowerCase();

    const aStarts = aLabel.startsWith(searchLower);
    const bStarts = bLabel.startsWith(searchLower);

    // If one starts with search and the other doesn't, the one that starts comes first
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Otherwise sort alphabetically
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
      } finally {
        setLoading(false);
      }
    }

    loadWilmas();
  }, []);

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
        <FieldSeparator/>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>
                  School
                </FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[15rem] justify-between"
                    >
                      {value
                        ? schools.find((schools) => schools.value === value)?.label
                        : "Select school..."}
                      <ChevronsUpDownIcon className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[15rem] p-0">
                    <Command>
                      <CommandInput placeholder="Search schools..." className="h-9" onValueChange={(val) => setSearch(val)} />
                      <CommandList ref={listRef}>
                        <CommandEmpty>No schools found.</CommandEmpty>
                        <CommandGroup>
                          {filteredSchools.map((school) => (
                            <CommandItem
                              key={school.value}
                              value={school.value}
                              onSelect={(currentValue) => {
                                setValue(currentValue === value ? "" : currentValue)
                                setOpen(false)
                              }}
                            >
                              {school.label}
                              <CheckIcon
                                className={cn(
                                  "ml-auto",
                                  value === school.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">
                  Username
                </FieldLabel>
                <Input
                  id="username"
                  type="username"
                  name="username"
                  placeholder="firstname.lastname"
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
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type={isPasswordVisible ? "" : "password"}
                    name="password"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton variant="ghost" className="rounded-full" size="icon-xs" onClick={() => { setIsPasswordVisible(!isPasswordVisible) }}>
                      {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
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