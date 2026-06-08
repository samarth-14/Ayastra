type Props = {
  title: string;
  value: string;
  subtitle: string;
};

export default function AnalyticsCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <div className="bg-[#1B2940] rounded-3xl p-6 min-h-[220px]">
      <h3 className="text-slate-400 text-lg">
        {title}
      </h3>

      <p className="text-white text-3xl font-bold mt-6">
        {value}
      </p>

      <p className="text-slate-400 mt-4 text-sm">
        {subtitle}
      </p>
    </div>
  );
}