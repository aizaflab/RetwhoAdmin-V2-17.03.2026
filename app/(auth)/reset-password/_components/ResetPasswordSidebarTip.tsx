import type { ResetPasswordTipItem } from "../_types";

type Props = {
  tip: ResetPasswordTipItem;
};

export default function ResetPasswordSidebarTip({ tip }: Props) {
  const { icon: Icon, title, description } = tip;

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl center shrink-0 bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="text-sm font-medium mb-1 text-foreground">{title}</h4>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
