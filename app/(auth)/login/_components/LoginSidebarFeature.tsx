import type { LoginFeatureItem } from "../_types";

type Props = {
  feature: LoginFeatureItem;
};

export default function LoginSidebarFeature({ feature }: Props) {
  const { icon: Icon, title, description } = feature;

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg center shrink-0 dark:bg-darkBorder/50 bg-primary/5">
        <Icon className="w-5 h-5 text-darkLight" />
      </div>
      <div>
        <h4 className="text-sm font-medium mb-1 dark:text-white text-black/70">
          {title}
        </h4>
        <p className="text-xs leading-relaxed text-black/50 dark:text-white/50">
          {description}
        </p>
      </div>
    </div>
  );
}
