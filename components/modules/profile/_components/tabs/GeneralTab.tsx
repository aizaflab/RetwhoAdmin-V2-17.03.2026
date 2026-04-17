"use client";

import { User, Mail, Phone, MapPin, Globe, Building2 } from "lucide-react";
import { Section } from "../shared/Section";
import { FieldInput } from "../shared/FieldInput";
import { SaveButton } from "../shared/SaveButton";
import { GeneralFormData } from "../../_types/profile.types";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";

interface GeneralTabProps {
  data: GeneralFormData;
  onChange: (data: GeneralFormData) => void;
  saveStatus: "idle" | "saving" | "saved";
  onSave: () => void;
}

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
          <Input
            label="Full Name"
            value={data.name}
            onChange={() => set("name")}
            startIcon={<User className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <Input
            label="Username"
            value={data.username}
            onChange={() => set("username")}
            startIcon={<User className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <Input
            label="Email Address"
            value={data.email}
            onChange={() => set("email")}
            startIcon={<Mail className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
            disabled
          />

          <Input
            label="Phone Number"
            value={data.phone}
            onChange={() => set("phone")}
            startIcon={<Phone className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <Input
            label="Location"
            value={data.location}
            onChange={() => set("location")}
            startIcon={<MapPin className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <Input
            label="Department"
            value={data.department}
            onChange={() => set("department")}
            startIcon={<Building2 className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <Input
            label="Website"
            value={data.website}
            onChange={() => set("website")}
            startIcon={<Globe className="size-4.5" />}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <div className="sm:col-span-2">
            <Textarea
              label="Bio"
              value={data.bio}
              onChange={() => set("bio")}
              className=" dark:border-darkBorder dark:focus:border-darkLight/50"
              rows={3}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Locale & Preferences"
        desc="Set your preferred language and timezone."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Language"
            value={data.language}
            onChange={(e) => set("language")(e.target.value)}
            options={[
              { value: "en", label: "English (US)" },
              { value: "bn", label: "বাংলা (Bengali)" },
            ]}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />

          <Select
            label="Timezone"
            value={data.timezone}
            onChange={(e) => set("timezone")(e.target.value)}
            options={[
              { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
              { value: "UTC", label: "UTC (GMT+0)" },
              { value: "Europe/London", label: "Europe/London (GMT+1)" },
            ]}
            className="h-10 dark:border-darkBorder dark:focus:border-darkLight/50"
          />
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
