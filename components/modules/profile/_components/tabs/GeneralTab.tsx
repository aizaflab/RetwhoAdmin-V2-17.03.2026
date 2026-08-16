"use client";

import { User, Mail, Phone, MapPin, Globe, Building2 } from "lucide-react";
import { Section } from "../shared/Section";
import { GeneralFormData } from "../../_types/profile.types";
import { Field, FieldLabel, Input, Textarea } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";

interface GeneralTabProps {
  data: GeneralFormData;
  onChange: (data: GeneralFormData) => void;
  saveStatus: "idle" | "saving" | "saved";
  onSave: () => void;
}

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: "en", label: "English (US)" },
  { value: "bn", label: "বাংলা (Bengali)" },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "Europe/London", label: "Europe/London (GMT+1)" },
];

export default function GeneralTab({
  data,
  onChange,
  saveStatus,
  onSave,
}: GeneralTabProps) {
  const set = (key: keyof GeneralFormData) => (v: string) =>
    onChange({ ...data, [key]: v });

  return (
    <div className="space-y-8">
      <Section
        title="Personal Information"
        desc="Update your name, bio, and contact details."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="profile-name">Full Name</FieldLabel>
            <Input
              id="profile-name"
              name="name"
              value={data.name}
              onValueChange={set("name")}
              startIcon={<User className="size-4.5" />}
              className="h-10 bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-username">Username</FieldLabel>
            <Input
              id="profile-username"
              name="username"
              value={data.username}
              onValueChange={set("username")}
              startIcon={<User className="size-4.5" />}
              className="h-10 bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-email">Email Address</FieldLabel>
            <Input
              id="profile-email"
              name="email"
              type="email"
              value={data.email}
              onValueChange={set("email")}
              startIcon={<Mail className="size-4.5" />}
              className="h-10 bg-transparent"
              disabled
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-phone">Phone Number</FieldLabel>
            <Input
              id="profile-phone"
              name="phone"
              type="tel"
              value={data.phone}
              onValueChange={set("phone")}
              startIcon={<Phone className="size-4.5" />}
              className="h-10 bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-location">Location</FieldLabel>
            <Input
              id="profile-location"
              name="location"
              value={data.location}
              onValueChange={set("location")}
              startIcon={<MapPin className="size-4.5" />}
              className="h-10 bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-department">Department</FieldLabel>
            <Input
              id="profile-department"
              name="department"
              value={data.department}
              onValueChange={set("department")}
              startIcon={<Building2 className="size-4.5" />}
              className="h-10 bg-transparent"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-website">Website</FieldLabel>
            <Input
              id="profile-website"
              name="website"
              type="url"
              value={data.website}
              onValueChange={set("website")}
              startIcon={<Globe className="size-4.5" />}
              className="h-10 bg-transparent"
            />
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
            <Textarea
              id="profile-bio"
              name="bio"
              rows={3}
              value={data.bio}
              onChange={(e) => set("bio")(e.target.value)}
              className="bg-transparent"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Locale & Preferences"
        desc="Set your preferred language and timezone."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel id="profile-language-label" htmlFor="profile-language">
              Language
            </FieldLabel>
            <Select
              id="profile-language"
              value={data.language}
              onValueChange={set("language")}
            >
              <SelectTrigger className="h-10">
                <SelectValue
                  placeholder="Select language"
                  options={LANGUAGE_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={LANGUAGE_OPTIONS} />
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel id="profile-timezone-label" htmlFor="profile-timezone">
              Timezone
            </FieldLabel>
            <Select
              id="profile-timezone"
              value={data.timezone}
              onValueChange={set("timezone")}
            >
              <SelectTrigger className="h-10">
                <SelectValue
                  placeholder="Select timezone"
                  options={TIMEZONE_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={TIMEZONE_OPTIONS} />
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <div className="flex justify-end pt-5">
        <Button onClick={onSave} disabled={saveStatus === "saving"}>
          {saveStatus === "saving" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
