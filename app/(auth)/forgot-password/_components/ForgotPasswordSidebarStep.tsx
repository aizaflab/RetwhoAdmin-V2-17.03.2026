import type { ForgotPasswordStepItem } from "../_types";

type Props = {
  item: ForgotPasswordStepItem;
  isActive?: boolean;
};

export default function ForgotPasswordSidebarStep({ item, isActive }: Props) {
  const { step, icon: Icon, title, description } = item;

  return (
    <div className="flex items-start gap-4">
      {/* Step number bubble */}
      <div className="relative shrink-0">
        <div
          className={`size-9 rounded-full flex items-center justify-center text-sm font-semibold border transition-colors ${
            isActive
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-primary/10 border-border text-primary"
          }`}
        >
          {step}
        </div>
      </div>

      {/* Icon + text */}
      <div className="flex-1 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <Icon
            className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
          />
          <h4
            className={`text-sm font-medium ${
              isActive ? "text-foreground" : "text-foreground/80"
            }`}
          >
            {title}
          </h4>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
